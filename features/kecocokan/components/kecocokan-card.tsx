import { Card } from "@/shared/components/card";
import { getKecocokan } from "../lib/api";
import { KecocokanBody } from "./kecocokan-body";

export function KecocokanCardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="h-full min-h-64 rounded-2xl border border-hub-line bg-white p-5 sm:p-6 motion-safe:animate-pulse"
    >
      <span className="sr-only">Memuat kecocokan karier</span>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <div className="h-5 w-40 rounded bg-hub-line" />
        <div className="h-28 rounded-lg bg-hub-line/70" />
        <div className="h-24 rounded-lg bg-hub-line/70" />
      </div>
    </div>
  );
}

/** Kecocokan karier di beranda. Harus dipanggil di dalam <Suspense>. */
export async function KecocokanCard() {
  const data = await getKecocokan();
  return (
    <Card
      id="kecocokan"
      title="Kecocokan karier"
      action={{ href: "/career-path", label: "Rincian" }}
    >
      <p className="-mt-2 mb-4 text-sm text-hub-muted">
        Membandingkan hasil Professional Passport dengan jawaban tracer study Anda.
      </p>
      {data ? (
        <KecocokanBody data={data} />
      ) : (
        <p role="alert" className="text-sm text-hub-muted">
          Kecocokan karier belum dapat dimuat. Coba muat ulang.
        </p>
      )}
    </Card>
  );
}
