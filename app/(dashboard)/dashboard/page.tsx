import React from "react";
import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { AIRecommendationCard } from "@/components/dashboard/AIRecommendationCard";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { InvestmentRow } from "@/components/dashboard/InvestmentRow";
import { CampaignBanner } from "@/components/dashboard/CampaignBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Investment, Campaign } from "@/lib/supabase/types";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_INVESTMENTS: Investment[] = [
  {
    id: "inv-1",
    portfolio_id: "port-1",
    user_id: "user-1",
    asset_symbol: "VOO",
    asset_name: "Vanguard S&P 500 ETF",
    asset_type: "etf",
    amount_usd: 150.0,
    shares: 0.385,
    entry_price: 389.5,
    current_price: 412.2,
    return_pct: 5.83,
    status: "active",
    created_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "inv-2",
    portfolio_id: "port-1",
    user_id: "user-1",
    asset_symbol: "BND",
    asset_name: "Bono Total Bond Market",
    asset_type: "bond",
    amount_usd: 80.0,
    shares: 10.12,
    entry_price: 79.05,
    current_price: 80.33,
    return_pct: 1.62,
    status: "active",
    created_at: "2026-04-15T09:30:00Z",
  },
  {
    id: "inv-3",
    portfolio_id: "port-1",
    user_id: "user-1",
    asset_symbol: "GLD",
    asset_name: "SPDR Gold Shares",
    asset_type: "etf",
    amount_usd: 70.0,
    shares: 0.308,
    entry_price: 227.2,
    current_price: 234.85,
    return_pct: 3.37,
    status: "active",
    created_at: "2026-05-01T11:00:00Z",
  },
];

const MOCK_RECOMMENDATION = {
  assetName: "Vanguard Total Market ETF",
  assetSymbol: "VTI",
  confidenceScore: 87,
  reasoning:
    "Basado en tu perfil moderado, VTI es ideal ahora. Este fondo diversifica tu dinero en más de 3,500 empresas del mercado estadounidense. Históricamente ha crecido un 11.2% anual, con volatilidad manejable.",
  suggestedAmount: 60,
  riskLevel: "moderate" as const,
};

const MOCK_CAMPAIGN: Campaign = {
  id: "camp-1",
  title: "ETFs sin comisión este mes",
  description:
    "Invierte en cualquier ETF de nuestro catálogo sin comisiones hasta el 31 de mayo. Aprovecha y diversifica.",
  offer_type: "investment",
  asset_symbol: null,
  min_investment: 10,
  max_return_pct: 15.3,
  expires_at: "2026-05-31T23:59:59Z",
  is_active: true,
  created_at: "2026-05-01T00:00:00Z",
};

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const totalInvested = MOCK_INVESTMENTS.reduce(
    (sum, inv) => sum + inv.amount_usd,
    0
  );
  const currentValue = MOCK_INVESTMENTS.reduce((sum, inv) => {
    const current = inv.amount_usd * (1 + inv.return_pct / 100);
    return sum + current;
  }, 0);
  const todayGain = currentValue - totalInvested;
  const totalReturnPct =
    totalInvested > 0
      ? ((currentValue - totalInvested) / totalInvested) * 100
      : 0;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* 1. Hero financiero — summary cards */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Resumen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Total invertido"
            value={`$${totalInvested.toFixed(2)}`}
            change={0}
            variant="neutral"
          />
          <SummaryCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Ganancia total"
            value={`$${todayGain.toFixed(2)}`}
            change={totalReturnPct}
            variant="positive"
          />
          <SummaryCard
            icon={<BarChart3 className="h-4 w-4" />}
            label="Retorno total"
            value={`${totalReturnPct > 0 ? "+" : ""}${totalReturnPct.toFixed(2)}%`}
            change={totalReturnPct}
            variant={totalReturnPct >= 0 ? "positive" : "negative"}
          />
        </div>
      </section>

      {/* 2. IA Recomienda */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recomendación IA
        </h2>
        <AIRecommendationCard recommendation={MOCK_RECOMMENDATION} />
      </section>

      {/* 3. Gráfico distribución cartera */}
      <section>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribución de cartera</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <PortfolioChart />
          </CardContent>
        </Card>
      </section>

      {/* 4. Gráfico rendimiento 30 días */}
      <section>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rendimiento — 30 días</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <PerformanceChart />
          </CardContent>
        </Card>
      </section>

      {/* 5. Inversiones activas */}
      <section>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Inversiones activas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {MOCK_INVESTMENTS.map((inv) => (
              <InvestmentRow key={inv.id} investment={inv} />
            ))}
          </CardContent>
        </Card>
      </section>

      {/* 6. Banner de oferta */}
      <section>
        <CampaignBanner campaign={MOCK_CAMPAIGN} />
      </section>
    </div>
  );
}
