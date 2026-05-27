import React from "react";
import { ShieldAlert } from "lucide-react";
import { OfferCard } from "@/components/campaigns/OfferCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MockCampaign {
  id: string;
  title: string;
  description: string;
  assetSymbol: string;
  minInvestment: number;
  maxReturnPct: number;
  expiresAt: string | null;
}

// ─── Mock data — matches the assets from seed.sql (VOO, GOVT, GLD) ───────────

const MOCK_CAMPAIGNS: MockCampaign[] = [
  {
    id: "camp-voo",
    title: "Vanguard S&P 500 ETF — VOO",
    description:
      "Acceso diversificado a las 500 empresas más grandes de EE.UU. Ideal para inversión de largo plazo con bajo costo de mantenimiento.",
    assetSymbol: "VOO",
    minInvestment: 50,
    maxReturnPct: 10.4,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "camp-govt",
    title: "iShares U.S. Treasury Bond — GOVT",
    description:
      "Bonos del Tesoro de EE.UU. de corto, medio y largo plazo. Alta seguridad y liquidez, menor volatilidad que la renta variable.",
    assetSymbol: "GOVT",
    minInvestment: 25,
    maxReturnPct: 3.8,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "camp-gld",
    title: "SPDR Gold Shares — GLD",
    description:
      "Exposición al precio del oro sin necesidad de custodiarlo físicamente. Buena cobertura frente a inflación y volatilidad del mercado.",
    assetSymbol: "GLD",
    minInvestment: 30,
    maxReturnPct: 6.1,
    expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), // urgente: 10 horas
  },
];

const MOCK_CONFIDENCE_SCORES: Record<string, number> = {
  "camp-voo": 87,
  "camp-govt": 74,
  "camp-gld": 68,
};

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 px-6 text-center">
      {/* Simple SVG illustration */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="14" stroke="#1da86a" strokeWidth="2" />
          <path
            d="M10 18 L14 14 L18 17 L22 12"
            stroke="#1da86a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="12" r="2" fill="#1da86a" />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-slate-700">
        Sin oportunidades disponibles
      </h3>
      <p className="max-w-xs text-sm text-slate-500">
        Nuevas oportunidades pronto. Te notificaremos cuando haya algo que
        encaje con tu perfil de inversión.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const campaigns = MOCK_CAMPAIGNS;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Oportunidades para ti
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Basadas en tu perfil de riesgo y objetivos de inversión
        </p>
      </div>

      {/* Campaign grid or empty state */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {campaigns.map((campaign) => (
            <OfferCard
              key={campaign.id}
              campaign={campaign}
              confidenceScore={MOCK_CONFIDENCE_SCORES[campaign.id]}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Legal disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
        <ShieldAlert
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-amber-700">
          <strong>Aviso legal importante.</strong> Las recomendaciones de
          MicroGuard son generadas por un sistema automatizado y no constituyen
          asesoramiento financiero personalizado. Toda inversión conlleva riesgo
          de pérdida del capital invertido. Los rendimientos históricos no
          garantizan resultados futuros. Antes de invertir, evalúa si el
          producto es adecuado para tus objetivos y situación financiera.
        </p>
      </div>
    </div>
  );
}
