import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import webPush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";
import { parseBody, sendNotificationSchema } from "@/lib/validations";
import type { NotificationInsert, DBPushSubscription } from "@/lib/supabase/types";

// Configure VAPID credentials once at module load time.
// These values must be set in the environment; the module will throw if they
// are missing at runtime (fail-fast is intentional for infrastructure errors).
function configureWebPush(): void {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@microguard.app";

  if (!publicKey || !privateKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY environment variables."
    );
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
}

// ─── POST /api/notifications/send ─────────────────────────────────────────────
// Sends a Web Push notification to a specific user.
// This endpoint is restricted to requests that carry the Supabase service-role
// key in the Authorization header (i.e. only trusted server-to-server calls
// or Supabase Edge Functions should call this).
//
// Body: { userId, title, body, url?, urgent? }

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Authorization: only the service role may call this endpoint.
  // We verify by attempting to use the admin client — if the service role key
  // is not set the createAdminClient call will throw.
  const authorization = request.headers.get("authorization");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "Server misconfiguration: service role key not set" },
      { status: 500 }
    );
  }

  // Accept either "Bearer <service_role_key>" or the key directly.
  const providedKey = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : authorization;

  if (providedKey !== serviceRoleKey) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseBody(sendNotificationSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 422 });
  }

  const { userId, title, body: notifBody, url, urgent } = parsed.data;

  // Use admin client to bypass RLS and read any user's subscriptions.
  const supabase = await createAdminClient();

  // Fetch all push subscriptions for this user.
  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (subError) {
    console.error("[POST /api/notifications/send] fetch subscriptions:", subError.message);
    return NextResponse.json(
      { error: "Failed to fetch push subscriptions" },
      { status: 500 }
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json(
      { error: "No push subscriptions found for this user" },
      { status: 404 }
    );
  }

  // Configure VAPID on each invocation (safe to call multiple times).
  try {
    configureWebPush();
  } catch (err) {
    const message = err instanceof Error ? err.message : "VAPID configuration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const payload = JSON.stringify({
    title,
    body: notifBody,
    url: url ?? "/dashboard",
    urgent: urgent ?? false,
    timestamp: Date.now(),
  });

  const pushOptions: webPush.RequestOptions = {
    urgency: urgent ? "high" : "normal",
    TTL: urgent ? 60 : 86400, // seconds: 1 min for urgent, 24 h otherwise
  };

  // Send to all registered devices concurrently; collect results.
  const sendResults = await Promise.allSettled(
    subscriptions.map((sub) =>
      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload,
        pushOptions
      )
    )
  );

  // Remove expired / invalid subscriptions (HTTP 410 Gone).
  const expiredEndpoints: string[] = [];
  sendResults.forEach((result, index) => {
    if (result.status === "rejected") {
      const err = result.reason as { statusCode?: number };
      if (err?.statusCode === 410) {
        expiredEndpoints.push(subscriptions[index].endpoint);
      } else {
        console.warn("[POST /api/notifications/send] push failed:", result.reason);
      }
    }
  });

  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints)
      .eq("user_id", userId);
  }

  // Persist the notification record for in-app inbox.
  const notificationRecord: NotificationInsert = {
    user_id: userId,
    title,
    body: notifBody,
    type: urgent ? "alert" : "update",
    read: false,
    sent_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase.from("notifications").insert(notificationRecord);

  if (insertError) {
    // Non-fatal: the push was already sent; log but don't fail the request.
    console.warn("[POST /api/notifications/send] insert notification record:", insertError.message);
  }

  const successCount = sendResults.filter((r) => r.status === "fulfilled").length;
  const failureCount = sendResults.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    data: {
      sent: successCount,
      failed: failureCount,
      expiredRemoved: expiredEndpoints.length,
    },
  });
}
