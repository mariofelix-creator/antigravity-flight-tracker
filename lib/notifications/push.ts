import webPush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ─── VAPID configuration ──────────────────────────────────────────────────────

// Only configure VAPID if keys are present — avoids crashing at import time
// in environments that don't use push (e.g. pure email workers).
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail =
  process.env.VAPID_EMAIL ?? "mailto:admin@microguard.app";

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  urgent?: boolean;
  actions?: Array<{ action: string; title: string }>;
}

interface PushSubscriptionKeys {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ─── Core send function ───────────────────────────────────────────────────────

/**
 * Sends a single push notification to a specific subscription endpoint.
 * Throws on failure so the caller can decide whether to clean up the record.
 */
export async function sendPushNotification(
  subscription: PushSubscriptionKeys,
  payload: PushPayload
): Promise<void> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[push] VAPID keys not set — skipping push notification");
    }
    return;
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };

  const serializedPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/dashboard",
    tag: payload.tag,
    urgent: payload.urgent ?? false,
    actions: payload.actions ?? [],
  });

  await webPush.sendNotification(pushSubscription, serializedPayload);
}

// ─── User-level send function ─────────────────────────────────────────────────

/**
 * Sends a push notification to all active subscriptions for a given user.
 *
 * - Queries `push_subscriptions` from Supabase for the user.
 * - Sends to each subscription in parallel.
 * - Automatically removes subscriptions that return a 410 (Gone) status,
 *   which means the browser has unregistered them.
 *
 * @returns Object with `sent` count (success) and `failed` count (error, non-410).
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
  supabaseServiceClient: SupabaseClient<Database>
): Promise<{ sent: number; failed: number }> {
  // 1. Fetch all subscriptions for the user
  const { data: subscriptions, error: fetchError } =
    await supabaseServiceClient
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", userId);

  if (fetchError) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[push] Failed to fetch subscriptions:", fetchError.message);
    }
    return { sent: 0, failed: 0 };
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  // 2. Send to all subscriptions in parallel
  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      await sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      return sub.id;
    })
  );

  // 3. Process results — collect expired subscriptions for cleanup
  let sent = 0;
  let failed = 0;
  const expiredIds: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const sub = subscriptions[i];

    if (result.status === "fulfilled") {
      sent++;
    } else {
      const err = result.reason as { statusCode?: number } | Error;
      const statusCode =
        "statusCode" in err ? (err as { statusCode: number }).statusCode : 0;

      if (statusCode === 410) {
        // 410 Gone: browser unregistered, clean up
        expiredIds.push(sub.id);
      } else {
        failed++;
        if (process.env.NODE_ENV !== "production") {
          console.error(
            `[push] Failed to send to subscription ${sub.id}:`,
            err
          );
        }
      }
    }
  }

  // 4. Clean up expired subscriptions
  if (expiredIds.length > 0) {
    const { error: deleteError } = await supabaseServiceClient
      .from("push_subscriptions")
      .delete()
      .in("id", expiredIds);

    if (deleteError && process.env.NODE_ENV !== "production") {
      console.error(
        "[push] Failed to delete expired subscriptions:",
        deleteError.message
      );
    }
  }

  return { sent, failed };
}
