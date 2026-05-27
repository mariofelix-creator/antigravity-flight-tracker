import * as React from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { cn, getRiskLabel } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RiskProfile } from "@/lib/supabase/types";

interface RecommendationData {
  assetName: string;
  assetSymbol: string;
  confidenceScore: number;
  reasoning: string;
  suggestedAmount: number;
  riskLevel: RiskProfile;
}

interface AIRecommendationCardProps {
  recommendation: RecommendationData;
}

export function AIRecommendationCard({
  recommendation,
}: AIRecommendationCardProps) {
  const {
    assetName,
    assetSymbol,
    confidenceScore,
    reasoning,
    suggestedAmount,
    riskLevel,
  } = recommendation;

  const riskBadgeVariant =
    riskLevel === "conservative"
      ? "info"
      : riskLevel === "moderate"
      ? "warning"
      : "danger";

  return (
    <Card className="border-l-4 border-l-brand-500 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-50">
              <Sparkles className="h-4 w-4 text-brand-600" />
            </div>
            <div>
              <Badge variant="success" className="text-xs mb-1">
                IA Recomienda
              </Badge>
              <p className="font-bold text-foreground leading-tight">
                {assetName}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {assetSymbol}
              </p>
            </div>
          </div>
          <Badge variant={riskBadgeVariant}>
            {getRiskLabel(riskLevel)}
          </Badge>
        </div>

        {/* Confidence bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground font-medium">
              Confianza
            </span>
            <span className="text-xs font-bold text-brand-700">
              {confidenceScore}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-brand-100 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-700"
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
        </div>

        {/* Reasoning */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {reasoning}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href="/dashboard/invest">
              Invertir ${suggestedAmount.toFixed(0)}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/invest">Ver catálogo</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
