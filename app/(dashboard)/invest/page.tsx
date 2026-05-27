"use client";

import React, { useState } from "react";
import { Loader2, X, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ASSET_CATALOG, type AssetCatalogEntry } from "@/lib/ai/scoring";
import {
  cn,
  getAssetTypeLabel,
  getAssetTypeColor,
  getRiskLabel,
  getRiskBadgeClass,
} from "@/lib/utils";

// ─── Asset card ───────────────────────────────────────────────────────────────

interface AssetCardProps {
  asset: AssetCatalogEntry;
  onSelect: (asset: AssetCatalogEntry) => void;
}

function AssetCard({ asset, onSelect }: AssetCardProps) {
  const typeColor = getAssetTypeColor(asset.type);

  const riskBadgeVariant: "info" | "warning" | "danger" =
    asset.risk === "low" ? "info" : asset.risk === "medium" ? "warning" : "danger";

  return (
    <button
      type="button"
      onClick={() => onSelect(asset)}
      className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-white text-left hover:border-brand-300 hover:shadow-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${typeColor}1a` }}
        >
          <span className="text-xs font-bold" style={{ color: typeColor }}>
            {asset.symbol.slice(0, 3)}
          </span>
        </div>
        <Badge variant={riskBadgeVariant} className="flex-shrink-0 mt-0.5">
          {getRiskLabel(asset.risk)}
        </Badge>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold text-sm text-foreground leading-snug">
          {asset.name}
        </p>
        <p className="text-xs text-muted-foreground font-mono">{asset.symbol}</p>
      </div>

      {/* Metrics */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          <p className="text-xs text-muted-foreground">Tipo</p>
          <p className="text-sm font-medium text-foreground">
            {getAssetTypeLabel(asset.type)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Retorno histórico</p>
          <p className="text-sm font-bold text-brand-600">
            +{asset.avgReturn}% / año
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── Invest modal ─────────────────────────────────────────────────────────────

interface InvestModalProps {
  asset: AssetCatalogEntry;
  onClose: () => void;
}

function InvestModal({ asset, onClose }: InvestModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectedReturn = amount * (1 + asset.avgReturn / 100);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/portfolio/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetSymbol: asset.symbol,
          assetName: asset.name,
          assetType: asset.type,
          amountUsd: amount,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "No se pudo procesar la inversión.");
        setLoading(false);
        return;
      }

      onClose();
      router.push("/dashboard/portfolio");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            Invertir en {asset.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-full hover:bg-surface-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Amount selector */}
        <div className="flex flex-col gap-3">
          <Label>Monto a invertir</Label>
          <div className="text-center">
            <span className="text-4xl font-bold text-brand-600">${amount}</span>
            <span className="text-sm text-muted-foreground ml-1">USD</span>
          </div>
          <Slider
            min={10}
            max={500}
            step={5}
            value={[amount]}
            onValueChange={([val]) => setAmount(val ?? amount)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$10</span>
            <span>$500</span>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl bg-surface-subtle border border-border p-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monto</span>
            <span className="font-medium">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Retorno proyectado (1 año)
            </span>
            <span className="font-semibold text-brand-600">
              +${(projectedReturn - amount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nivel de riesgo</span>
            <span
              className={cn(
                "font-medium px-2 py-0.5 rounded-full text-xs",
                getRiskBadgeClass(asset.risk)
              )}
            >
              {getRiskLabel(asset.risk)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-1">
            <span className="font-medium text-foreground">
              Valor estimado en 1 año
            </span>
            <span className="font-bold text-foreground">
              ${projectedReturn.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          Los rendimientos pasados no garantizan resultados futuros. Invertir
          conlleva riesgos.
        </p>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-danger-500/10 border border-danger-400/30 px-4 py-2">
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Confirmar inversión
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Invest page ──────────────────────────────────────────────────────────────

export default function InvestPage() {
  const [selectedAsset, setSelectedAsset] = useState<AssetCatalogEntry | null>(
    null
  );

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Nueva Inversión</h1>
        <p className="text-sm text-muted-foreground">
          Elige un activo de nuestro catálogo y empieza desde $10 USD
        </p>
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ASSET_CATALOG.map((asset) => (
          <AssetCard key={asset.symbol} asset={asset} onSelect={setSelectedAsset} />
        ))}
      </div>

      {/* Disclaimer */}
      <Card className="border-brand-100 bg-brand-50/40">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Aviso importante:</strong> Las
            inversiones están sujetas a riesgos de mercado. Los rendimientos
            históricos no garantizan resultados futuros. MicroGuard no es un
            asesor financiero registrado.
          </p>
        </CardContent>
      </Card>

      {/* Modal */}
      {selectedAsset && (
        <InvestModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}
