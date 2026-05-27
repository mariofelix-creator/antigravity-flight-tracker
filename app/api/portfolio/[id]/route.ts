import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/portfolio/[id] ──────────────────────────────────────────────────
// Returns the detail of a specific investment owned by the authenticated user.

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: investment, error } = await supabase
    .from("investments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(`[GET /api/portfolio/${id}]`, error.message);
    return NextResponse.json({ error: "Failed to fetch investment" }, { status: 500 });
  }

  if (!investment) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  return NextResponse.json({ data: investment });
}

// ─── DELETE /api/portfolio/[id] ───────────────────────────────────────────────
// Marks an investment as 'sold'. Does not physically delete the row so that
// users retain historical data for reporting.

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the investment first to validate ownership and current status.
  const { data: existing, error: fetchError } = await supabase
    .from("investments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error(`[DELETE /api/portfolio/${id}] fetch:`, fetchError.message);
    return NextResponse.json({ error: "Failed to fetch investment" }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  if (existing.status === "sold") {
    return NextResponse.json(
      { error: "Investment has already been sold" },
      { status: 409 }
    );
  }

  // Mark as sold.
  const { data: updated, error: updateError } = await supabase
    .from("investments")
    .update({ status: "sold" })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError || !updated) {
    console.error(`[DELETE /api/portfolio/${id}] update:`, updateError?.message);
    return NextResponse.json({ error: "Failed to sell investment" }, { status: 500 });
  }

  // Update portfolio totals to reflect the sold investment.
  const { data: pf, error: pfFetchError } = await supabase
    .from("portfolios")
    .select("total_invested, current_value")
    .eq("id", existing.portfolio_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!pfFetchError && pf) {
    const saleValue = existing.current_price * existing.shares;
    const newTotalInvested = Math.max(0, pf.total_invested - existing.amount_usd);
    const newCurrentValue = Math.max(0, pf.current_value - saleValue);
    const newReturnPct =
      newTotalInvested > 0
        ? parseFloat(
            (((newCurrentValue - newTotalInvested) / newTotalInvested) * 100).toFixed(4)
          )
        : 0;

    await supabase
      .from("portfolios")
      .update({
        total_invested: newTotalInvested,
        current_value: newCurrentValue,
        return_pct: newReturnPct,
      })
      .eq("id", existing.portfolio_id);
  }

  return NextResponse.json({ data: updated });
}
