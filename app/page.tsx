"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Shield,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  DollarSign,
  BarChart3,
  Lock,
} from "lucide-react";

// ─── Animation variants ──────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Shield,
    title: "100% Seguro",
    description:
      "Tu dinero está protegido con encriptación bancaria. Fondos regulados y auditados por terceros.",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: Zap,
    title: "IA Inteligente",
    description:
      "Nuestra IA analiza el mercado las 24 horas y te sugiere las mejores opciones para tu perfil.",
    color: "bg-accent-50 text-accent-600",
  },
  {
    icon: TrendingUp,
    title: "Sin Complicaciones",
    description:
      "Diseñado para principiantes. Invierte en 3 clics sin necesitar conocer finanzas.",
    color: "bg-brand-50 text-brand-600",
  },
];

const steps = [
  {
    number: "01",
    icon: DollarSign,
    title: "Crea tu cuenta gratis",
    description:
      "Regístrate en 2 minutos con tu email. Sin papeleos, sin burocracia.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Define tu perfil",
    description:
      "Cuéntanos cuánto quieres invertir y cuál es tu objetivo. La IA hace el resto.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Empieza a crecer",
    description:
      "Confirma tu primera inversión con un clic. Monitorea tus ganancias en tiempo real.",
  },
];

const socialProof = [
  { stat: "$2.4M", label: "invertidos por usuarios" },
  { stat: "12,000+", label: "inversores activos" },
  { stat: "8.3%", label: "retorno promedio anual" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">MicroGuard</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">
              Cómo funciona
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Beneficios
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Empieza gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="hero-gradient py-16 sm:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
            >
              <Star className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
              La app de micro-inversiones #1 en Latinoamérica
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance mb-6"
            >
              Invierte desde{" "}
              <span className="text-brand-500">$10 USD</span>{" "}
              con IA
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance"
            >
              MicroGuard usa inteligencia artificial para encontrar las mejores
              oportunidades de inversión para ti. Sin conocimientos previos, sin
              comisiones ocultas.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-brand-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-brand-600 transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
              >
                Empieza gratis ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-foreground font-medium px-8 py-4 rounded-xl border border-border hover:border-brand-300 transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </motion.div>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
              className="mt-4 text-xs text-muted-foreground"
            >
              Sin tarjeta de crédito · Sin costo de registro · Cancela cuando quieras
            </motion.p>
          </div>

          {/* Social proof strip */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto mt-14 grid grid-cols-3 gap-4 sm:gap-8 border border-brand-100 bg-white/60 backdrop-blur-sm rounded-2xl p-5 sm:p-6"
          >
            {socialProof.map(({ stat, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-brand-600">{stat}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-16 sm:py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Diseñado para que todos puedan invertir
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                No importa si es tu primera vez. MicroGuard te guía paso a paso.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, description, color }, i) => (
                <motion.div
                  key={title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  custom={i}
                  className="bg-surface-subtle border border-border rounded-2xl p-6 card-hover"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <section id="como-funciona" className="py-16 sm:py-24 px-4 bg-surface-subtle">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Empieza a invertir en 3 pasos
              </h2>
              <p className="text-muted-foreground text-lg">
                Más sencillo que pedir una pizza.
              </p>
            </div>

            <div className="space-y-6">
              {steps.map(({ number, icon: Icon, title, description }, i) => (
                <motion.div
                  key={number}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  custom={i * 0.5}
                  className="flex gap-5 bg-white border border-border rounded-2xl p-6 card-hover"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-brand-500" />
                      <h3 className="font-semibold text-foreground">{title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                  </div>
                  <CheckCircle className="flex-shrink-0 w-5 h-5 text-brand-400 mt-1" />
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-brand-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-brand-600 transition-all hover:shadow-lg hover:shadow-brand-500/25"
              >
                Crear mi cuenta gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Trust banner ── */}
        <section className="py-12 px-4 bg-brand-500">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-white text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <Lock className="w-5 h-5 text-brand-200" />
                <span className="font-semibold text-lg">Tu dinero, siempre protegido</span>
              </div>
              <p className="text-brand-100 text-sm">
                Encriptación AES-256 · Fondos en custodia regulada · Auditorías mensuales
              </p>
            </div>
            <Link
              href="/signup"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors"
            >
              Comenzar ahora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-surface-subtle border-t border-border py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground">MicroGuard</span>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong>Aviso legal:</strong> MicroGuard no es un asesor financiero registrado. Invertir
            implica riesgos, incluyendo la posible pérdida del capital invertido. Los rendimientos
            históricos no garantizan resultados futuros. Lee nuestros{" "}
            <a href="#" className="underline hover:text-foreground transition-colors">Términos y Condiciones</a>{" "}
            antes de invertir.
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            © {new Date().getFullYear()} MicroGuard. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
