import { Suspense } from "react";
import { Shell } from "@/shared/components/layout/shell";
import { getCareerPath } from "../lib/api";
import { CareerPathCardSkeleton } from "./career-path-card";
import { CareerPathStatus } from "./career-path-status";

export function CareerPathPage() {
  return (
    <Shell active="/career-path">
      <header className="hub-rise">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Career Path</h1>
        <p className="mt-1 max-w-prose text-sm text-hub-muted">
          Perkiraan jalur kariermu dalam 1 dan 3 tahun, disusun dari logbook yang kamu tulis.
        </p>
      </header>

      {/* Membaca cookie sesi, jadi harus di dalam Suspense (Cache Components). */}
      <Suspense fallback={<CareerPathCardSkeleton />}>
        <Isi />
      </Suspense>
    </Shell>
  );
}

async function Isi() {
  const status = await getCareerPath();
  if (!status) {
    return (
      <p role="alert" className="rounded-2xl border border-hub-line bg-white p-5 text-sm">
        Career Path belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.
      </p>
    );
  }
  return (
    <section aria-label="Career Path Anda" className="rounded-2xl border border-hub-line bg-white p-5 sm:p-6">
      <CareerPathStatus status={status} />
    </section>
  );
}
