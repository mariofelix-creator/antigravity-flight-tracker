"use client";

import * as React from "react";
import { Bell, X, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Banner that prompts the user to enable push notifications.
 * - Only renders if the Push API is supported and permission is 'default'.
 * - On "Activar", calls Notification.requestPermission(). If granted, POSTs
 *   to /api/notifications/subscribe with the PushSubscription payload.
 * - Dismissible via the X button.
 */
export function PushPermissionBanner() {
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "granted" | "denied" | "unsupported">("idle");

  // Determine initial visibility after mount (Notification API is browser-only)
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "default") {
      setVisible(true);
    }
  }, []);

  // Don't render anything until we know the browser state
  if (!visible) return null;
  if (status === "unsupported" || status === "granted" || status === "denied") return null;

  async function handleActivate() {
    setLoading(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setStatus("granted");
        setVisible(false);
        await subscribeUserToServer();
      } else {
        setStatus("denied");
        setVisible(false);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[push] requestPermission error:", err);
      }
      setVisible(false);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setVisible(false);
  }

  return (
    <div
      role="complementary"
      aria-label="Activa las notificaciones push"
      className={cn(
        "flex items-start gap-3 rounded-lg",
        "border border-accent-200 bg-accent-50",
        "px-4 py-3.5"
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <Bell className="h-4 w-4 text-accent-600" aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-accent-900">
          Activa las notificaciones
        </p>
        <p className="mt-0.5 text-xs text-accent-700">
          Recibe alertas de tu cartera directamente en tu dispositivo, incluso
          cuando no tengas MicroGuard abierto.
        </p>
      </div>

      {/* Activate button */}
      <button
        type="button"
        onClick={handleActivate}
        disabled={loading}
        aria-busy={loading}
        className={cn(
          "flex-shrink-0 rounded-md px-3 py-1.5",
          "bg-accent-600 text-xs font-semibold text-white",
          "transition-colors duration-150 hover:bg-accent-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {loading ? "..." : "Activar"}
      </button>

      {/* Dismiss */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Cerrar"
        className={cn(
          "flex-shrink-0 rounded p-0.5 mt-0.5",
          "text-accent-500 hover:bg-accent-100 hover:text-accent-700",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
        )}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Push subscription helper ─────────────────────────────────────────────────

async function subscribeUserToServer(): Promise<void> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
    }
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const subscriptionJson = subscription.toJSON();

    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscriptionJson.endpoint,
        keys: {
          p256dh: subscriptionJson.keys?.["p256dh"] ?? "",
          auth: subscriptionJson.keys?.["auth"] ?? "",
        },
      }),
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[push] Failed to subscribe to push server:", err);
    }
  }
}

/**
 * Converts a base64url string to a Uint8Array for the VAPID applicationServerKey.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
