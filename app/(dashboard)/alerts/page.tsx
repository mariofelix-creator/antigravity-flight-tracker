import React from "react";
import {
  Megaphone,
  AlertTriangle,
  TrendingUp,
  Info,
  CheckCheck,
  Bell,
  BellOff,
} from "lucide-react";
import type { NotificationType } from "@/lib/supabase/types";
import { PushPermissionBanner } from "@/components/notifications/PushPermissionBanner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MockNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  sentAt: string; // ISO string
  read: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "notif-1",
    type: "offer",
    title: "Nueva oportunidad: SPDR Gold Shares (GLD)",
    body: "Quedan menos de 12 horas para invertir en GLD con condiciones especiales. Desde $30 USD.",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-2",
    type: "alert",
    title: "Movimiento en VOO: +2.3% hoy",
    body: "Tu inversión en Vanguard S&P 500 ETF subió un 2.3% en la última jornada. No es necesario actuar.",
    sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-3",
    type: "update",
    title: "Resumen semanal disponible",
    body: "Tu cartera cerró la semana con un retorno del +1.8%. Revisa tu rendimiento detallado.",
    sentAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "notif-4",
    type: "offer",
    title: "Vanguard S&P 500 ETF — oferta activa",
    body: "Tienes 7 días para invertir en VOO. Retorno histórico promedio: +10.4% anual.",
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "notif-5",
    type: "system",
    title: "Perfil de riesgo actualizado",
    body: "Hemos actualizado tu perfil a Moderado según tus respuestas del onboarding. Puedes cambiarlo en cualquier momento.",
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Ahora mismo";
  if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  return `Hace ${days} día${days !== 1 ? "s" : ""}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotificationIcon({ type }: { type: NotificationType }) {
  const configs: Record<
    NotificationType,
    { icon: React.ReactNode; wrapperClass: string }
  > = {
    offer: {
      icon: <Megaphone className="h-4 w-4 text-brand-600" />,
      wrapperClass: "bg-brand-50 ring-1 ring-brand-200",
    },
    alert: {
      icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
      wrapperClass: "bg-amber-50 ring-1 ring-amber-200",
    },
    update: {
      icon: <TrendingUp className="h-4 w-4 text-accent-600" />,
      wrapperClass: "bg-accent-50 ring-1 ring-accent-200",
    },
    system: {
      icon: <Info className="h-4 w-4 text-slate-500" />,
      wrapperClass: "bg-slate-100 ring-1 ring-slate-200",
    },
  };

  const { icon, wrapperClass } = configs[type];
  return (
    <div
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${wrapperClass}`}
    >
      {icon}
    </div>
  );
}

function NotificationItem({
  notification,
}: {
  notification: MockNotification;
}) {
  return (
    <li
      className={`flex gap-3 rounded-lg px-4 py-3.5 transition-colors ${
        notification.read ? "bg-white" : "bg-brand-50/40"
      }`}
    >
      <NotificationIcon type={notification.type} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${
              notification.read
                ? "font-medium text-slate-700"
                : "font-semibold text-slate-900"
            }`}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span
              className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500"
              aria-label="No leída"
            />
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
          {notification.body}
        </p>
        <p className="mt-1.5 text-[10px] text-slate-400">
          {formatRelativeTime(notification.sentAt)}
        </p>
      </div>
    </li>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-12 text-center">
      <BellOff
        className="mb-3 h-10 w-10 text-slate-300"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-slate-600">Sin alertas nuevas</p>
      <p className="mt-1 text-xs text-slate-400">
        ¡Todo en orden! Te avisaremos cuando haya novedades.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  const hasNotifications = MOCK_NOTIFICATIONS.length > 0;

  return (
    <div className="flex max-w-xl flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">Mis Alertas</h1>
          {unreadCount > 0 && (
            <span
              className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white"
              aria-label={`${unreadCount} alertas sin leer`}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Marcar todas como leídas"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Push permission banner */}
      <PushPermissionBanner />

      {/* Notification list */}
      {hasNotifications ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {MOCK_NOTIFICATIONS.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Notifications CTA if push section is relevant */}
      <div className="flex items-start gap-3 rounded-lg border border-accent-200 bg-accent-50 px-4 py-3.5">
        <Bell
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-600"
          aria-hidden="true"
        />
        <div>
          <p className="text-xs font-semibold text-accent-800">
            Alertas en tiempo real
          </p>
          <p className="mt-0.5 text-xs text-accent-700">
            Activa las notificaciones push para recibir alertas de tu cartera
            directamente en tu dispositivo, incluso cuando no tengas la app abierta.
          </p>
        </div>
      </div>
    </div>
  );
}
