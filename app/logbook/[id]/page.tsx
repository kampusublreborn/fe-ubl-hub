import { Suspense } from "react";
import { Shell } from "@/shared/components/layout/shell";
import { LogbookNotification } from "@/features/logbook";

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) return <p>Logbook tidak ditemukan.</p>;
  return <LogbookNotification id={id} />;
}
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Shell active="/" fab={false}><Suspense fallback={<p>Memuat logbook…</p>}><Detail params={params} /></Suspense></Shell>;
}
