import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { parseBody, investmentSchema } from "@/lib/validations";
import type { Investment, Portfolio, PortfolioWithInvestments } from "@/lib/supabase/types";

// ─── GET /api/portfolio ────────────────────────────────────────────────────────
// Returns the authenticated user's portfolio and all their investments.

export async function GET(): Promise<NextResponse> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch or lazily create the user's default portfolio.
  let portfolio: Portfolio | null = null;

  const { data: existingPortfolios, error: portfolioFetchError } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (portfolioFetchError) {
    console.error("[GET /api/portfolio] fetch portfolio:", portfolioFetchError.message);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }

  if (!existingPortfolios) {
    // Create a default portfolio on first access.
    const { data: created, error: createError } = await supabase
      .from("portfolios")
      .insert({
        user_id: user.id,
        name: "Mi Portafolio",
        total_invested: 0,
        current_value: 0,
        return_pct: 0,
      })
      .select()
      .single();

    if (createError || !created) {
      console.error("[GET /api/portfolio] create portfolio:", createError?.message);
      return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 });
    }

    portfolio = created;
  } else {
    portfolio = existingPortfolios;
  }

  // Fetch all investments for this portfolio.
  const portfolioId = (portfolio as { id: string }).id;
  const { data: investments, error: investmentError } = await supabase
    .from("investments")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (investmentError) {
    console.error("[GET /api/portfolio] fetch investments:", investmentError.message);
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 });
  }

  const result: PortfolioWithInvestments = {
    ...(portfolio as PortfolioWithInvestments),
    investments: (investments ?? []) as Investment[],
  };

  return NextResponse.json({ data: result });
}

// ─── POST /api/portfolio/invest ────────────────────────────────────────────────
// Creates a new investment for the authenticated user.
// Body: { assetSymbol, assetName, assetType, amountUsd, portfolioId? }

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

  const parsed = parseBody(investmentSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 422 });
  }

  const { assetSymbol, assetName, assetType, amountUsd, portfolioId } = parsed.data;

  // Resolve the portfolio to use.
  let resolvedPortfolioId: string;

  if (portfolioId) {
    // Verify the portfolio belongs to this user.
    const { data: pf, error: pfError } = await supabase
      .from("portfolios")
      .select("id")
      .eq("id", portfolioId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (pfError || !pf) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    resolvedPortfolioId = pf.id;
  } else {
    // Use the first portfolio or create one.
    const { data: defaultPf, error: defaultPfError } = await supabase
      .from("portfolios")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (defaultPfError) {
      return NextResponse.json({ error: "Failed to resolve portfolio" }, { status: 500 });
    }

    if (!defaultPf) {
      const { data: newPf, error: newPfError } = await supabase
        .from("portfolios")
        .insert({
          user_id: user.id,
          name: "Mi Portafolio",
          total_invested: 0,
          current_value: 0,
          return_pct: 0,
        })
        .select("id")
        .single();

      if (newPfError || !newPf) {
        return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 });
      }

      resolvedPortfolioId = newPf.id;
    } else {
      resolvedPortfolioId = defaultPf.id;
    }
  }

  // We treat the entry price as 1.00 and calculate shares as amountUsd / entryPrice.
  // In a real integration this would come from a market-data API.
  const entryPrice = 1.0;
  const shares = parseFloat((amountUsd / entryPrice).toFixed(6));

  const investmentInsert = {
    portfolio_id: resolvedPortfolioId,
    user_id: user.id,
    asset_symbol: assetSymbol,
    asset_name: assetName,
    asset_type: assetType,
    amount_usd: amountUsd,
    shares,
    entry_price: entryPrice,
    current_price: entryPrice,
    return_pct: 0,
    status: "pending" as const,
  };

  const { data: investment, error: insertError } = await supabase
    .from("investments")
    .insert(investmentInsert)
    .select()
    .single();

  if (insertError || !investment) {
    console.error("[POST /api/portfolio] insert investment:", insertError?.message);
    return NextResponse.json({ error: "Failed to create investment" }, { status: 500 });
  }

  // Update portfolio totals.
  const { data: updatedPf, error: pfUpdateError } = await supabase
    .from("portfolios")
    .select("total_invested, current_value")
    .eq("id", resolvedPortfolioId)
    .single();

  if (!pfUpdateError && updatedPf) {
    const newTotalInvested = updatedPf.total_invested + amountUsd;
    const newCurrentValue = updatedPf.current_value + amountUsd;
    const newReturnPct =
      newTotalInvested > 0
        ? parseFloat((((newCurrentValue - newTotalInvested) / newTotalInvested) * 100).toFixed(4))
        : 0;

    await supabase
      .from("portfolios")
      .update({
        total_invested: newTotalInvested,
        current_value: newCurrentValue,
        return_pct: newReturnPct,
      })
      .eq("id", resolvedPortfolioId);
  }

  const result: Investment = investment;
  return NextResponse.json({ data: result }, { status: 201 });
}
