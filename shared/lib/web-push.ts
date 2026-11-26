import { panggilApi } from "@/shared/lib/api-client";

export const dukungPush = () => typeof window !== "undefined" && window.isSecureContext &&
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export async function siapkanPush() {
  await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  return navigator.serviceWorker.ready;
}

export async function aktifkanPush(publicKey: string) {
  // Permission diminta langsung dari klik pengguna (wajib di iOS).
  const izin = await Notification.requestPermission();
  if (izin !== "granted") throw new Error("Izin notifikasi belum diberikan. Anda bisa mengubahnya di pengaturan browser.");
  const registration = await siapkanPush();
  const raw = atob(publicKey.replace(/-/g, "+").replace(/_/g, "/"));
  const key = Uint8Array.from(raw, (c) => c.charCodeAt(0));
  let sub = await registration.pushManager.getSubscription();
  if (sub?.options.applicationServerKey &&
      btoa(String.fromCharCode(...new Uint8Array(sub.options.applicationServerKey))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_") !== publicKey) {
    await sub.unsubscribe();
    sub = null;
  }
  sub ??= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  try {
    await panggilApi("notifikasi", "POST", "push/subscription", sub.toJSON());
  } catch (e) {
    // Endpoint akun lama tidak boleh diambil alih; buat subscription browser baru.
    if (!(e instanceof Error && "status" in e && e.status === 409)) throw e;
    await sub.unsubscribe();
    sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    await panggilApi("notifikasi", "POST", "push/subscription", sub.toJSON());
  }
}

export async function matikanPush() {
  if (!dukungPush()) return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const sub = await registration?.pushManager.getSubscription();
  if (sub) {
    // Hentikan di browser terlebih dulu agar logout tetap aman ketika backend tidak tersedia.
    const endpoint = sub.endpoint;
    if (!await sub.unsubscribe()) throw new Error("Notifikasi perangkat belum berhasil dinonaktifkan. Coba lagi.");
    // Browser sudah berhenti berlangganan; server akan membersihkan endpoint mati lewat 410.
    await panggilApi("notifikasi", "POST", "push/unsubscribe", { endpoint }).catch(() => null);
  }
  const notifications = await registration?.getNotifications();
  notifications?.forEach((n) => n.close());
}
