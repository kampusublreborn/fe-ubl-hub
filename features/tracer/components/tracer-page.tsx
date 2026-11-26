import { connection } from "next/server";
import { Suspense } from "react";
import { currentUser } from "@/features/auth";
import { Shell } from "@/shared/components/layout/shell";
import { getResponsTracer, getStatusTracer } from "../lib/api";
import { MulaiTracer } from "./mulai-tracer";
import { TracerSkeleton } from "./tracer-skeleton";
import { TracerWizard } from "./tracer-wizard";

export function TracerPage() {
  return (
    <Shell active="/tracer">
      <header className="hub-rise">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tracer Study</h1>
      </header>

      {/* Membaca cookie sesi, jadi harus di dalam Suspense (Cache Components). */}
      <Suspense fallback={<TracerSkeleton />}>
        <Isi />
      </Suspense>
    </Shell>
  );
}

function Pesan({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="w-full rounded-2xl border border-hub-line bg-white p-5 text-sm">
      {children}
    </p>
  );
}

async function Isi() {
  // Seluruh isi halaman bergantung pada sesi dan data API, jadi hanya dijalankan saat ada permintaan.
  // Tanpa ini pemeriksaan dev "blocking route" ikut merender bagian klien dan mengeluh soal Date.now().
  await connection();
  await currentUser();
  const status = await getStatusTracer();

  if (!status) {
    return <Pesan>Tracer study belum dapat dimuat. Coba muat ulang.</Pesan>;
  }
  if (!status.periode) {
    return <Pesan>Belum ada periode tracer study yang dibuka.</Pesan>;
  }
  if (!status.respons) {
    return <MulaiTracer namaPeriode={status.periode.nama} />;
  }

  const respons = await getResponsTracer();
  if (!respons) {
    return <Pesan>Jawaban belum dapat dimuat. Coba muat ulang.</Pesan>;
  }
  return <TracerWizard
      awal={respons}
      catatanRevisi={status.respons.verifikasi?.catatan ?? null}
      dikirimAwal={status.respons.dikirim_at}
    />;
}
