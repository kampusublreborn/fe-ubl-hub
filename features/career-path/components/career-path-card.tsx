import { Card } from "@/shared/components/card";
import { getCareerPath } from "../lib/api";
import { CareerPathStatus } from "./career-path-status";

export function CareerPathCardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="h-full min-h-64 rounded-2xl border border-hub-line bg-white p-5 sm:p-6 motion-safe:animate-pulse"
    >
      <span className="sr-only">Memuat Career Path</span>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <div className="h-5 w-32 rounded bg-hub-line" />
        <div className="h-16 rounded-lg bg-hub-line/70" />
        <div className="h-24 rounded-lg bg-hub-line/70" />
      </div>
    </div>
  );
}

/** Career Path di beranda. Harus dipanggil di dalam <Suspense>. */
export async function CareerPathCard() {
  const status = await getCareerPath();
  return (
    <Card id="career" title="Career Path" action={{ href: "/career-path", label: "Lihat semua" }}>
      {status ? (
        <CareerPathStatus status={status} ringkas />
      ) : (
        <p role="alert" className="text-sm text-hub-muted">
          Career Path belum dapat dimuat. Coba muat ulang.
        </p>
      )}
    </Card>
  );
}
