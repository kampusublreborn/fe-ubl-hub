import { KontribusiSaya } from "@/features/alumni-of-the-month";
import { Suspense } from "react";
import { CareerPathCard, CareerPathCardSkeleton, getCareerPath, hitungLangkah } from "@/features/career-path";
import { KartuCard, KartuCardSkeleton } from "@/features/kartu";
import { getKecocokan, KecocokanCard, KecocokanCardSkeleton } from "@/features/kecocokan";
import { getGrupSaya } from "@/features/komunitas";
import { LogbookCard, LogbookCardSkeleton } from "@/features/logbook";
import { getRingkasTracer, TracerCard, TracerCardSkeleton } from "@/features/tracer";
import { Shell } from "@/shared/components/layout/shell";
import { Header, HeaderSkeleton } from "./header";
import { StatStrip } from "./stat-strip";

// Animasi masuk berurutan lewat variabel --i (lihat .hub-rise di globals.css).
function Slot({
  i,
  className = "",
  children,
}: {
  i: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`hub-rise ${className}`} style={{ "--i": i } as React.CSSProperties}>
      {children}
    </div>
  );
}

async function StatStripLive() {
  const [r, karier, kecocokan, grup] = await Promise.all([getRingkasTracer(), getCareerPath(), getKecocokan(), getGrupSaya()]);
  const nilai = r?.keadaan === "BERJALAN" || r?.keadaan === "INTI_TERKIRIM" || r?.keadaan === "SELESAI" ? `${r.selesai}/${r.total}` : "-";
  const l = hitungLangkah(karier?.careerPath ?? null);
  return <StatStrip tracer={nilai} langkah={l.total ? `${l.selesai}/${l.total}` : "-"} skor={kecocokan?.skor ?? null} grup={grup ? `${grup.data.length}${grup.cursorBerikutnya ? "+" : ""}` : "-"} />;
}

/** Profil: kemajuan tracer, career path, kartu alumni, dan logbook milik sendiri. */
export function ProfilPage() {
  return (
    <Shell active="/profil">
      {/* Membaca cookie sesi, jadi harus di dalam Suspense (Cache Components). */}
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>

      <Suspense fallback={<StatStrip tracer="-" />}>
        <StatStripLive />
      </Suspense>

      <KontribusiSaya />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <Slot i={5} className="lg:col-span-2">
          <Suspense fallback={<TracerCardSkeleton />}>
            <TracerCard />
          </Suspense>
        </Slot>
        <Slot i={6}>
          <Suspense fallback={<KartuCardSkeleton />}>
            <KartuCard />
          </Suspense>
        </Slot>

        <Slot i={7} className="lg:col-span-2">
          <Suspense fallback={<KecocokanCardSkeleton />}>
            <KecocokanCard />
          </Suspense>
        </Slot>
        <Slot i={8}>
          <Suspense fallback={<LogbookCardSkeleton />}>
            <LogbookCard />
          </Suspense>
        </Slot>

        <Slot i={9} className="lg:col-span-3">
          <Suspense fallback={<CareerPathCardSkeleton />}>
            <CareerPathCard />
          </Suspense>
        </Slot>
      </div>
    </Shell>
  );
}
