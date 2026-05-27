import * as React from "react";

// ─── Prop types ───────────────────────────────────────────────────────────────

export interface WelcomeEmailProps {
  userName: string;
  riskProfile: string;
  investmentGoal: string;
  appUrl: string;
}

export interface InvestmentOfferProps {
  userName: string;
  assetName: string;
  assetSymbol: string;
  minInvestment: number;
  expectedReturnPct: number;
  offerExpiresAt: string;
  appUrl: string;
}

export interface UrgencyReminderProps {
  userName: string;
  assetName: string;
  hoursLeft: number;
  minInvestment: number;
  appUrl: string;
}

export interface WeeklyDigestProps {
  userName: string;
  weekReturnPct: number;
  totalValue: number;
  topOpportunity: string;
  appUrl: string;
}

export interface PortfolioAlertProps {
  userName: string;
  assetName: string;
  changePercent: number;
  isPositive: boolean;
  currentValue: number;
  appUrl: string;
}

// ─── Design tokens (inline for email client compatibility) ───────────────────

const colors = {
  brand: "#1da86a",
  brandDark: "#0e6e44",
  brandLight: "#eefbf3",
  blue: "#1e3a8a",
  blueLight: "#eff6ff",
  bg: "#f1f5f9",
  white: "#ffffff",
  textPrimary: "#0f172a",
  textMuted: "#64748b",
  textSmall: "#94a3b8",
  danger: "#dc2626",
  dangerLight: "#fef2f2",
  warning: "#d97706",
  warningLight: "#fffbeb",
  border: "#e2e8f0",
};

const styles = {
  wrapper: {
    backgroundColor: colors.bg,
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "32px 16px",
    margin: 0,
  } as React.CSSProperties,

  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: colors.white,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  } as React.CSSProperties,

  header: {
    backgroundColor: colors.brand,
    padding: "28px 32px",
    textAlign: "center" as const,
  } as React.CSSProperties,

  logoText: {
    color: colors.white,
    fontSize: "24px",
    fontWeight: "bold",
    letterSpacing: "-0.5px",
    margin: 0,
  } as React.CSSProperties,

  logoTagline: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    margin: "4px 0 0",
  } as React.CSSProperties,

  body: {
    padding: "32px",
  } as React.CSSProperties,

  h1: {
    color: colors.textPrimary,
    fontSize: "22px",
    fontWeight: "bold",
    margin: "0 0 16px",
    lineHeight: "1.3",
  } as React.CSSProperties,

  h2: {
    color: colors.textPrimary,
    fontSize: "16px",
    fontWeight: "bold",
    margin: "24px 0 8px",
  } as React.CSSProperties,

  p: {
    color: colors.textMuted,
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px",
  } as React.CSSProperties,

  ctaButton: {
    display: "inline-block",
    backgroundColor: colors.brand,
    color: colors.white,
    fontSize: "15px",
    fontWeight: "bold",
    textDecoration: "none",
    padding: "14px 32px",
    borderRadius: "8px",
    margin: "8px 0 24px",
  } as React.CSSProperties,

  infoBox: {
    backgroundColor: colors.brandLight,
    border: `1px solid ${colors.brand}30`,
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "16px 0",
  } as React.CSSProperties,

  metricRow: {
    display: "flex" as const,
  } as React.CSSProperties,

  metricCell: {
    flex: "1",
    padding: "12px 16px",
    backgroundColor: colors.bg,
    borderRadius: "8px",
    textAlign: "center" as const,
    margin: "0 4px",
  } as React.CSSProperties,

  metricLabel: {
    color: colors.textSmall,
    fontSize: "11px",
    fontWeight: "bold",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    margin: "0 0 4px",
  } as React.CSSProperties,

  metricValue: {
    color: colors.textPrimary,
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
  } as React.CSSProperties,

  divider: {
    borderTop: `1px solid ${colors.border}`,
    margin: "24px 0",
  } as React.CSSProperties,

  footer: {
    backgroundColor: colors.bg,
    padding: "20px 32px",
    borderTop: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  footerText: {
    color: colors.textSmall,
    fontSize: "11px",
    lineHeight: "1.5",
    margin: "0 0 6px",
    textAlign: "center" as const,
  } as React.CSSProperties,

  unsubscribeLink: {
    color: colors.textSmall,
    fontSize: "11px",
    textDecoration: "underline",
  } as React.CSSProperties,

  disclaimer: {
    color: colors.textSmall,
    fontSize: "11px",
    lineHeight: "1.5",
    fontStyle: "italic",
    margin: "16px 0 0",
    padding: "12px 16px",
    borderTop: `1px solid ${colors.border}`,
  } as React.CSSProperties,
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function EmailHeader({ subtitle }: { subtitle?: string }) {
  return (
    <div style={styles.header}>
      <p style={styles.logoText}>MicroGuard</p>
      {subtitle && <p style={styles.logoTagline}>{subtitle}</p>}
    </div>
  );
}

function EmailFooter({ appUrl }: { appUrl: string }) {
  return (
    <div style={styles.footer}>
      <p style={styles.footerText}>
        © 2024 MicroGuard. Las inversiones conllevan riesgo de pérdida del
        capital invertido.
      </p>
      <p style={{ ...styles.footerText, margin: 0 }}>
        <a href={`${appUrl}/settings/notifications`} style={styles.unsubscribeLink}>
          Gestionar preferencias de email
        </a>
        {" · "}
        <a href={`${appUrl}/settings/notifications`} style={styles.unsubscribeLink}>
          Darme de baja
        </a>
      </p>
    </div>
  );
}

function RiskDisclaimer() {
  return (
    <p style={styles.disclaimer}>
      Las recomendaciones de MicroGuard son generadas por un sistema
      automatizado y no constituyen asesoramiento financiero personalizado.
      Los rendimientos históricos no garantizan resultados futuros. Toda
      inversión conlleva riesgo de pérdida.
    </p>
  );
}

// ─── Template 1: WelcomeEmailTemplate ────────────────────────────────────────

export const WELCOME_EMAIL_SUBJECT =
  "Bienvenido a MicroGuard — Tu primera inversión te espera 🌱";

export function WelcomeEmailTemplate({
  userName,
  riskProfile,
  investmentGoal,
  appUrl,
}: WelcomeEmailProps) {
  const riskLabels: Record<string, string> = {
    conservative: "Conservador — priorizas preservar tu capital",
    moderate: "Moderado — buscas equilibrio entre seguridad y crecimiento",
    aggressive: "Agresivo — toleras más riesgo a cambio de mayor potencial",
  };
  const riskLabel = riskLabels[riskProfile] ?? riskProfile;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <EmailHeader subtitle="Tu plataforma de microinversiones" />

        <div style={styles.body}>
          <h1 style={styles.h1}>Hola, {userName} 👋</h1>

          <p style={styles.p}>
            Tu cuenta de MicroGuard está lista. Te damos la bienvenida a una
            plataforma diseñada para ayudarte a construir tu patrimonio de forma
            gradual, con información clara y sin sorpresas.
          </p>

          <h2 style={styles.h2}>Tu perfil de inversión</h2>
          <div style={styles.infoBox}>
            <p style={{ ...styles.p, margin: "0 0 8px", fontWeight: "bold", color: colors.textPrimary }}>
              Perfil de riesgo
            </p>
            <p style={{ ...styles.p, margin: "0 0 16px" }}>{riskLabel}</p>
            <p style={{ ...styles.p, margin: "0 0 4px", fontWeight: "bold", color: colors.textPrimary }}>
              Objetivo de inversión
            </p>
            <p style={{ ...styles.p, margin: 0 }}>{investmentGoal}</p>
          </div>

          <p style={styles.p}>
            Basándonos en este perfil te mostraremos oportunidades de inversión
            adecuadas para ti. Siempre podrás ajustar tus preferencias desde tu
            cuenta.
          </p>

          <p style={styles.p}>
            Recuerda: no existe inversión sin riesgo. Nuestro objetivo es darte
            las herramientas para tomar decisiones informadas, no garantizarte
            resultados.
          </p>

          <div style={{ textAlign: "center" }}>
            <a href={`${appUrl}/dashboard`} style={styles.ctaButton}>
              Ver mi dashboard
            </a>
          </div>

          <RiskDisclaimer />
        </div>

        <EmailFooter appUrl={appUrl} />
      </div>
    </div>
  );
}

// ─── Template 2: InvestmentOfferTemplate ─────────────────────────────────────

export function getInvestmentOfferSubject(assetName: string) {
  return `Nueva oportunidad: Invierte en ${assetName} hoy`;
}

export function InvestmentOfferTemplate({
  userName,
  assetName,
  assetSymbol,
  minInvestment,
  expectedReturnPct,
  offerExpiresAt,
  appUrl,
}: InvestmentOfferProps) {
  const expiryDate = new Date(offerExpiresAt).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Green header with asset symbol */}
        <div
          style={{
            ...styles.header,
            background: `linear-gradient(135deg, ${colors.brandDark} 0%, ${colors.brand} 100%)`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              width: "56px",
              height: "56px",
              lineHeight: "56px",
              textAlign: "center",
              marginBottom: "12px",
              fontSize: "18px",
              fontWeight: "bold",
              color: colors.white,
              letterSpacing: "-0.5px",
            }}
          >
            {assetSymbol.slice(0, 3)}
          </div>
          <p style={styles.logoText}>{assetName}</p>
          <p style={styles.logoTagline}>Nueva oportunidad en MicroGuard</p>
        </div>

        <div style={styles.body}>
          <h1 style={styles.h1}>Hola, {userName}</h1>

          <p style={styles.p}>
            Hemos identificado una oportunidad que podría encajar con tu perfil
            de inversión. Te la compartimos con datos concretos para que puedas
            evaluarla tú mismo.
          </p>

          <h2 style={styles.h2}>¿Por qué te lo recomendamos?</h2>
          <p style={styles.p}>
            Este activo ha mostrado consistencia histórica dentro de su
            categoría. Nuestro sistema lo ha seleccionado en función de tu
            perfil de riesgo y tus objetivos declarados. No garantizamos
            rentabilidad futura: esta es información para tu análisis, no un
            consejo financiero.
          </p>

          {/* Key metrics */}
          <div style={{ margin: "20px 0" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "8px" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: colors.bg,
                      borderRadius: "8px",
                      padding: "14px 16px",
                      textAlign: "center",
                      width: "33%",
                    }}
                  >
                    <p style={styles.metricLabel}>Mínimo</p>
                    <p style={styles.metricValue}>${minInvestment}</p>
                  </td>
                  <td
                    style={{
                      backgroundColor: colors.bg,
                      borderRadius: "8px",
                      padding: "14px 16px",
                      textAlign: "center",
                      width: "33%",
                    }}
                  >
                    <p style={styles.metricLabel}>Retorno hist. prom.</p>
                    <p style={{ ...styles.metricValue, color: colors.brand }}>
                      {expectedReturnPct > 0 ? "+" : ""}{expectedReturnPct}%
                    </p>
                  </td>
                  <td
                    style={{
                      backgroundColor: colors.bg,
                      borderRadius: "8px",
                      padding: "14px 16px",
                      textAlign: "center",
                      width: "33%",
                    }}
                  >
                    <p style={styles.metricLabel}>Vence</p>
                    <p style={{ ...styles.metricValue, fontSize: "13px" }}>{expiryDate}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: "center" }}>
            <a href={`${appUrl}/campaigns`} style={styles.ctaButton}>
              Invertir ahora
            </a>
          </div>

          <RiskDisclaimer />
        </div>

        <EmailFooter appUrl={appUrl} />
      </div>
    </div>
  );
}

// ─── Template 3: UrgencyReminderTemplate ─────────────────────────────────────

export function getUrgencyReminderSubject(hoursLeft: number) {
  return `⏰ Quedan ${hoursLeft}h — No pierdas esta oportunidad`;
}

export function UrgencyReminderTemplate({
  userName,
  assetName,
  hoursLeft,
  minInvestment,
  appUrl,
}: UrgencyReminderProps) {
  const isVeryUrgent = hoursLeft <= 3;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <EmailHeader subtitle="Recordatorio de oferta" />

        <div style={styles.body}>
          {/* Urgency badge */}
          <div
            style={{
              display: "inline-block",
              backgroundColor: isVeryUrgent ? colors.dangerLight : colors.warningLight,
              border: `1px solid ${isVeryUrgent ? colors.danger : colors.warning}40`,
              borderRadius: "20px",
              padding: "6px 14px",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                color: isVeryUrgent ? colors.danger : colors.warning,
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              {isVeryUrgent ? "⚠️ Últimas horas" : "⏰ Oferta por tiempo limitado"}
            </span>
          </div>

          <h1 style={styles.h1}>
            Hola, {userName} — la oferta de {assetName} está por cerrar
          </h1>

          <p style={styles.p}>
            Te recordamos que la oportunidad que compartimos contigo
            anteriormente está próxima a vencer. Si estás considerando
            participar, este es el momento de revisar los detalles.
          </p>

          {/* Hours counter */}
          <div
            style={{
              backgroundColor: colors.brandLight,
              border: `1px solid ${colors.brand}40`,
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
              margin: "24px 0",
            }}
          >
            <p
              style={{
                color: colors.brand,
                fontSize: "56px",
                fontWeight: "bold",
                margin: "0",
                lineHeight: "1",
              }}
            >
              {hoursLeft}h
            </p>
            <p
              style={{
                color: colors.textMuted,
                fontSize: "14px",
                margin: "8px 0 0",
              }}
            >
              horas restantes para invertir en {assetName}
            </p>
          </div>

          <p style={styles.p}>
            Inversión mínima:{" "}
            <strong style={{ color: colors.textPrimary }}>${minInvestment} USD</strong>
          </p>

          <p style={styles.p}>
            Si decidiste no participar, no te preocupes — habrá nuevas
            oportunidades. Solo te avisamos para que tengas la información
            completa.
          </p>

          <div style={{ textAlign: "center" }}>
            <a href={`${appUrl}/campaigns`} style={styles.ctaButton}>
              Ver oferta antes de que expire
            </a>
          </div>

          <RiskDisclaimer />
        </div>

        <EmailFooter appUrl={appUrl} />
      </div>
    </div>
  );
}

// ─── Template 4: WeeklyDigestTemplate ────────────────────────────────────────

export function getWeeklyDigestSubject(weekReturnPct: number) {
  const sign = weekReturnPct > 0 ? "+" : "";
  return `Tu semana en MicroGuard — ${sign}${weekReturnPct}% 📊`;
}

export function WeeklyDigestTemplate({
  userName,
  weekReturnPct,
  totalValue,
  topOpportunity,
  appUrl,
}: WeeklyDigestProps) {
  const isPositive = weekReturnPct >= 0;
  const returnColor = isPositive ? colors.brand : colors.danger;
  const returnSign = isPositive ? "+" : "";

  const totalFormatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalValue);

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <EmailHeader subtitle="Tu resumen semanal" />

        <div style={styles.body}>
          <h1 style={styles.h1}>Tu semana en MicroGuard, {userName}</h1>

          <p style={styles.p}>
            Aquí tienes el resumen de tu cartera durante los últimos 7 días.
          </p>

          {/* Portfolio value card */}
          <div
            style={{
              backgroundColor: colors.bg,
              borderRadius: "12px",
              padding: "24px",
              margin: "16px 0",
              textAlign: "center",
            }}
          >
            <p style={{ ...styles.p, margin: "0 0 4px", fontSize: "13px" }}>
              Valor actual de tu cartera
            </p>
            <p
              style={{
                color: colors.textPrimary,
                fontSize: "32px",
                fontWeight: "bold",
                margin: "0 0 12px",
                lineHeight: "1",
              }}
            >
              {totalFormatted}
            </p>

            {/* Weekly return badge */}
            <div
              style={{
                display: "inline-block",
                backgroundColor: isPositive ? colors.brandLight : colors.dangerLight,
                border: `1px solid ${returnColor}30`,
                borderRadius: "20px",
                padding: "6px 16px",
              }}
            >
              <span
                style={{
                  color: returnColor,
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {returnSign}{weekReturnPct}% esta semana
              </span>
            </div>
          </div>

          <div style={styles.divider} />

          <h2 style={styles.h2}>Esta semana en los mercados</h2>
          <p style={styles.p}>
            Los mercados internacionales mantuvieron una volatilidad moderada
            esta semana, influenciados por datos macroeconómicos y movimientos
            en divisas. Los activos de renta fija mostraron estabilidad
            relativa, mientras que la renta variable registró movimientos mixtos
            según el sector.
          </p>

          <h2 style={styles.h2}>Top oportunidad de la semana</h2>
          <div style={styles.infoBox}>
            <p
              style={{
                ...styles.p,
                margin: 0,
                fontWeight: "bold",
                color: colors.textPrimary,
              }}
            >
              {topOpportunity}
            </p>
          </div>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <a href={`${appUrl}/dashboard`} style={styles.ctaButton}>
              Ver mi cartera completa
            </a>
          </div>

          <RiskDisclaimer />
        </div>

        <EmailFooter appUrl={appUrl} />
      </div>
    </div>
  );
}

// ─── Template 5: PortfolioAlertTemplate ──────────────────────────────────────

export function getPortfolioAlertSubject(assetName: string, changePercent: number) {
  return `Alerta: Tu inversión en ${assetName} cambió ${changePercent}%`;
}

export function PortfolioAlertTemplate({
  userName,
  assetName,
  changePercent,
  isPositive,
  currentValue,
  appUrl,
}: PortfolioAlertProps) {
  const absChange = Math.abs(changePercent);
  const isSignificant = absChange >= 5;
  const sign = isPositive ? "+" : "-";
  const changeColor = isPositive ? colors.brand : colors.danger;

  const currentFormatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(currentValue);

  const contextTitle = isPositive
    ? "¿Debo hacer algo?"
    : isSignificant
    ? "¿Debo preocuparme?"
    : "¿Es esto normal?";

  const contextText = isPositive
    ? `Tu inversión en ${assetName} ha subido un ${absChange}%. Esto es una buena señal, pero recuerda que los mercados fluctúan en ambas direcciones. No es necesario actuar de inmediato; mantener una estrategia de largo plazo suele ser más efectivo que reaccionar a movimientos cortos.`
    : isSignificant
    ? `Una caída del ${absChange}% es un movimiento relevante. Sin embargo, las fluctuaciones del mercado son parte normal de invertir. Si tu horizonte de inversión es de mediano o largo plazo, los cambios temporales de precio no cambian el fundamento del activo. Te recomendamos revisar si esto afecta tu estrategia original.`
    : `Una variación del ${absChange}% está dentro del rango habitual para este tipo de activo. Los mercados fluctúan diariamente y esto no implica una acción inmediata. Mantén el foco en tu objetivo de inversión a largo plazo.`;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <EmailHeader subtitle="Alerta de cartera" />

        <div style={styles.body}>
          <h1 style={styles.h1}>
            Movimiento en tu inversión, {userName}
          </h1>

          {/* Asset change card */}
          <div
            style={{
              backgroundColor: isPositive ? colors.brandLight : colors.dangerLight,
              border: `1px solid ${changeColor}30`,
              borderRadius: "12px",
              padding: "24px",
              margin: "16px 0",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: colors.textMuted,
                fontSize: "13px",
                margin: "0 0 8px",
              }}
            >
              {assetName}
            </p>
            <p
              style={{
                color: changeColor,
                fontSize: "40px",
                fontWeight: "bold",
                margin: "0 0 8px",
                lineHeight: "1",
              }}
            >
              {sign}{absChange}%
            </p>
            <p
              style={{
                color: colors.textMuted,
                fontSize: "14px",
                margin: 0,
              }}
            >
              Valor actual: <strong style={{ color: colors.textPrimary }}>{currentFormatted}</strong>
            </p>
          </div>

          <h2 style={styles.h2}>{contextTitle}</h2>
          <p style={styles.p}>{contextText}</p>

          <div style={{ textAlign: "center" }}>
            <a href={`${appUrl}/dashboard`} style={styles.ctaButton}>
              Ver mi cartera
            </a>
          </div>

          <RiskDisclaimer />
        </div>

        <EmailFooter appUrl={appUrl} />
      </div>
    </div>
  );
}
