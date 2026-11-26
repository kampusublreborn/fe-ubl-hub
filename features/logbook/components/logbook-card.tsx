import Link from "next/link";
import { Card } from "@/shared/components/card";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { getLogbookSaya } from "../lib/api";
import { labelKategori, tanggal } from "../lib/types";

export function LogbookCardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="h-full min-h-64 rounded-2xl border border-hub-line bg-white p-5 sm:p-6 motion-safe:animate-pulse"
    >
      <span className="sr-only">Memuat logbook</span>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <div className="h-5 w-32 rounded bg-hub-line" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-hub-line/70" />
        ))}
      </div>
    </div>
  );
}

/** Tiga logbook terbaru milik alumni. Harus dipanggil di dalam <Suspense>. */
export async function LogbookCard() {
  const saya = await getLogbookSaya(3);
  const daftar = saya?.data ?? [];

  return (
    <Card id="logbook" title="Logbook terbaru" action={{ href: "/", label: "Semua" }}>
      {!saya ? (
        <p role="alert" className="text-sm text-hub-muted">
          Logbook belum dapat dimuat. Coba muat ulang.
        </p>
      ) : daftar.length === 0 ? (
        <p className="text-sm text-hub-muted">
          Belum ada logbook. Tulis yang pertama untuk membuat Career Path.
        </p>
      ) : (
        <ol className="relative flex flex-col gap-4">
          <span aria-hidden="true" className="absolute bottom-3 left-4 top-3 w-px bg-hub-line" />
          {daftar.map((l) => (
            <li key={l.id} className="relative flex gap-3">
              <span
                aria-hidden="true"
                className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-hub-line bg-white text-hub-navy"
              >
                <Icon name="book" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{l.judul}</p>
                <p className="text-xs text-hub-muted">
                  {labelKategori(l.kategori)} · {tanggal(l.waktu)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
      <Link
        href="/logbook/baru"
        className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-hub-line text-sm font-medium transition-colors hover:bg-hub-canvas active:bg-hub-line/60 ${focusRing}`}
      >
        <Icon name="plus" className="size-4" />
        Logbook baru
      </Link>
    </Card>
  );
}
