import { Resend } from "resend";
import {
  WelcomeEmailTemplate,
  InvestmentOfferTemplate,
  UrgencyReminderTemplate,
  WeeklyDigestTemplate,
  PortfolioAlertTemplate,
  WELCOME_EMAIL_SUBJECT,
  getInvestmentOfferSubject,
  getUrgencyReminderSubject,
  getWeeklyDigestSubject,
  getPortfolioAlertSubject,
  type WelcomeEmailProps,
  type InvestmentOfferProps,
  type UrgencyReminderProps,
  type WeeklyDigestProps,
  type PortfolioAlertProps,
} from "@/lib/email/templates";

// ─── Singleton Resend client ──────────────────────────────────────────────────

let _resend: Resend | null = null;

function getResendClient(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? "noreply@microguard.app";

// ─── Shared error handler ─────────────────────────────────────────────────────

function handleEmailError(context: string, error: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[email] Failed to send ${context}:`, error);
  }
}

// ─── Send functions ───────────────────────────────────────────────────────────

/**
 * Sends the welcome email to a new user after onboarding.
 */
export async function sendWelcomeEmail(
  to: string,
  props: WelcomeEmailProps
): Promise<void> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: WELCOME_EMAIL_SUBJECT,
      react: WelcomeEmailTemplate(props),
    });
  } catch (error) {
    handleEmailError("welcome email", error);
  }
}

/**
 * Sends an investment opportunity email to a user.
 */
export async function sendInvestmentOffer(
  to: string,
  props: InvestmentOfferProps
): Promise<void> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: getInvestmentOfferSubject(props.assetName),
      react: InvestmentOfferTemplate(props),
    });
  } catch (error) {
    handleEmailError("investment offer email", error);
  }
}

/**
 * Sends an urgency reminder when an offer is about to expire.
 */
export async function sendUrgencyReminder(
  to: string,
  props: UrgencyReminderProps
): Promise<void> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: getUrgencyReminderSubject(props.hoursLeft),
      react: UrgencyReminderTemplate(props),
    });
  } catch (error) {
    handleEmailError("urgency reminder email", error);
  }
}

/**
 * Sends the weekly portfolio digest email.
 */
export async function sendWeeklyDigest(
  to: string,
  props: WeeklyDigestProps
): Promise<void> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: getWeeklyDigestSubject(props.weekReturnPct),
      react: WeeklyDigestTemplate(props),
    });
  } catch (error) {
    handleEmailError("weekly digest email", error);
  }
}

/**
 * Sends a portfolio alert when an asset changes significantly.
 */
export async function sendPortfolioAlert(
  to: string,
  props: PortfolioAlertProps
): Promise<void> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: getPortfolioAlertSubject(props.assetName, props.changePercent),
      react: PortfolioAlertTemplate(props),
    });
  } catch (error) {
    handleEmailError("portfolio alert email", error);
  }
}
