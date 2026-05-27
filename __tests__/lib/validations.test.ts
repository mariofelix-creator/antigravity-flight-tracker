import { investmentSchema, onboardingSchema, pushSubscriptionSchema } from "@/lib/validations";

describe("investmentSchema", () => {
  it("accepts valid investment", () => {
    const result = investmentSchema.safeParse({
      assetSymbol: "VOO",
      assetName: "Vanguard S&P 500 ETF",
      assetType: "etf",
      amountUsd: 100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects amount over $500", () => {
    const result = investmentSchema.safeParse({
      assetSymbol: "VOO",
      assetName: "Vanguard S&P 500 ETF",
      assetType: "etf",
      amountUsd: 501,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = investmentSchema.safeParse({
      assetSymbol: "VOO",
      assetName: "Vanguard S&P 500 ETF",
      assetType: "etf",
      amountUsd: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = investmentSchema.safeParse({ amountUsd: 100 });
    expect(result.success).toBe(false);
  });
});

describe("onboardingSchema", () => {
  it("accepts valid onboarding data", () => {
    const result = onboardingSchema.safeParse({
      riskProfile: "moderate",
      investmentGoal: "Crecer a largo plazo",
      maxInvestmentUsd: 300,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid risk profile", () => {
    const result = onboardingSchema.safeParse({
      riskProfile: "ultra-aggressive",
      investmentGoal: "Test",
      maxInvestmentUsd: 100,
    });
    expect(result.success).toBe(false);
  });
});

describe("pushSubscriptionSchema", () => {
  it("accepts valid subscription", () => {
    const result = pushSubscriptionSchema.safeParse({
      endpoint: "https://fcm.googleapis.com/fcm/send/some-token",
      keys: { p256dh: "key123", auth: "auth456" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing keys", () => {
    const result = pushSubscriptionSchema.safeParse({
      endpoint: "https://example.com",
    });
    expect(result.success).toBe(false);
  });
});
