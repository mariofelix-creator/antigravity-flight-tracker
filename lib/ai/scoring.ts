/**
 * lib/ai/scoring.ts
 * Funciones de scoring deterministas (sin IA) para fallback y pre-filtrado.
 * Todas las operaciones son síncronas y no dependen de servicios externos.
 */

import type { RiskProfile, AssetType } from "@/lib/supabase/types";
import { addHours } from "date-fns";

// ─── Tipos internos ────────────────────────────────────────────────────────────

export interface UserProfileInput {
  risk_profile: RiskProfile;
  investment_goal: string;
  max_investment_usd: number;
  /** Símbolos de activos que el usuario ya tiene en cartera */
  currentPortfolioSymbols?: string[];
}

export interface AssetCatalogEntry {
  symbol: string;
  name: string;
  type: AssetType;
  avgReturn: number;
  risk: "low" | "medium" | "high";
}

export interface FallbackRecommendation {
  assetSymbol: string;
  assetName: string;
  assetType: AssetType;
  confidenceScore: number;
  reasoning: string;
  suggestedAmount: number;
  riskLevel: RiskProfile;
  expectedReturnPct: number;
  expiresAt: string;
}

// ─── Catálogo de activos ───────────────────────────────────────────────────────

export const ASSET_CATALOG: AssetCatalogEntry[] = [
  { symbol: "VOO",  name: "Vanguard S&P 500 ETF",      type: "etf",  avgReturn: 10.5, risk: "medium" },
  { symbol: "BND",  name: "Bono Total Bond Market",     type: "bond", avgReturn: 4.2,  risk: "low"    },
  { symbol: "QQQ",  name: "Invesco NASDAQ 100 ETF",     type: "etf",  avgReturn: 15.3, risk: "high"   },
  { symbol: "GLD",  name: "SPDR Gold Shares",           type: "etf",  avgReturn: 7.8,  risk: "medium" },
  { symbol: "ARKK", name: "ARK Innovation ETF",         type: "etf",  avgReturn: 22.0, risk: "high"   },
  { symbol: "GOVT", name: "Bono Tesoro USA",            type: "bond", avgReturn: 3.8,  risk: "low"    },
  { symbol: "VTI",  name: "Vanguard Total Market ETF",  type: "etf",  avgReturn: 11.2, risk: "medium" },
];

// ─── Mapas de conversión ───────────────────────────────────────────────────────

const RISK_PROFILE_TO_ASSET_RISK: Record<RiskProfile, ("low" | "medium" | "high")[]> = {
  conservative: ["low"],
  moderate:     ["low", "medium"],
  aggressive:   ["low", "medium", "high"],
};

/** Peso de compatibilidad por combinación perfil→riesgo del activo (0–1) */
const RISK_WEIGHT: Record<RiskProfile, Record<"low" | "medium" | "high", number>> = {
  conservative: { low: 1.0,  medium: 0.4,  high: 0.0 },
  moderate:     { low: 0.7,  medium: 1.0,  high: 0.5 },
  aggressive:   { low: 0.4,  medium: 0.7,  high: 1.0 },
};

/** Convierte riesgo string a RiskProfile para el campo riskLevel */
const ASSET_RISK_TO_PROFILE: Record<"low" | "medium" | "high", RiskProfile> = {
  low:    "conservative",
  medium: "moderate",
  high:   "aggressive",
};

// ─── calculateRiskScore ────────────────────────────────────────────────────────

/**
 * Calcula un score de riesgo numérico (0–100) para el perfil del usuario.
 * 0 = muy conservador, 100 = muy agresivo.
 */
export function calculateRiskScore(profile: UserProfileInput): number {
  const baseScore: Record<RiskProfile, number> = {
    conservative: 20,
    moderate:     50,
    aggressive:   80,
  };

  let score = baseScore[profile.risk_profile];

  // Ajuste por monto máximo: mayor monto → más margen para asumir riesgo
  if (profile.max_investment_usd >= 400) score += 5;
  else if (profile.max_investment_usd <= 50) score -= 5;

  // Ajuste por objetivo (análisis simple de palabras clave en español e inglés)
  const goal = profile.investment_goal.toLowerCase();
  const growthKeywords  = ["crecer", "crecimiento", "ganar", "aumentar", "rentabilidad", "grow", "profit"];
  const safetyKeywords  = ["conservar", "seguro", "proteger", "estabilidad", "seguridad", "safe", "preserve"];
  const retireKeywords  = ["jubilación", "retiro", "pensión", "largo plazo", "retire", "retirement"];

  if (growthKeywords.some(kw => goal.includes(kw)))  score += 8;
  if (safetyKeywords.some(kw => goal.includes(kw)))  score -= 10;
  if (retireKeywords.some(kw => goal.includes(kw)))  score -= 5;

  return Math.max(0, Math.min(100, score));
}

// ─── matchAssetToProfile ───────────────────────────────────────────────────────

/**
 * Calcula un score de compatibilidad (0–100) entre un activo y el perfil.
 * Considera: riesgo, diversificación, objetivo, tamaño del monto.
 */
export function matchAssetToProfile(
  asset: AssetCatalogEntry,
  profile: UserProfileInput
): number {
  // Compatibilidad de riesgo (0–100)
  const riskCompatibility = Math.round(RISK_WEIGHT[profile.risk_profile][asset.risk] * 100);

  // Penalización si ya tiene el activo (diversificación)
  const alreadyOwned = profile.currentPortfolioSymbols?.includes(asset.symbol) ? -15 : 0;

  // Bonus por retorno esperado moderado para perfiles conservadores
  let returnBonus = 0;
  if (profile.risk_profile === "conservative" && asset.avgReturn <= 5) returnBonus = 10;
  if (profile.risk_profile === "moderate"     && asset.avgReturn >= 7 && asset.avgReturn <= 12) returnBonus = 10;
  if (profile.risk_profile === "aggressive"   && asset.avgReturn >= 15) returnBonus = 10;

  // Los bonos tienen mejor recepción para conservadores
  const bondBonus = profile.risk_profile === "conservative" && asset.type === "bond" ? 8 : 0;

  const raw = riskCompatibility + alreadyOwned + returnBonus + bondBonus;
  return Math.max(0, Math.min(100, raw));
}

// ─── generateFallbackRecommendations ──────────────────────────────────────────

/**
 * Genera hasta 3 recomendaciones usando reglas deterministas.
 * Úsalo cuando la API de Anthropic no esté disponible.
 */
export function generateFallbackRecommendations(
  profile: UserProfileInput
): FallbackRecommendation[] {
  const eligibleRisks = RISK_PROFILE_TO_ASSET_RISK[profile.risk_profile];

  const scored = ASSET_CATALOG
    .filter(asset => eligibleRisks.includes(asset.risk))
    .map(asset => ({
      asset,
      score: matchAssetToProfile(asset, profile),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const expiresAt = addHours(new Date(), 24).toISOString();

  return scored.map(({ asset, score }) => {
    const suggestedAmount = Math.min(
      Math.round(profile.max_investment_usd * 0.4 / 10) * 10,
      profile.max_investment_usd
    );

    return {
      assetSymbol:       asset.symbol,
      assetName:         asset.name,
      assetType:         asset.type,
      confidenceScore:   score,
      reasoning:         explainRiskInSimpleTerms(asset.risk, asset.type),
      suggestedAmount:   Math.max(10, suggestedAmount),
      riskLevel:         ASSET_RISK_TO_PROFILE[asset.risk],
      expectedReturnPct: asset.avgReturn,
      expiresAt,
    };
  });
}

// ─── explainRiskInSimpleTerms ──────────────────────────────────────────────────

/**
 * Genera una explicación de riesgo en español simple, sin jerga financiera.
 * Máximo 2 oraciones claras para usuarios principiantes.
 */
export function explainRiskInSimpleTerms(
  riskLevel: "low" | "medium" | "high",
  assetType: AssetType
): string {
  const explanations: Record<"low" | "medium" | "high", Record<AssetType, string>> = {
    low: {
      bond:   "Este bono es muy estable: tu dinero crece poco a poco sin grandes sorpresas. Es ideal si prefieres seguridad sobre ganancias rápidas.",
      etf:    "Este fondo de bajo riesgo diversifica tu dinero en muchos activos a la vez. Las variaciones de precio son pequeñas y manejables.",
      stock:  "Esta acción tiene historial de estabilidad y paga dividendos regulares. El riesgo es menor que el promedio del mercado.",
      crypto: "Esta criptomoneda es relativamente estable comparada con otras, aunque igual puede tener variaciones. Invierte solo lo que estés dispuesto a arriesgar.",
    },
    medium: {
      etf:    "Este fondo crece siguiendo grandes empresas del mercado. Puede bajar en momentos difíciles, pero históricamente se recupera y sube a largo plazo.",
      bond:   "Este bono ofrece un balance entre seguridad y retorno. Es un punto medio entre guardar el dinero en banco y invertir en acciones.",
      stock:  "Esta acción pertenece a una empresa sólida con buen historial de crecimiento. Puede fluctuar, pero tiene fundamentos robustos.",
      crypto: "Esta criptomoneda tiene mayor estabilidad que el mercado cripto en general, aunque sigue siendo volátil. Solo invierte lo que puedas permitirte perder.",
    },
    high: {
      etf:    "Este fondo busca ganancias altas invirtiendo en empresas de tecnología o innovación. Puede crecer mucho, pero también puede bajar fuerte en períodos cortos.",
      bond:   "Este bono ofrece intereses más altos que los bonos tradicionales a cambio de mayor riesgo. No es recomendable para tu dinero de emergencia.",
      stock:  "Esta acción puede dar ganancias significativas, pero también pérdidas importantes. Es adecuada solo si puedes esperar años para recuperarte si baja.",
      crypto: "Esta criptomoneda puede multiplicar tu inversión, pero también reducirla drasticamente. Solo invierte una cantidad pequeña que puedas perder sin afectar tu vida.",
    },
  };

  return explanations[riskLevel][assetType] ??
    "Este activo tiene características particulares que pueden ser adecuadas para tu perfil. Revisa siempre los detalles antes de invertir.";
}
