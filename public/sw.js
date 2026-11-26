/* global self, clients */
self.addEventListener("push", (event) => {
  let data;
  try { data = event.data?.json(); } catch { data = null; }
  event.waitUntil(self.registration.showNotification(data?.judul || "UBL Hub", {
    body: data?.pesan || "Ada pemberitahuan baru. Buka UBL Hub.",
    icon: "/ubl-logo.png",
    tag: data?.id ? `ubl-hub-${data.id}` : "ubl-hub",
    data: { id: Number.isSafeInteger(data?.id) && data.id > 0 ? data.id : null },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const id = event.notification.data?.id;
  const url = new URL(`/notifikasi${id ? `?buka=${id}` : ""}`, self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((w) => new URL(w.url).origin === self.location.origin);
    if (existing) {
      await existing.navigate(url);
      return existing.focus();
    }
    return clients.openWindow(url);
  })());
});
