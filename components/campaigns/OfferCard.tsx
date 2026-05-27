"use client";

import * as React from "react";
import { Megaphone, Clock, TrendingUp, DollarSign, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OfferCampaign {
  id: string;
  title: string;
  description: string;
  assetSymbol: string;
  minInvestment: number;
  maxReturnPct: number;
  expiresAt: string | null;
}

interface OfferCardProps {
  campaign: OfferCampaign;
  confidenceScore?: number;
  onInvest: (campaignId: string, amount: number) => void;
  onDismiss?: (campaignId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeRemaining(expiresAt: string | null): {
  label: string;
  isUrgent: boolean;
} {
  if (!expiresAt) return { label: "Sin límite", isUrgent: false };

  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { label: "Expirada", isUrgent: false };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return { label: `${minutes} minutos`, isUrgent: true };
  }
  if (hours < 24) {
    return { label: `${hours} hora${hours !== 1 ? "s" : ""}`, isUrgent: hours < 12 };
  }
  return { label: `${days} día${days !== 1 ? "s" : ""}`, isUrgent: false };
}

function getRiskFromReturn(maxReturnPct: number): string {
  if (maxReturnPct < 5) return "Bajo";
  if (maxReturnPct < 12) return "Medio";
  return "Alto";
}

function getRiskBadgeClass(risk: string): string {
  if (risk === "Bajo") return "bg-brand-50 text-brand-700 border-brand-200";
  if (risk === "Medio") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-red-50 text-red-700 border-red-200";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OfferCard({
  campaign,
  confidenceScore,
  onInvest,
  onDismiss,
}: OfferCardProps) {
  const { label: timeLabel, isUrgent } = getTimeRemaining(campaign.expiresAt);
  const risk = getRiskFromReturn(campaign.maxReturnPct);
  const riskClass = getRiskBadgeClass(risk);

  function handleInvest() {
    onInvest(campaign.id, campaign.minInvestment);
  }

  function handleDismiss() {
    onDismiss?.(campaign.id);
  }

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md overflow-hidden",
        isUrgent && "border-orange-200"
      )}
    >
      {/* Header with soft green gradient */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-600 px-5 pt-5 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Asset symbol pill */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 font-mono text-sm font-bold text-white">
              {campaign.assetSymbol.slice(0, 4)}
            </div>
            <div>
              {/* Asset type badge */}
              <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                Inversión
              </span>
            </div>
          </div>

          {/* Urgency badge */}
          {isUrgent && (
            <span className="flex items-center gap-1 rounded-full bg-orange-400/90 px-2.5 py-1 text-xs font-bold text-white">
              <Clock className="h-3 w-3" />
              Urgente
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-bold leading-tight text-white">
          {campaign.title}
        </h3>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Description — max 2 lines */}
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {campaign.description}
        </p>

        {/* Metrics row */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 p-2.5 text-center">
            <div className="mb-0.5 flex items-center justify-center gap-1 text-slate-400">
              <DollarSign className="h-3 w-3" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              ${campaign.minInvestment.toLocaleString("es-MX")}
            </p>
            <p className="text-[10px] text-slate-400">Desde</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-2.5 text-center">
            <div className="mb-0.5 flex items-center justify-center gap-1 text-slate-400">
              <TrendingUp className="h-3 w-3" />
            </div>
            <p className="text-xs font-semibold text-brand-700">
              +{campaign.maxReturnPct}%
            </p>
            <p className="text-[10px] text-slate-400">Retorno est.</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-2.5 text-center">
            <div className="mb-0.5 flex items-center justify-center gap-1 text-slate-400">
              <Megaphone className="h-3 w-3" />
            </div>
            <p
              className={cn(
                "text-xs font-semibold",
                risk === "Bajo"
                  ? "text-brand-700"
                  : risk === "Medio"
                  ? "text-yellow-700"
                  : "text-red-700"
              )}
            >
              {risk}
            </p>
            <p className="text-[10px] text-slate-400">Riesgo</p>
          </div>
        </div>

        {/* AI Confidence bar */}
        {confidenceScore !== undefined && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Confianza IA
              </span>
              <span className="text-xs font-bold text-brand-700">
                {confidenceScore}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-700"
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Time remaining */}
        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Tiempo restante:{" "}
            <strong className={cn(isUrgent ? "text-orange-600" : "text-slate-700")}>
              {timeLabel}
            </strong>
          </span>
        </div>

        {/* Disclaimer */}
        <p className="mb-4 text-[10px] leading-relaxed text-slate-400">
          *Rendimientos pasados no garantizan resultados futuros. Esta información
          no constituye asesoramiento financiero personalizado.
        </p>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2">
          <Button onClick={handleInvest} className="flex-1" size="sm">
            Invertir ahora
          </Button>
          {onDismiss && (
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-600"
              aria-label="Descartar oferta"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Descartar</span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
