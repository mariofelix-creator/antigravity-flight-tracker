// Campaign copywriting — honest, transparent, no hype

export const CAMPAIGN_COPY = {
  offerBanner: {
    headline: "Oportunidad identificada por IA",
    subheadline: (riskProfile: string) =>
      `Basado en tu perfil ${riskLabel(riskProfile)}, este activo podría encajar contigo`,
    cta: "Ver oportunidad",
    disclaimer: "Inversión sujeta a riesgo de mercado. Rendimientos pasados no garantizan resultados futuros.",
  },

  urgency: {
    headline: "Esta oportunidad expira pronto",
    body: "Sin comisiones ocultas. Sin letra pequeña.",
    cta: "Invertir ahora",
    hoursLeft: (h: number) => `Quedan ${h} hora${h !== 1 ? "s" : ""}`,
  },

  onboardingSuccess: {
    headline: "¡Tu perfil está listo!",
    body: (count: number, goal: string) =>
      `Encontramos ${count} oportunidad${count !== 1 ? "es" : ""} para tu objetivo: ${goal}`,
    cta: "Ver mis recomendaciones",
  },

  riskDisclaimer: {
    conservative:
      "Este activo tiene bajo riesgo histórico, aunque ninguna inversión está garantizada.",
    moderate:
      "Este activo tiene riesgo moderado: puede subir y bajar. Invertir solo lo que puedas mantener a mediano plazo.",
    aggressive:
      "Este activo tiene alto riesgo y puede perder valor significativo. Solo para quien tolere volatilidad.",
  },

  empty: {
    campaigns: "No hay oportunidades activas en este momento. Vuelve pronto.",
    recommendations: "Generando tus recomendaciones personalizadas...",
  },

  confirmInvestment: {
    title: (symbol: string) => `Confirmar inversión en ${symbol}`,
    noCommissions: "Sin comisiones de MicroGuard",
    disclaimer:
      "Al confirmar, aceptas que esta inversión conlleva riesgo de mercado y podrías perder parte o la totalidad del monto invertido.",
    confirm: "Confirmar inversión",
    cancel: "Cancelar",
  },

  emails: {
    welcome: {
      subject: "Bienvenido a MicroGuard — Tu primera inversión te espera 🌱",
      preheader: "Empezar a invertir nunca fue tan sencillo",
    },
    offer: {
      subject: (assetName: string) => `Nueva oportunidad: Invierte en ${assetName} hoy`,
      preheader: "Tu perfil de inversión identificó esta oportunidad",
    },
    urgency: {
      subject: (assetName: string, hours: number) =>
        `⏰ Quedan ${hours}h — Tu oportunidad en ${assetName}`,
      preheader: "Esta oferta cierra pronto",
    },
    weeklyDigest: {
      subject: (returnPct: string) => `Tu semana en MicroGuard — ${returnPct} 📊`,
      preheader: "Así evolucionó tu cartera esta semana",
    },
    portfolioAlert: {
      subject: (asset: string, change: string) => `Alerta: Tu inversión en ${asset} cambió ${change}`,
      preheader: "Actualización de tu cartera",
    },
  },
};

function riskLabel(profile: string): string {
  const labels: Record<string, string> = {
    conservative: "conservador",
    moderate: "moderado",
    aggressive: "agresivo",
  };
  return labels[profile] ?? profile;
}
