import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getTargetUsers, markCampaignSent, shouldSendToUser } from "@/lib/campaigns/scheduler";

// Protected by admin API key — not exposed to regular users
function verifyAdminKey(request: Request): boolean {
  const key = request.headers.get("x-admin-key");
  return key === process.env.ADMIN_API_KEY && !!key;
}

function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      campaignId: string;
      targetAudience?: "all" | "conservative" | "moderate" | "aggressive";
    };
    const { campaignId, targetAudience = "all" } = body;

    if (!campaignId) {
      return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("is_active", true)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found or inactive" }, { status: 404 });
    }

    // Determine target profiles
    const targetProfiles = targetAudience === "all"
      ? null
      : [targetAudience];

    const users = await getTargetUsers(targetProfiles);

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        // Check push
        const canSendPush = await shouldSendToUser(user.user_id, campaignId, "push");
        if (canSendPush) {
          // Get push subscriptions for user
          const { data: subs } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", user.user_id);

          if (subs && subs.length > 0) {
            // Trigger push via internal API (avoids importing web-push directly here)
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-admin-key": process.env.ADMIN_API_KEY ?? "",
              },
              body: JSON.stringify({
                userId: user.user_id,
                title: campaign.title,
                body: campaign.description,
                url: "/dashboard/campaigns",
                urgent: false,
              }),
            });

            await markCampaignSent(user.user_id, campaignId, "push");
            sent++;
          }
        }

        // In-app notification
        const canSendInApp = await shouldSendToUser(user.user_id, campaignId, "in_app");
        if (canSendInApp) {
          await supabase.from("notifications").insert({
            user_id: user.user_id,
            title: campaign.title,
            body: campaign.description,
            type: "offer",
            read: false,
          });
          await markCampaignSent(user.user_id, campaignId, "in_app");
        }
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      data: { sent, failed, total: users.length, campaignId },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
