/**
 * lib/ai/recommendations.ts
 * Motor de recomendaciones IA usando Anthropic claude-haiku-4-5-20251001.
 * Genera recomendaciones personalizadas con explicaciones en español simple.
 */

import Anthropic from "anthropic";
import { addHours } from "date-fns";
import type { RiskProfile, AssetType } from "@/lib/supabase/types";
import {
  ASSET_CATALOG,
  generateFallbackRecommendations,
  type UserProfileInput,
  type AssetCatalogEntry,
} from "./scoring";

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface AIRecommendation {
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

export interface RecommendationsResult {
  recommendations: AIRecommendation[];
  generatedAt: string;
  nextRefresh: string;
  source: "ai" | "fallback";
}

// ─── Respuesta cruda del modelo ────────────────────────────────────────────────

interface RawModelRecommendation {
  assetSymbol: string;
  assetName: string;
  assetType: string;
  confidenceScore: number;
  reasoning: string;
  suggestedAmount: number;
  riskLevel: string;
  expectedReturnPct: number;
}

interface ModelResponse {
  recommendations: RawModelRecommendation[];
}

// ─── Cliente Anthropic (singleton lazy) ───────────────────────────────────────

let _anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    _anthropicClient = new Anthropic({ apiKey });
  }
  return _anthropicClient;
}

// ─── Construcción del prompt ───────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `Eres un asesor financiero amigable de MicroGuard, una aplicación de micro-inversiones.
Tu misión es recomendar inversiones pequeñas (máximo $500 USD) a usuarios principiantes en español.

REGLAS OBLIGATORIAS:
1. Responde ÚNICAMENTE con JSON válido, sin texto adicional antes o después.
2. Usa solo activos del catálogo proporcionado.
3. Las explicaciones deben ser máximo 2 oraciones en español simple, sin jerga financiera.
4. Siempre menciona el riesgo de forma honesta y transparente.
5. El campo suggestedAmount nunca debe superar max_investment_usd.
6. Genera exactamente 3 recomendaciones ordenadas de mayor a menor relevancia.
7. El confidenceScore (0-100) debe reflejar cuán bien se adapta el activo al perfil.
8. Los retornos esperados son estimados históricos, no garantías.`;
}

function buildUserPrompt(
  profile: UserProfileInput,
  catalog: AssetCatalogEntry[]
): string {
  const profileLabels: Record<RiskProfile, string> = {
    conservative: "conservador (prefiere seguridad y estabilidad)",
    moderate:     "moderado (acepta algo de variación para crecer más)",
    aggressive:   "agresivo (busca máximo crecimiento y acepta mayor riesgo)",
  };

  const portfolioContext = profile.currentPortfolioSymbols?.length
    ? `El usuario ya tiene estos activos en cartera: ${profile.currentPortfolioSymbols.join(", ")}. Prioriza activos que complementen su cartera actual (diversificación).`
    : "El usuario no tiene inversiones activas todavía.";

  const catalogJson = JSON.stringify(
    catalog.map(a => ({
      symbol: a.symbol,
      name:   a.name,
      type:   a.type,
      avgAnnualReturnPct: a.avgReturn,
      riskLevel: a.risk,
    })),
    null,
    2
  );

  return `PERFIL DEL USUARIO:
- Perfil de riesgo: ${profileLabels[profile.risk_profile]}
- Objetivo de inversión: "${profile.investment_goal}"
- Monto máximo a invertir: $${profile.max_investment_usd} USD
- ${portfolioContext}

CATÁLOGO DE ACTIVOS DISPONIBLES:
${catalogJson}

INSTRUCCIÓN:
Analiza el perfil y genera exactamente 3 recomendaciones del catálogo anterior.
Responde con este JSON exacto (sin markdown, sin texto extra):

{
  "recommendations": [
    {
      "assetSymbol": "SÍMBOLO",
      "assetName": "Nombre completo del activo",
      "assetType": "etf|bond|crypto|stock",
      "confidenceScore": 85,
      "reasoning": "Explicación en máximo 2 oraciones en español simple. Menciona el riesgo honestamente.",
      "suggestedAmount": 50,
      "riskLevel": "conservative|moderate|aggressive",
      "expectedReturnPct": 10.5
    }
  ]
}

IMPORTANTE: suggestedAmount no puede ser mayor a ${profile.max_investment_usd}.
Ordena las recomendaciones de mayor a menor compatibilidad con el perfil.`;
}

// ─── Validación y sanitización de la respuesta ────────────────────────────────

const VALID_ASSET_TYPES = new Set(["etf", "bond", "crypto", "stock"]);
const VALID_RISK_LEVELS  = new Set(["conservative", "moderate", "aggressive"]);
const CATALOG_SYMBOLS    = new Set(ASSET_CATALOG.map(a => a.symbol));

function sanitizeRecommendation(
  raw: RawModelRecommendation,
  profile: UserProfileInput,
  index: number
): AIRecommendation | null {
  // Validar símbolo contra catálogo
  if (!CATALOG_SYMBOLS.has(raw.assetSymbol)) return null;

  const catalogEntry = ASSET_CATALOG.find(a => a.symbol === raw.assetSymbol);
  if (!catalogEntry) return null;

  // Validar tipos
  const assetType: AssetType = VALID_ASSET_TYPES.has(raw.assetType)
    ? (raw.assetType as AssetType)
    : catalogEntry.type;

  const riskLevel: RiskProfile = VALID_RISK_LEVELS.has(raw.riskLevel)
    ? (raw.riskLevel as RiskProfile)
    : profile.risk_profile;

  // Sanitizar números
  const confidenceScore = Math.max(0, Math.min(100, Number(raw.confidenceScore) || 50));
  const suggestedAmount  = Math.max(
    10,
    Math.min(profile.max_investment_usd, Number(raw.suggestedAmount) || 10)
  );
  const expectedReturnPct = Number(raw.expectedReturnPct) || catalogEntry.avgReturn;

  // Sanitizar texto: eliminar reasoning vacío o demasiado corto
  const reasoning =
    typeof raw.reasoning === "string" && raw.reasoning.trim().length >= 10
      ? raw.reasoning.trim().slice(0, 400)
      : `Este activo (${raw.assetSymbol}) se adapta a tu perfil ${riskLevel}. Recuerda que toda inversión conlleva riesgo.`;

  const expiresAt = addHours(new Date(), 24).toISOString();

  return {
    assetSymbol:  raw.assetSymbol,
    assetName:    catalogEntry.name,
    assetType,
    confidenceScore,
    reasoning,
    suggestedAmount,
    riskLevel,
    expectedReturnPct,
    expiresAt,
  };
}

function parseModelOutput(text: string): ModelResponse | null {
  // Intentar extraer JSON si el modelo incluyó texto extra
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "recommendations" in parsed &&
      Array.isArray((parsed as ModelResponse).recommendations)
    ) {
      return parsed as ModelResponse;
    }
  } catch {
    // JSON inválido — retornar null para activar fallback
  }
  return null;
}

// ─── Función principal ─────────────────────────────────────────────────────────

/**
 * Genera recomendaciones de inversión personalizadas usando la API de Anthropic.
 * Si la API falla, usa el motor de scoring determinista como fallback.
 */
export async function generateRecommendations(
  profile: UserProfileInput
): Promise<RecommendationsResult> {
  const generatedAt = new Date().toISOString();
  const nextRefresh  = addHours(new Date(), 24).toISOString();

  try {
    const client  = getAnthropicClient();
    const message = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system:     buildSystemPrompt(),
      messages: [
        {
          role:    "user",
          content: buildUserPrompt(profile, ASSET_CATALOG),
        },
      ],
    });

    // Extraer texto de la respuesta
    const textBlock = message.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Model returned no text content");
    }

    const parsed = parseModelOutput(textBlock.text);
    if (!parsed) {
      throw new Error("Could not parse model JSON response");
    }

    // Sanitizar y filtrar recomendaciones
    const recommendations: AIRecommendation[] = parsed.recommendations
      .slice(0, 3)
      .map((raw, i) => sanitizeRecommendation(raw, profile, i))
      .filter((r): r is AIRecommendation => r !== null);

    if (recommendations.length === 0) {
      throw new Error("No valid recommendations after sanitization");
    }

    return { recommendations, generatedAt, nextRefresh, source: "ai" };

  } catch (error) {
    // Fallback silencioso al motor determinista
    const fallback = generateFallbackRecommendations(profile);

    const recommendations: AIRecommendation[] = fallback.map(fb => ({
      assetSymbol:       fb.assetSymbol,
      assetName:         fb.assetName,
      assetType:         fb.assetType,
      confidenceScore:   fb.confidenceScore,
      reasoning:         fb.reasoning,
      suggestedAmount:   fb.suggestedAmount,
      riskLevel:         fb.riskLevel,
      expectedReturnPct: fb.expectedReturnPct,
      expiresAt:         fb.expiresAt,
    }));

    // Log en servidor (nunca expuesto al cliente)
    if (process.env.NODE_ENV !== "production") {
      console.warn("[recommendations] AI fallback activated:", (error as Error).message);
    }

    return { recommendations, generatedAt, nextRefresh, source: "fallback" };
  }
}
