import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/shared/components/icons";
import { Shell } from "@/shared/components/layout/shell";
import { focusRing } from "@/shared/lib/ui";
import { getGrupJelajah, getGrupSaya, getSaran, getUndangan } from "../lib/api";
import { KomunitasJelajah } from "./komunitas-jelajah";

function Skeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">Memuat komunitas</span>
      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden="true" className="h-28 rounded-2xl bg-hub-line/70 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}

async function Isi() {
  const [jelajah, saya, saran, undangan] = await Promise.all([getGrupJelajah(), getGrupSaya(), getSaran(), getUndangan()]);
  if (!jelajah || !saya || !saran || !undangan) {
    return (
      <p role="alert" className="rounded-2xl border border-hub-line bg-white p-5 text-sm">
        Komunitas belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.
      </p>
    );
  }
  return <KomunitasJelajah jelajah={jelajah} saya={saya} saran={saran} undangan={undangan} />;
}

export function KomunitasPage() {
  return (
    <Shell active="/komunitas" fab={false}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Komunitas</h1>
          <p className="text-sm text-hub-muted">Grup sesama alumni UBL berdasarkan profesi dan minat.</p>
        </div>
        <Link
          href="/komunitas/baru"
          className={`inline-flex min-h-12 items-center gap-2 rounded-full bg-hub-navy px-6 text-sm font-semibold text-white transition active:scale-[0.98] motion-reduce:transform-none ${focusRing}`}
        >
          <Icon name="plus" className="size-4" />
          Buat grup
        </Link>
      </header>
      {/* Membaca cookie sesi, jadi harus di dalam Suspense (Cache Components). */}
      <Suspense fallback={<Skeleton />}>
        <Isi />
      </Suspense>
    </Shell>
  );
}
