import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { parseBody, pushSubscriptionSchema } from "@/lib/validations";
import type { PushSubscription } from "@/lib/supabase/types";

// ─── POST /api/notifications/subscribe ────────────────────────────────────────
// Saves a Web Push subscription for the authenticated user.
// If the same endpoint already exists for this user it is replaced (upsert)
// so that re-subscribing after a browser permission reset works correctly.
//
// Body: { endpoint: string; keys: { p256dh: string; auth: string } }

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseBody(pushSubscriptionSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 422 });
  }

  const { endpoint, keys } = parsed.data;

  // Upsert so that re-registrations (e.g. after clearing browser data)
  // update the keys for the same endpoint rather than creating duplicates.
  const { data: subscription, error: upsertError } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      {
        onConflict: "user_id,endpoint",
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (upsertError || !subscription) {
    console.error("[POST /api/notifications/subscribe]", upsertError?.message);
    return NextResponse.json(
      { error: "Failed to save push subscription" },
      { status: 500 }
    );
  }

  const result: PushSubscription = subscription;
  return NextResponse.json({ data: result }, { status: 201 });
}
