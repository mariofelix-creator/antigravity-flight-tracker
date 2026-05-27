import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Campaign, RiskProfile } from "@/lib/supabase/types";

// Risk profile → compatible offer types map.
// Conservative users see educational content and low-risk offerings.
// Aggressive users see all offer types.
const RISK_OFFER_TYPES: Record<RiskProfile, string[]> = {
  conservative: ["educational", "alert"],
  moderate: ["educational", "alert", "investment"],
  aggressive: ["educational", "alert", "investment"],
};

// ─── GET /api/campaigns ────────────────────────────────────────────────────────
// Returns active campaigns.
//
// Query params:
//   userId (optional) — when provided, the response is filtered to campaigns
//                       that match the user's risk profile.

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get("userId");

  // Build the base query: only active, non-expired campaigns.
  let query = supabase
    .from("campaigns")
    .select("*")
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("created_at", { ascending: false });

  // If a userId was passed, personalise the results based on the user's
  // risk profile — but only if the caller is authenticated as that user
  // (or is an admin).
  if (requestedUserId) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Allow the request if the authenticated user matches the queried userId.
    // If not authenticated or mismatched, we still return all active campaigns
    // without personalisation (graceful degradation).
    if (!authError && user && user.id === requestedUserId) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("risk_profile")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profileError && profile?.risk_profile) {
        const allowedTypes = RISK_OFFER_TYPES[profile.risk_profile];
        // Cast via unknown because the Supabase client type requires a
        // specific union literal, but we're passing a runtime array.
        query = query.in("offer_type", allowedTypes) as typeof query;
      }
    }
  }

  const { data: campaigns, error } = await query;

  if (error) {
    console.error("[GET /api/campaigns]", error.message);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }

  const result: Campaign[] = campaigns ?? [];
  return NextResponse.json({ data: result });
}
