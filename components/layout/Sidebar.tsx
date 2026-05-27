"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Home,
  PieChart,
  TrendingUp,
  Bell,
  Megaphone,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/portfolio", label: "Mi Cartera", icon: PieChart },
  { href: "/dashboard/invest", label: "Invertir", icon: TrendingUp },
  { href: "/dashboard/alerts", label: "Alertas", icon: Bell },
  { href: "/dashboard/campaigns", label: "Ofertas", icon: Megaphone },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-border fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
        <div className="p-1.5 rounded-lg bg-brand-500">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-brand-700 tracking-tight">
          MicroGuard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 border-l-2",
                active
                  ? "bg-brand-50 text-brand-700 font-semibold border-brand-500"
                  : "text-muted-foreground font-medium border-transparent hover:bg-surface-subtle hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-brand-600" : "text-muted-foreground"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-danger-500/10 hover:text-danger-600 transition-all duration-150"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
