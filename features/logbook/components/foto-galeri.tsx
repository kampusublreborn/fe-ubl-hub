"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { urlFoto } from "../lib/types";

/** Galeri bersama untuk lampiran logbook dan postingan komunitas. */
export function FotoGaleri({ ids, judul, src = urlFoto, detail }: {
  detail?: ReactNode;
  ids: number[];
  judul: string;
  src?: (id: number) => string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [aktif, setAktif] = useState<number | null>(null);
  const tunggal = ids.length === 1;
  const index = aktif === null ? 0 : Math.min(aktif, ids.length - 1);
  const kontrol = "flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

  useEffect(() => {
    if (aktif === null) return;
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = sebelumnya; };
  }, [aktif]);

  function pindah(arah: number) {
    setAktif((nilai) => ((nilai ?? 0) + arah + ids.length) % ids.length);
  }

  if (ids.length === 0) return null;

  return <>
    <ul aria-label={`Foto lampiran: ${judul}`} className={`mt-3 grid gap-2 ${tunggal ? "grid-cols-1" : "grid-cols-2"}`}>
      {ids.map((id, i) => (
        <li key={id} className="overflow-hidden rounded-xl border border-hub-line bg-hub-canvas">
          <button type="button" onClick={() => { setAktif(i); dialog.current?.showModal(); }}
            aria-label={`Buka foto ${i + 1} dari ${ids.length} ukuran penuh`} aria-haspopup="dialog"
            className={`block w-full cursor-zoom-in ${focusRing}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- foto dari API berotentikasi */}
            <img src={src(id)} alt={`Foto ${i + 1} dari ${ids.length}: ${judul}`} loading="lazy" decoding="async"
              className={tunggal ? "mx-auto max-h-[28rem] w-auto max-w-full" : "aspect-[4/3] w-full object-cover"} />
          </button>
        </li>
      ))}
    </ul>
    <dialog ref={dialog} aria-label={`Penampil foto: ${judul}`} onClose={() => setAktif(null)}
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onKeyDown={(event) => {
        if ((event.target as HTMLElement).closest("input, textarea, select, [contenteditable=true]")) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault(); pindah(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto border-0 bg-black p-0 text-white backdrop:bg-black open:flex open:flex-col lg:overflow-hidden lg:open:flex-row">
      <div className="relative flex min-h-[65dvh] flex-1 items-center justify-center bg-black lg:h-full lg:min-w-0">
        <button type="button" autoFocus aria-label="Tutup foto" onClick={() => dialog.current?.close()} className={`${kontrol} absolute left-4 top-4 z-10`}><Icon name="x" /></button>
        <span className="absolute left-20 top-7 text-sm font-semibold text-white/80">UBL Hub</span>
        <div className="flex h-[65dvh] w-full items-center justify-center px-2 py-20 lg:h-dvh lg:px-16" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ukuran asli dari API berotentikasi */}
          {aktif !== null && <img key={ids[index]} src={src(ids[index])} alt={`Foto ${index + 1}: ${judul}`} className="max-h-full max-w-full object-contain" />}
        </div>
        {!tunggal && <>
          <button type="button" aria-label="Foto sebelumnya" onClick={() => pindah(-1)} className={`${kontrol} absolute left-3 top-1/2 -translate-y-1/2`}><Icon name="chevron" className="size-6 rotate-90" /></button>
          <button type="button" aria-label="Foto berikutnya" onClick={() => pindah(1)} className={`${kontrol} absolute right-3 top-1/2 -translate-y-1/2`}><Icon name="chevron" className="size-6 -rotate-90" /></button>
        </>}
        <p role="status" aria-live="polite" className="absolute bottom-5 rounded-full bg-black/60 px-4 py-2 text-sm tabular-nums">{index + 1} / {ids.length}</p>
      </div>
      {aktif !== null && detail && <aside aria-label="Detail postingan" className="w-full shrink-0 bg-white p-5 text-hub-ink lg:h-full lg:w-[360px] lg:overflow-y-auto xl:w-[400px]">{detail}</aside>}
    </dialog>
  </>;
}
