"use client";

import * as React from "react";
import { Megaphone, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/supabase/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CampaignBannerProps {
  campaign: Campaign;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Compact horizontal banner for the dashboard.
 * Dismisses for the session using local state — does not re-render once closed.
 */
export function CampaignBanner({ campaign, onClose }: CampaignBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  function handleClose() {
    setDismissed(true);
    onClose();
  }

  return (
    <div
      role="banner"
      className={cn(
        "relative flex w-full items-center gap-3 overflow-hidden rounded-lg",
        "border border-brand-200 bg-brand-50",
        "border-l-4 border-l-brand-500",
        "px-4 py-3"
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <Megaphone className="h-4 w-4 text-brand-600" aria-hidden="true" />
      </div>

      {/* Text content — grows to fill available space, truncates on overflow */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug text-brand-900">
          {campaign.title}
        </p>
        {campaign.description && (
          <p className="truncate text-xs text-brand-700/70">
            {campaign.description}
          </p>
        )}
      </div>

      {/* CTA */}
      <Link
        href="/campaigns"
        className={cn(
          "flex-shrink-0 flex items-center gap-1",
          "rounded-md bg-brand-500 px-3 py-1.5",
          "text-xs font-semibold text-white",
          "transition-colors duration-150 hover:bg-brand-600",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
        )}
      >
        Ver
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Cerrar banner de campaña"
        className={cn(
          "flex-shrink-0 rounded p-0.5",
          "text-brand-500 transition-colors duration-150 hover:bg-brand-100 hover:text-brand-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        )}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
