"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { Icon } from "@/shared/components/icons";

type Kontribusi = { jenis: string; periode: string; skor: number; target: number; minimum: number };

export function KontribusiSaya() {
  const [rows, setRows] = useState<Kontribusi[] | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const muat = () => {
      panggilApi<{ data: Kontribusi[] }>("penghargaan", "GET", "saya")
        .then(r => { if (active) { setRows(r.data); setError(""); } })
        .catch(e => { if (active) setError(pesanGalat(e)); });
    };
    muat();
    window.addEventListener("focus", muat);
    return () => { active = false; window.removeEventListener("focus", muat); };
  }, [retry]);

  return (
    <section id="kontribusi-saya" aria-labelledby="kontribusi-saya-title" className="scroll-mt-24 rounded-xl border border-hub-line bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <h2 id="kontribusi-saya-title" className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-7 items-center justify-center rounded-full bg-hub-sand/15"><Icon name="star" className="size-4 fill-hub-sand text-hub-sand" /></span>Kontribusi Saya
        </h2>
        {error ? <div role="alert" className="text-sm"><span>{error}</span> <button onClick={() => setRetry(v => v + 1)} className={`min-h-11 underline ${focusRing}`}>Coba lagi</button></div>
          : !rows ? <p role="status" className="text-sm text-hub-muted">Memuat poin...</p>
          : <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">{rows.map(row => (
            <div key={row.jenis} className="flex flex-wrap items-center gap-2">
              <dt className="text-hub-muted">{row.jenis === "BULANAN" ? "Bulan ini" : "Tahun ini"}</dt>
              <dd className="flex items-center gap-2">
                <span className="whitespace-nowrap rounded-full bg-hub-sand/15 px-2 py-0.5 font-semibold tabular-nums text-hub-ink">{row.skor.toLocaleString("id-ID")}/{row.target} hari</span>
                {row.skor >= row.target && <span className="text-xs font-medium text-hub-teal-dark">Tuntas!</span>}
              </dd>
            </div>
          ))}</dl>}
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4">
        <p className="text-xs leading-relaxed text-hub-muted">Target: aktif setiap hari. 1 hari logbook = 1 poin.</p>
        <details className="group basis-full sm:basis-auto sm:open:basis-full">
          <summary className={`flex min-h-11 cursor-pointer list-none items-center gap-1 text-xs font-medium text-hub-muted hover:text-hub-ink [&::-webkit-details-marker]:hidden ${focusRing}`}>
            Detail poin<Icon name="chevron" className="size-3 group-open:rotate-180" />
          </summary>
          <div className="space-y-2 border-t border-hub-line pb-1 pt-3 text-sm leading-relaxed text-hub-muted">
            {rows?.map(row => <p key={row.jenis}>
              <span className="font-medium text-hub-ink">{row.jenis === "BULANAN" ? "Bulanan" : "Tahunan"} ({row.periode}): </span>
              {row.skor >= row.minimum ? `Minimum ${row.minimum} poin terpenuhi.` : `${row.minimum - row.skor} hari aktif lagi menuju minimum ${row.minimum} poin.`}
            </p>)}
            <p>Target mengikuti jumlah hari dalam bulan atau tahun berjalan, termasuk tahun kabisat. Target harian ini berbeda dari minimum penghargaan.</p>
            <p>Hari dihitung dalam WIB. Logbook yang dihapus atau disembunyikan tidak dihitung. Minimum terpenuhi belum menjamin kemenangan; poin tertinggi ditetapkan sebagai pemenang setelah periode berakhir.</p>
            <Link href="/logbook/baru" className={`inline-flex min-h-11 items-center font-medium text-hub-navy underline underline-offset-4 ${focusRing}`}>Tulis Logbook</Link>
          </div>
        </details>
      </div>
    </section>
  );
}
