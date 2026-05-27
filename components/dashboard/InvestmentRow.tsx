import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency, formatPercent, getAssetTypeLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Investment, InvestmentStatus } from "@/lib/supabase/types";

interface InvestmentRowProps {
  investment: Investment;
}

const STATUS_VARIANT: Record<
  InvestmentStatus,
  "success" | "default" | "warning"
> = {
  active: "success",
  sold: "default",
  pending: "warning",
};

const STATUS_LABEL: Record<InvestmentStatus, string> = {
  active: "Activa",
  sold: "Vendida",
  pending: "Pendiente",
};

export function InvestmentRow({ investment }: InvestmentRowProps) {
  const {
    asset_name,
    asset_symbol,
    asset_type,
    amount_usd,
    return_pct,
    status,
  } = investment;

  const isPositive = return_pct > 0;
  const isNegative = return_pct < 0;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      {/* Asset logo placeholder */}
      <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-brand-700">
          {asset_symbol.slice(0, 3)}
        </span>
      </div>

      {/* Name + type */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">
          {asset_name}
        </p>
        <p className="text-xs text-muted-foreground">
          {asset_symbol} &middot; {getAssetTypeLabel(asset_type)}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium text-foreground">
          {formatCurrency(amount_usd)}
        </p>
        <div
          className={cn(
            "flex items-center justify-end gap-0.5 text-xs font-semibold",
            isPositive
              ? "text-brand-600"
              : isNegative
              ? "text-danger-600"
              : "text-muted-foreground"
          )}
        >
          {isPositive && <TrendingUp className="h-3 w-3" />}
          {isNegative && <TrendingDown className="h-3 w-3" />}
          <span>{formatPercent(return_pct)}</span>
        </div>
      </div>

      {/* Status badge */}
      <Badge variant={STATUS_VARIANT[status]} className="flex-shrink-0 ml-1">
        {STATUS_LABEL[status]}
      </Badge>
    </div>
  );
}
