import { Suspense } from "react";
import { Shell } from "@/shared/components/layout/shell";
import { NotificationInbox } from "@/features/notifikasi";

export const metadata = { title: "Notifikasi | UBL Hub" };
export default function Page() {
  return <Shell active="/notifikasi" fab={false}><Suspense fallback={<p>Memuat notifikasi…</p>}><NotificationInbox /></Suspense></Shell>;
}
