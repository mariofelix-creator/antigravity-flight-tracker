import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Uses service role client — only call from server-side cron/admin routes
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase admin credentials");
  return createClient<Database>(url, key);
}

const URGENCY_THRESHOLD_HOURS = 6;
const MIN_HOURS_BETWEEN_EMAILS = 20;

/** Returns campaigns expiring within the urgency threshold */
export async function getCampaignsNearExpiry() {
  const supabase = getAdminClient();
  const thresholdTime = new Date(
    Date.now() + URGENCY_THRESHOLD_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("is_active", true)
    .not("expires_at", "is", null)
    .lte("expires_at", thresholdTime)
    .gte("expires_at", new Date().toISOString());

  if (error) throw error;
  return data ?? [];
}

/** Checks if a user already received this campaign on a given channel recently */
export async function shouldSendToUser(
  userId: string,
  campaignId: string,
  channel: "email" | "push" | "in_app"
): Promise<boolean> {
  const supabase = getAdminClient();
  const cutoff = new Date(
    Date.now() - MIN_HOURS_BETWEEN_EMAILS * 60 * 60 * 1000
  ).toISOString();

  const { data } = await supabase
    .from("campaign_deliveries")
    .select("id")
    .eq("user_id", userId)
    .eq("campaign_id", campaignId)
    .eq("channel", channel)
    .gte("sent_at", cutoff)
    .limit(1);

  return !data || data.length === 0;
}

/** Records that a campaign was sent to a user on a channel */
export async function markCampaignSent(
  userId: string,
  campaignId: string,
  channel: "email" | "push" | "in_app"
) {
  const supabase = getAdminClient();
  await supabase
    .from("campaign_deliveries")
    .upsert({ user_id: userId, campaign_id: campaignId, channel })
    .onConflict("user_id,campaign_id,channel");
}

/** Gets users whose risk_profile matches the campaign's target_profiles */
export async function getTargetUsers(
  targetProfiles: string[] | null
): Promise<Array<{ user_id: string; full_name: string | null }>> {
  const supabase = getAdminClient();

  let query = supabase
    .from("profiles")
    .select("user_id, full_name")
    .eq("onboarding_complete", true);

  if (targetProfiles && targetProfiles.length > 0) {
    query = query.in("risk_profile", targetProfiles);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Sends urgency reminders for campaigns near expiry */
export async function checkAndSendUrgencyReminders(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
}> {
  const campaigns = await getCampaignsNearExpiry();
  let processed = 0;
  let sent = 0;
  let skipped = 0;

  for (const campaign of campaigns) {
    const users = await getTargetUsers(
      campaign.target_profiles as string[] | null
    );

    for (const user of users) {
      processed++;
      const canSend = await shouldSendToUser(user.user_id, campaign.id, "push");
      if (!canSend) {
        skipped++;
        continue;
      }

      // Record delivery (actual push send happens via /api/notifications/send)
      await markCampaignSent(user.user_id, campaign.id, "push");
      sent++;
    }
  }

  return { processed, sent, skipped };
}
