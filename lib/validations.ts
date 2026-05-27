import { z } from "zod";

// ─── Investment ───────────────────────────────────────────────────────────────

export const investmentSchema = z.object({
  assetSymbol: z
    .string()
    .min(1, "Asset symbol is required")
    .max(10, "Asset symbol must be 10 characters or fewer")
    .toUpperCase(),
  assetName: z
    .string()
    .min(1, "Asset name is required")
    .max(100, "Asset name must be 100 characters or fewer"),
  assetType: z.enum(["etf", "bond", "crypto", "stock"], {
    errorMap: () => ({ message: "Asset type must be etf, bond, crypto, or stock" }),
  }),
  amountUsd: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than 0")
    .max(500, "Maximum investment per transaction is $500 USD")
    .multipleOf(0.01, "Amount must have at most 2 decimal places"),
  portfolioId: z.string().uuid("portfolioId must be a valid UUID").optional(),
});

export type InvestmentInput = z.infer<typeof investmentSchema>;

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const onboardingSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name must be 120 characters or fewer"),
  riskProfile: z.enum(["conservative", "moderate", "aggressive"], {
    errorMap: () => ({
      message: "Risk profile must be conservative, moderate, or aggressive",
    }),
  }),
  investmentGoal: z
    .string()
    .min(5, "Please describe your investment goal")
    .max(500, "Investment goal must be 500 characters or fewer"),
  maxInvestmentUsd: z
    .number({
      required_error: "Maximum investment amount is required",
      invalid_type_error: "Maximum investment amount must be a number",
    })
    .positive("Amount must be greater than 0")
    .max(500, "MicroGuard limits investments to a maximum of $500 USD"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// ─── Push subscription ────────────────────────────────────────────────────────

export const pushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .url("endpoint must be a valid URL")
    .min(1, "endpoint is required"),
  keys: z.object({
    p256dh: z
      .string()
      .min(1, "p256dh key is required")
      .max(512, "p256dh key is too long"),
    auth: z
      .string()
      .min(1, "auth key is required")
      .max(256, "auth key is too long"),
  }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

// ─── Send notification (admin) ────────────────────────────────────────────────

export const sendNotificationSchema = z.object({
  userId: z.string().uuid("userId must be a valid UUID"),
  title: z
    .string()
    .min(1, "title is required")
    .max(100, "title must be 100 characters or fewer"),
  body: z
    .string()
    .min(1, "body is required")
    .max(300, "body must be 300 characters or fewer"),
  url: z.string().url("url must be a valid URL").optional(),
  urgent: z.boolean().optional().default(false),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Safely parses a Zod schema and returns either the typed data or a
 * formatted error string suitable for returning as `{ error }` in API routes.
 */
export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = result.error.errors.map((e) => e.message).join(", ");
  return { success: false, error: messages };
}
