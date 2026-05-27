"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type RiskProfile = "conservative" | "moderate" | "aggressive";
type InvestmentGoal = "emergency" | "longterm" | "income" | "learn";

interface OnboardingState {
  amount: number;
  riskProfile: RiskProfile | null;
  goal: InvestmentGoal | null;
}

const QUICK_AMOUNTS = [50, 100, 200, 500] as const;

const RISK_OPTIONS: {
  value: RiskProfile;
  emoji: string;
  label: string;
  description: string;
}[] = [
  {
    value: "conservative",
    emoji: "🛡️",
    label: "Conservador",
    description: "Prefiero seguridad. Menos ganancias pero más estabilidad.",
  },
  {
    value: "moderate",
    emoji: "⚖️",
    label: "Moderado",
    description: "Acepto algo de variación para crecer más.",
  },
  {
    value: "aggressive",
    emoji: "🚀",
    label: "Agresivo",
    description: "Busco máximo crecimiento. Entiendo el riesgo.",
  },
];

const GOAL_OPTIONS: {
  value: InvestmentGoal;
  emoji: string;
  label: string;
  goalText: string;
}[] = [
  {
    value: "emergency",
    emoji: "💰",
    label: "Ahorrar para emergencias",
    goalText: "Quiero ahorrar para emergencias",
  },
  {
    value: "longterm",
    emoji: "📈",
    label: "Crecer a largo plazo",
    goalText: "Quiero crecer mi dinero a largo plazo",
  },
  {
    value: "income",
    emoji: "💸",
    label: "Ingreso extra mensual",
    goalText: "Quiero generar un ingreso extra mensual",
  },
  {
    value: "learn",
    emoji: "📚",
    label: "Aprender a invertir",
    goalText: "Quiero aprender a invertir",
  },
];

const STEP_TITLES = [
  "¿Cuánto quieres invertir?",
  "¿Cuál es tu perfil de riesgo?",
  "¿Cuál es tu objetivo?",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<OnboardingState>({
    amount: 100,
    riskProfile: null,
    goal: null,
  });

  const progressValue = ((step + 1) / 3) * 100;

  const canProceed = () => {
    if (step === 0) return state.amount >= 10;
    if (step === 1) return state.riskProfile !== null;
    if (step === 2) return state.goal !== null;
    return false;
  };

  const handleNext = async () => {
    if (step < 2) {
      setStep((s: number) => s + 1);
      return;
    }

    // Final step: submit onboarding
    if (!state.riskProfile || !state.goal) return;

    setLoading(true);
    setError(null);

    const goalOption = GOAL_OPTIONS.find((g) => g.value === state.goal);
    const payload = {
      fullName: "",
      riskProfile: state.riskProfile,
      investmentGoal: goalOption?.goalText ?? state.goal,
      maxInvestmentUsd: state.amount,
    };

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Ocurrió un error. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("No se pudo guardar tu perfil. Verifica tu conexión.");
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s: number) => s - 1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Paso {step + 1} de 3</span>
          <span>{Math.round(progressValue)}%</span>
        </div>
        <Progress value={progressValue} />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex flex-col gap-5"
        >
          <h2 className="text-xl font-bold text-foreground">
            {STEP_TITLES[step]}
          </h2>

          {/* Step 0: Amount */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <p className="text-sm text-muted-foreground">
                Puedes empezar desde $10 USD
              </p>

              {/* Quick select buttons */}
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setState((s: OnboardingState) => ({ ...s, amount }))}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150",
                      state.amount === amount
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-border bg-white text-foreground hover:border-brand-300 hover:bg-brand-50/50"
                    )}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Amount display */}
              <div className="text-center">
                <span className="text-4xl font-bold text-brand-600">
                  ${state.amount}
                </span>
                <span className="text-sm text-muted-foreground ml-1">USD</span>
              </div>

              {/* Slider */}
              <Slider
                min={10}
                max={500}
                step={10}
                value={[state.amount]}
                onValueChange={([val]: [number]) =>
                  setState((s: OnboardingState) => ({ ...s, amount: val ?? s.amount }))
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$10</span>
                <span>$500</span>
              </div>

              <p className="text-xs text-muted-foreground bg-brand-50 rounded-lg px-4 py-3">
                Sin compromisos. Puedes cambiar esto en cualquier momento desde
                tu perfil.
              </p>
            </div>
          )}

          {/* Step 1: Risk profile */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              {RISK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setState((s: OnboardingState) => ({ ...s, riskProfile: option.value }))
                  }
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150",
                    state.riskProfile === option.value
                      ? "border-brand-500 bg-brand-50"
                      : "border-border bg-white hover:border-brand-200 hover:bg-brand-50/40"
                  )}
                >
                  <span className="text-2xl mt-0.5" aria-hidden="true">
                    {option.emoji}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        state.riskProfile === option.value
                          ? "text-brand-700"
                          : "text-foreground"
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="text-sm text-muted-foreground leading-snug">
                      {option.description}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "ml-auto mt-0.5 h-5 w-5 rounded-full border-2 flex-shrink-0 transition-all",
                      state.riskProfile === option.value
                        ? "border-brand-500 bg-brand-500"
                        : "border-border"
                    )}
                  >
                    {state.riskProfile === option.value && (
                      <div className="h-full w-full rounded-full flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GOAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setState((s: OnboardingState) => ({ ...s, goal: option.value }))
                  }
                  className={cn(
                    "flex flex-col items-center gap-2 p-5 rounded-xl border-2 text-center transition-all duration-150",
                    state.goal === option.value
                      ? "border-brand-500 bg-brand-50"
                      : "border-border bg-white hover:border-brand-200 hover:bg-brand-50/40"
                  )}
                >
                  <span className="text-3xl" aria-hidden="true">
                    {option.emoji}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold leading-snug",
                      state.goal === option.value
                        ? "text-brand-700"
                        : "text-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-danger-500/10 border border-danger-400/30 px-4 py-3">
          <p className="text-sm text-danger-600">{error}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-2">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
        )}
        <Button
          type="button"
          size="lg"
          className="flex-1"
          disabled={!canProceed() || loading}
          onClick={handleNext}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : step === 2 ? (
            "Empezar a invertir"
          ) : (
            "Siguiente"
          )}
        </Button>
      </div>
    </div>
  );
}
