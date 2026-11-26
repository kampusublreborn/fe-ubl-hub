import { connection } from "next/server";
import { Suspense } from "react";
import { currentUser } from "@/features/auth";
import { Icon } from "@/shared/components/icons";
import { Shell } from "@/shared/components/layout/shell";
import { getResponsTracer, getStatusTracer } from "../lib/api";
import { MulaiTracer } from "./mulai-tracer";
import { TracerSkeleton } from "./tracer-skeleton";
import { TracerWizard } from "./tracer-wizard";

export function TracerPage() {
  return (
    <Shell active="/tracer">
      <header className="hub-rise flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-hub-teal-dark">Rumah Alumni</p>
        <h1 className="text-2xl font-semibold tracking-tight text-hub-navy sm:text-3xl">Tracer Study</h1>
        <p className="max-w-prose text-sm text-hub-muted">
          Ceritakan perjalanan Anda setelah lulus. Jawaban tersimpan otomatis, jadi boleh berhenti dan lanjut kapan saja.
        </p>
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
    <p
      role="status"
      className="flex w-full items-center gap-3 rounded-2xl border border-hub-line bg-white p-5 text-sm text-hub-muted"
    >
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-hub-canvas text-hub-navy">
        <Icon name="clipboard" className="size-5" />
      </span>
      <span>{children}</span>
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
