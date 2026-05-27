"use client";

import React from "react";
import { Bell } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

function getDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const greeting = getDayGreeting();

  return (
    <div className="min-h-screen bg-surface-subtle">
      {/* Sidebar — visible on md+ */}
      <Sidebar />

      {/* Main area */}
      <div className="md:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{greeting}</p>
            <p className="text-sm font-semibold text-foreground leading-tight">
              Tu portafolio te espera
            </p>
          </div>
          <button
            type="button"
            aria-label="Notificaciones"
            className="relative p-2 rounded-full hover:bg-surface-muted transition-colors"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {/* Notification badge */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-6 py-5 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav — visible on mobile */}
      <BottomNav />
    </div>
  );
}
