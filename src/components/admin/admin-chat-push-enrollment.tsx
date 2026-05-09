"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

function decodeVapidPublicKey(base64Url: string): Uint8Array<ArrayBuffer> {
  const padded = `${base64Url}${"=".repeat((4 - (base64Url.length % 4)) % 4)}`;
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function useHasWindow(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function AdminChatPushEnrollment() {
  const hasWindow = useHasWindow();
  const vapidPk = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY?.trim();
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const subscribe = useCallback(async () => {
    if (!vapidPk || !hasWindow) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setHint("Push notifications are not supported in this browser.");
      return;
    }

    setBusy(true);
    setHint(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setHint("Notifications blocked — enable them in browser settings.");
        return;
      }

      await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
      const reg = await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidPublicKey(vapidPk),
        }));

      const res = await fetch("/api/push/admin-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setHint(data.error ?? `Save failed (${res.status}).`);
        return;
      }
      setHint("You will get push alerts when a new visitor opens dashboard chat.");
    } catch {
      setHint("Could not enable push.");
    } finally {
      setBusy(false);
    }
  }, [hasWindow, vapidPk]);

  if (!vapidPk) {
    return null;
  }

  if (!hasWindow) {
    return null;
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  return (
    <div className="flex max-w-xl flex-wrap items-start gap-x-4 gap-y-2 rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-xs leading-snug text-neutral-400">
      <button
        type="button"
        disabled={busy}
        onClick={() => void subscribe()}
        className="shrink-0 rounded-lg border border-amber-500/50 bg-amber-950/40 px-3 py-1.5 font-medium text-amber-100 hover:border-amber-400/65 hover:bg-amber-900/35 disabled:opacity-55"
      >
        {busy ? "Working…" : "Phone alerts (new chats)"}
      </button>
      <div className="min-w-[12rem] flex-1 pt-1">
        {hint ? (
          <p className="text-neutral-200">{hint}</p>
        ) : (
          <p>Open once on your phone (use Chrome or add this site to the Home Screen on iOS 16.4+), tap here, accept notifications.</p>
        )}
      </div>
    </div>
  );
}
