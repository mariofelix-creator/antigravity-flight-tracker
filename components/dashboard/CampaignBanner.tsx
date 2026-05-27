import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/lib/supabase/types";

interface CampaignBannerProps {
  campaign: Campaign;
}

export function CampaignBanner({ campaign }: CampaignBannerProps) {
  const { title, description, max_return_pct, expires_at } = campaign;

  const expiresLabel = expires_at
    ? new Date(expires_at).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-5 text-white shadow-md">
      {/* Background decoration */}
      <div className="absolute right-0 top-0 h-full w-32 opacity-10">
        <Zap className="h-full w-full" />
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="default"
                className="bg-white/20 text-white border-0 text-xs"
              >
                Oferta del día
              </Badge>
              {expiresLabel && (
                <span className="text-xs text-brand-100">
                  Vence {expiresLabel}
                </span>
              )}
            </div>
            <h3 className="font-bold text-base leading-snug">{title}</h3>
          </div>
          {max_return_pct !== null && max_return_pct > 0 && (
            <div className="flex-shrink-0 text-right">
              <p className="text-2xl font-extrabold leading-none">
                +{max_return_pct}%
              </p>
              <p className="text-xs text-brand-100">retorno est.</p>
            </div>
          )}
        </div>

        <p className="text-sm text-brand-50 leading-snug">{description}</p>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="self-start text-white bg-white/20 hover:bg-white/30 border border-white/30"
        >
          <Link href="/dashboard/invest">Ver oferta</Link>
        </Button>
      </div>
    </div>
  );
}
