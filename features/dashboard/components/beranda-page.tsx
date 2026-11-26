import { AlumniOfTheMonthCard } from "@/features/alumni-of-the-month";
import { GrupSaya } from "@/features/komunitas";
import { InformasiCard } from "@/features/informasi";
import { LogbookUmpan } from "@/features/logbook";
import { Shell } from "@/shared/components/layout/shell";
import { Suspense } from "react";
import { Composer, ComposerSkeleton } from "./composer";

/** Beranda: umpan logbook semua alumni, dengan panel samping informasi. */
export function BerandaPage() {
  return (
    <Shell
      active="/"
      rail={
        <>
          <AlumniOfTheMonthCard />
          <InformasiCard />
          <GrupSaya />
        </>
      }
    >
      {/* Membaca cookie sesi, jadi harus di dalam Suspense (Cache Components). */}
      <Suspense fallback={<ComposerSkeleton />}>
        <Composer />
      </Suspense>
      <LogbookUmpan />
    </Shell>
  );
}
