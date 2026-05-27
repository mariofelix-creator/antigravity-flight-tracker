import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// ─── Fonts ──────────────────────────────────────────────────────────────────

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ─── Metadata ───────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "MicroGuard — Invierte desde $10 USD",
    template: "%s | MicroGuard",
  },
  description:
    "Invierte desde $10 USD con inteligencia artificial. Seguro, transparente y sin complicaciones para principiantes.",
  keywords: [
    "micro inversiones",
    "inversiones",
    "fintech",
    "ETF",
    "inteligencia artificial",
    "ahorro",
  ],
  authors: [{ name: "MicroGuard" }],
  creator: "MicroGuard",
  publisher: "MicroGuard",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://microguard.app"
  ),
  openGraph: {
    type: "website",
    locale: "es_MX",
    title: "MicroGuard — Invierte desde $10 USD con IA",
    description:
      "La app de micro-inversiones más simple y segura. Empieza con solo $10 USD.",
    siteName: "MicroGuard",
  },
  twitter: {
    card: "summary_large_image",
    title: "MicroGuard — Invierte desde $10 USD con IA",
    description:
      "La app de micro-inversiones más simple y segura. Empieza con solo $10 USD.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-72x72.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MicroGuard",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1da86a" },
    { media: "(prefers-color-scheme: dark)", color: "#0e6e44" },
  ],
};

// ─── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-background antialiased`}
      >
        {children}
        <Toaster />

        {/* Service Worker registration — runs only in browser */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker
                    .register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[MicroGuard] SW registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[MicroGuard] SW registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
