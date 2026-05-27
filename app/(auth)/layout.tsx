import React from "react";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 rounded-xl bg-brand-500">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-brand-700 tracking-tight">
          MicroGuard
        </span>
      </div>

      {/* Card container */}
      <div className="w-full md:max-w-md bg-white rounded-2xl shadow-lg border border-brand-100/60 p-6 md:p-8">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        Tus inversiones protegidas con tecnología de grado financiero.
      </p>
    </div>
  );
}
