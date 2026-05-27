"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, ArrowUpDown, PackageOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cn,
  formatCurrency,
  formatPercent,
  getAssetTypeLabel,
} from "@/lib/utils";
import type { Investment, InvestmentStatus } from "@/lib/supabase/types";

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
  {
    id: "inv-4",
    portfolio_id: "port-1",
    user_id: "user-1",
    asset_symbol: "ARKK",
    asset_name: "ARK Innovation ETF",
    asset_type: "etf",
    amount_usd: 50.0,
    shares: 1.02,
    entry_price: 49.02,
    current_price: 46.85,
    return_pct: -4.43,
    status: "active",
    created_at: "2026-05-10T14:00:00Z",
  },
  {
    id: "inv-5",
    portfolio_id: "port-1",
    user_id: "user-1",
    asset_symbol: "GOVT",
    asset_name: "Bono Tesoro USA",
    asset_type: "bond",
    amount_usd: 100.0,
    shares: 3.85,
    entry_price: 25.97,
    current_price: 25.97,
    return_pct: 0.0,
    status: "sold",
    created_at: "2026-03-15T08:00:00Z",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "asset_name" | "amount_usd" | "return_pct" | "status";
type SortDir = "asc" | "desc";

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

// ─── Sell Modal ───────────────────────────────────────────────────────────────

interface SellModalProps {
  investment: Investment;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

function SellModal({ investment, onClose, onConfirm }: SellModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-foreground">
          Vender inversión
        </h3>
        <p className="text-sm text-muted-foreground">
          ¿Confirmas que quieres vender tu posición en{" "}
          <strong>{investment.asset_name}</strong>?
        </p>

        <div className="rounded-xl bg-surface-subtle border border-border p-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monto invertido</span>
            <span className="font-medium">
              {formatCurrency(investment.amount_usd)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Retorno</span>
            <span
              className={cn(
                "font-semibold",
                investment.return_pct >= 0
                  ? "text-brand-600"
                  : "text-danger-600"
              )}
            >
              {formatPercent(investment.return_pct)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-1">
            <span className="font-medium text-foreground">Recibirías</span>
            <span className="font-bold text-foreground">
              {formatCurrency(
                investment.amount_usd * (1 + investment.return_pct / 100)
              )}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onConfirm(investment.id)}
          >
            Confirmar venta
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio page ───────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);
  const [sortKey, setSortKey] = useState<SortKey>("created_at" as SortKey);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [sellTarget, setSellTarget] = useState<Investment | null>(null);

  const totalInvested = investments
    .filter((i) => i.status === "active")
    .reduce((s, i) => s + i.amount_usd, 0);
  const currentValue = investments
    .filter((i) => i.status === "active")
    .reduce((s, i) => s + i.amount_usd * (1 + i.return_pct / 100), 0);
  const totalReturn =
    totalInvested > 0
      ? ((currentValue - totalInvested) / totalInvested) * 100
      : 0;

  const sorted = useMemo(() => {
    return [...investments].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortKey === "asset_name") {
        aVal = a.asset_name;
        bVal = b.asset_name;
      } else if (sortKey === "amount_usd") {
        aVal = a.amount_usd;
        bVal = b.amount_usd;
      } else if (sortKey === "return_pct") {
        aVal = a.return_pct;
        bVal = b.return_pct;
      } else if (sortKey === "status") {
        aVal = a.status;
        bVal = b.status;
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [investments, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleSell = (id: string) => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "sold" as const } : inv))
    );
    setSellTarget(null);
  };

  const activeInvestments = investments.filter((i) => i.status === "active");

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Mi Cartera</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona y revisa todas tus posiciones
        </p>
      </div>

      {/* Summary header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Total invertido</p>
          <p className="text-xl font-bold">{formatCurrency(totalInvested)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Valor actual</p>
          <p className="text-xl font-bold">{formatCurrency(currentValue)}</p>
        </Card>
        <Card className="p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground mb-1">Retorno total</p>
          <p
            className={cn(
              "text-xl font-bold",
              totalReturn >= 0 ? "text-brand-600" : "text-danger-600"
            )}
          >
            {formatPercent(totalReturn)}
          </p>
        </Card>
      </div>

      {/* Empty state */}
      {activeInvestments.length === 0 && (
        <Card className="flex flex-col items-center gap-4 py-12 px-6">
          <PackageOpen className="h-12 w-12 text-muted-foreground/40" />
          <div className="text-center">
            <p className="font-semibold text-foreground">
              Todavía no tienes inversiones activas
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Empieza con $10 USD y deja que la IA trabaje para ti.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/invest">Hacer mi primera inversión</Link>
          </Button>
        </Card>
      )}

      {/* Table */}
      {sorted.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Todas las inversiones</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => toggleSort("asset_name")}
                    >
                      Activo
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Tipo
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                    <button
                      type="button"
                      className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                      onClick={() => toggleSort("amount_usd")}
                    >
                      Monto
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">
                    P. Entrada
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">
                    P. Actual
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                    <button
                      type="button"
                      className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                      onClick={() => toggleSort("return_pct")}
                    >
                      Retorno
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                    <button
                      type="button"
                      className="flex items-center gap-1 mx-auto hover:text-foreground transition-colors"
                      onClick={() => toggleSort("status")}
                    >
                      Estado
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-2 pl-3 font-medium text-muted-foreground text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border last:border-0 hover:bg-surface-subtle/50 transition-colors"
                  >
                    {/* Asset */}
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-brand-700">
                            {inv.asset_symbol.slice(0, 3)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground leading-tight">
                            {inv.asset_symbol}
                          </p>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {inv.asset_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <span className="text-muted-foreground">
                        {getAssetTypeLabel(inv.asset_type)}
                      </span>
                    </td>
                    {/* Amount */}
                    <td className="py-3 px-3 text-right font-medium">
                      {formatCurrency(inv.amount_usd)}
                    </td>
                    {/* Entry price */}
                    <td className="py-3 px-3 text-right text-muted-foreground hidden md:table-cell">
                      ${inv.entry_price.toFixed(2)}
                    </td>
                    {/* Current price */}
                    <td className="py-3 px-3 text-right text-muted-foreground hidden md:table-cell">
                      ${inv.current_price.toFixed(2)}
                    </td>
                    {/* Return */}
                    <td className="py-3 px-3 text-right">
                      <div
                        className={cn(
                          "flex items-center justify-end gap-0.5 font-semibold",
                          inv.return_pct > 0
                            ? "text-brand-600"
                            : inv.return_pct < 0
                            ? "text-danger-600"
                            : "text-muted-foreground"
                        )}
                      >
                        {inv.return_pct > 0 && (
                          <TrendingUp className="h-3 w-3" />
                        )}
                        {inv.return_pct < 0 && (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercent(inv.return_pct)}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <Badge variant={STATUS_VARIANT[inv.status]}>
                        {STATUS_LABEL[inv.status]}
                      </Badge>
                    </td>
                    {/* Actions */}
                    <td className="py-3 pl-3 text-right">
                      {inv.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-danger-600 border-danger-300 hover:bg-danger-50 hover:border-danger-400"
                          onClick={() => setSellTarget(inv)}
                        >
                          Vender
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Sell confirmation modal */}
      {sellTarget && (
        <SellModal
          investment={sellTarget}
          onClose={() => setSellTarget(null)}
          onConfirm={handleSell}
        />
      )}
    </div>
  );
}
