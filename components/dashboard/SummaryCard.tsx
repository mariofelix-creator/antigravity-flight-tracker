import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
  variant?: "positive" | "negative" | "neutral";
}

export function SummaryCard({
  icon,
  label,
  value,
  change,
  variant = "neutral",
}: SummaryCardProps) {
  const isPositive = variant === "positive" || change > 0;
  const isNegative = variant === "negative" || change < 0;

  const changeColor = isPositive
    ? "text-brand-600"
    : isNegative
    ? "text-danger-600"
    : "text-muted-foreground";

  const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <Card className="card-hover p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <span className="text-brand-500">{icon}</span>
          <span>{label}</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-semibold",
            changeColor
          )}
        >
          <ChangeIcon className="h-3 w-3" />
          <span>
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </Card>
  );
}
