import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateRecommendations } from "@/lib/ai/recommendations";
import type { RecommendationInsert } from "@/lib/supabase/types";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found. Complete onboarding first." }, { status: 404 });
    }

    if (!profile.risk_profile || !profile.investment_goal) {
      return NextResponse.json({ error: "Complete your onboarding before getting recommendations." }, { status: 400 });
    }

    // Check for fresh recommendations (< 24h old)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from("recommendations")
      .select("*")
      .eq("user_id", user.id)
      .eq("acted_on", false)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(3);

    if (cached && cached.length > 0) {
      return NextResponse.json({
        data: {
          recommendations: cached,
          generatedAt: cached[0].created_at,
          nextRefresh: cached[0].expires_at,
          source: "cache",
        },
      });
    }

    // Get current portfolio for context
    const { data: investments } = await supabase
      .from("investments")
      .select("asset_symbol")
      .eq("user_id", user.id)
      .eq("status", "active");

    const currentSymbols = investments?.map((i) => i.asset_symbol) ?? [];

    // Generate fresh recommendations
    const result = await generateRecommendations({
      risk_profile: profile.risk_profile,
      investment_goal: profile.investment_goal,
      max_investment_usd: profile.max_investment_usd,
      currentPortfolioSymbols: currentSymbols,
    });

    // Persist recommendations
    const inserts: RecommendationInsert[] = result.recommendations.map((r) => ({
      user_id: user.id,
      asset_symbol: r.assetSymbol,
      asset_name: r.assetName,
      confidence_score: r.confidenceScore,
      reasoning: r.reasoning,
      suggested_amount: r.suggestedAmount,
      risk_level: r.riskLevel,
      expected_return_pct: r.expectedReturnPct,
      expires_at: r.expiresAt,
      acted_on: false,
    }));

    const { data: saved, error: saveError } = await supabase
      .from("recommendations")
      .insert(inserts)
      .select();

    if (saveError) {
      // Return AI results even if save fails
      return NextResponse.json({ data: { ...result, source: result.source } });
    }

    return NextResponse.json({
      data: {
        recommendations: saved,
        generatedAt: result.generatedAt,
        nextRefresh: result.nextRefresh,
        source: result.source,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as { recommendationId: string; invested: boolean };
    const { recommendationId, invested } = body;

    if (!recommendationId) {
      return NextResponse.json({ error: "recommendationId is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("recommendations")
      .update({ acted_on: true })
      .eq("id", recommendationId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true, invested } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
