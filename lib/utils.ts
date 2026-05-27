import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names using clsx + tailwind-merge.
 * Handles conditional classes and resolves Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as USD currency string.
 * @example formatCurrency(1234.56) → "$1,234.56"
 * @example formatCurrency(500, "EUR") → "€500.00"
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number as a percentage string with sign.
 * @example formatPercent(12.34) → "+12.34%"
 * @example formatPercent(-5.6) → "-5.60%"
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Returns the Spanish label for a risk profile key.
 */
export function getRiskLabel(risk: string): string {
  const labels: Record<string, string> = {
    conservative: "Conservador",
    moderate: "Moderado",
    aggressive: "Agresivo",
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
  };
  return labels[risk.toLowerCase()] ?? risk;
}

/**
 * Returns Tailwind CSS color classes based on a numeric return value.
 * Positive → green, negative → red, zero → muted.
 */
export function getReturnColor(value: number): string {
  if (value > 0) return "text-brand-600";
  if (value < 0) return "text-danger-600";
  return "text-muted-foreground";
}

/**
 * Returns background + text badge classes for risk levels.
 */
export function getRiskBadgeClass(risk: string): string {
  const classes: Record<string, string> = {
    conservative: "bg-accent-100 text-accent-700",
    low: "bg-accent-100 text-accent-700",
    moderate: "bg-warning-400/20 text-yellow-700",
    medium: "bg-warning-400/20 text-yellow-700",
    aggressive: "bg-danger-500/15 text-danger-700",
    high: "bg-danger-500/15 text-danger-700",
  };
  return classes[risk.toLowerCase()] ?? "bg-muted text-muted-foreground";
}

/**
 * Returns a human-readable asset type label in Spanish.
 */
export function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    etf: "ETF",
    bond: "Bono",
    crypto: "Cripto",
    stock: "Acción",
  };
  return labels[type.toLowerCase()] ?? type.toUpperCase();
}

/**
 * Returns the color used for each asset type in charts.
 */
export function getAssetTypeColor(type: string): string {
  const colors: Record<string, string> = {
    etf: "#1da86a",
    bond: "#3b82f6",
    crypto: "#f59e0b",
    stock: "#8b5cf6",
  };
  return colors[type.toLowerCase()] ?? "#94a3b8";
}

/**
 * Truncates a string to a max length and appends ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Generates an array of mock dates for the last N days (YYYY-MM-DD).
 */
export function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * Formats a date string to a short locale string (e.g. "26 may").
 */
export function formatDateShort(dateStr: string, locale: string = "es-MX"): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}
