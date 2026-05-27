import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const { riskProfile, investmentGoal, maxInvestmentUsd } = parsed.data;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        risk_profile: riskProfile,
        investment_goal: investmentGoal,
        max_investment_usd: maxInvestmentUsd,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
