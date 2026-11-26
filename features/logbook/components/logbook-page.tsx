import { Suspense } from "react";
import { getLogbookSaya, getUmpan } from "../lib/api";
import { LogbookFeed } from "./logbook-feed";

/** Umpan logbook semua alumni. Dipakai di Beranda. */
export function LogbookUmpan() {
  return (
    // Membaca cookie sesi, jadi harus di dalam Suspense (Cache Components).
    <Suspense fallback={<Skeleton />}>
      <Isi />
    </Suspense>
  );
}

function Skeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">Memuat logbook</span>
      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden="true" className="h-40 rounded-2xl bg-hub-line/70 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}

async function Isi() {
  const [umpan, saya] = await Promise.all([getUmpan(), getLogbookSaya()]);
  if (!umpan || !saya) {
    return (
      <p role="alert" className="rounded-2xl border border-hub-line bg-white p-5 text-sm">
        Logbook belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.
      </p>
    );
  }
  return <LogbookFeed umpan={umpan} saya={saya} />;
}
