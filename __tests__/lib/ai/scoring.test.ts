import {
  calculateRiskScore,
  matchAssetToProfile,
  generateFallbackRecommendations,
  explainRiskInSimpleTerms,
  ASSET_CATALOG,
  type UserProfileInput,
} from "@/lib/ai/scoring";

describe("calculateRiskScore", () => {
  it("returns high score for aggressive profile", () => {
    const profile: UserProfileInput = {
      risk_profile: "aggressive",
      investment_goal: "Crecer a largo plazo",
      max_investment_usd: 500,
    };
    expect(calculateRiskScore(profile)).toBeGreaterThan(70);
  });

  it("returns low score for conservative profile", () => {
    const profile: UserProfileInput = {
      risk_profile: "conservative",
      investment_goal: "Ahorrar para emergencias",
      max_investment_usd: 100,
    };
    expect(calculateRiskScore(profile)).toBeLessThan(40);
  });

  it("returns medium score for moderate profile", () => {
    const profile: UserProfileInput = {
      risk_profile: "moderate",
      investment_goal: "Ingreso extra",
      max_investment_usd: 300,
    };
    const score = calculateRiskScore(profile);
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThanOrEqual(70);
  });
});

describe("matchAssetToProfile", () => {
  const conservativeProfile: UserProfileInput = {
    risk_profile: "conservative",
    investment_goal: "Ahorrar para emergencias",
    max_investment_usd: 100,
  };

  it("scores bonds higher for conservative profile", () => {
    const bond = ASSET_CATALOG.find((a) => a.type === "bond")!;
    const etf = ASSET_CATALOG.find((a) => a.type === "etf" && a.risk === "high")!;
    expect(matchAssetToProfile(bond, conservativeProfile)).toBeGreaterThan(
      matchAssetToProfile(etf, conservativeProfile)
    );
  });

  it("score is between 0 and 100", () => {
    for (const asset of ASSET_CATALOG) {
      const score = matchAssetToProfile(asset, conservativeProfile);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

describe("generateFallbackRecommendations", () => {
  it("returns exactly 3 recommendations", () => {
    const profile: UserProfileInput = {
      risk_profile: "moderate",
      investment_goal: "Crecer a largo plazo",
      max_investment_usd: 200,
    };
    const recs = generateFallbackRecommendations(profile);
    expect(recs).toHaveLength(3);
  });

  it("suggested amounts do not exceed max_investment_usd", () => {
    const profile: UserProfileInput = {
      risk_profile: "conservative",
      investment_goal: "Ahorrar",
      max_investment_usd: 50,
    };
    const recs = generateFallbackRecommendations(profile);
    for (const rec of recs) {
      expect(rec.suggestedAmount).toBeLessThanOrEqual(50);
    }
  });

  it("all recommendations have required fields", () => {
    const profile: UserProfileInput = {
      risk_profile: "aggressive",
      investment_goal: "Máximo crecimiento",
      max_investment_usd: 500,
    };
    const recs = generateFallbackRecommendations(profile);
    for (const rec of recs) {
      expect(rec.assetSymbol).toBeTruthy();
      expect(rec.assetName).toBeTruthy();
      expect(rec.confidenceScore).toBeGreaterThan(0);
      expect(rec.reasoning).toBeTruthy();
      expect(rec.expiresAt).toBeTruthy();
    }
  });
});

describe("explainRiskInSimpleTerms", () => {
  it("returns a non-empty string for all risk levels and asset types", () => {
    const risks = ["low", "medium", "high"] as const;
    const types = ["etf", "bond", "crypto", "stock"] as const;
    for (const risk of risks) {
      for (const type of types) {
        const explanation = explainRiskInSimpleTerms(risk, type);
        expect(explanation.length).toBeGreaterThan(10);
      }
    }
  });
});
