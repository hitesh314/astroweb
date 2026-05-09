/* AstroMarriage — Web Push (standard). Keep path stable; admins register from /admin. */
self.addEventListener("push", (event) => {
  let payload = { title: "Notification", body: "", url: "/admin/chat" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    try {
      const t = event.data?.text();
      if (t) payload.body = t;
    } catch {
      /* ignore */
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Notification", {
      body: payload.body ?? "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: payload.url ?? "/admin/chat" },
      tag: "consult-chat-alert",
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = typeof event.notification.data?.url === "string" ? event.notification.data.url : "/admin/chat";
  const absolute = /^https?:/i.test(url) ? url : new URL(url, self.location.origin).href;

  event.waitUntil(
    self.clients.openWindow ? self.clients.openWindow(absolute).then(() => undefined) : Promise.resolve(),
  );
});
