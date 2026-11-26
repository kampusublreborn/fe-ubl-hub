"use client";
import Link from "next/link";
import { Avatar } from "@/shared/components/avatar";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { useEffect, useState } from "react";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
export type Penghargaan = { id: number; jenis: string; periode: string; minimum: number; aturan: number; pemenang: { id: number; nama: string; prodi: string | null; skor: number; dibatalkanAt?: string | null; alasan?: string | null }[] };
export function AlumniOfTheMonthCard() {
  const [data, setData] = useState<Penghargaan[] | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [jenis, setJenis] = useState("BULANAN");
  useEffect(() => {
    let active = true;
    panggilApi<{ data: Penghargaan[] }>("penghargaan", "GET", "").then(r => { if (active) { setData(r.data); setError(""); } }).catch(e => { if (active) setError(pesanGalat(e)); });
    return () => { active = false; };
  }, [retry]);
  const row = data?.find(r => r.jenis === jenis);
  const periode = row && (jenis === "BULANAN"
    ? new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(`${row.periode}-01T00:00:00+07:00`))
    : row.periode);

  return (
    <section aria-label="Alumni Spotlight" className="overflow-hidden rounded-2xl border border-hub-line bg-white">
      <div className="flex items-center gap-3 bg-hub-navy px-5 py-4 text-white">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-hub-sand/40 bg-hub-sand/10 text-hub-sand">
          <Icon name="award" className="size-6" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Alumni Spotlight</h2>
          <p className="mt-0.5 text-xs text-white/80">Apresiasi untuk kontribusi alumni</p>
        </div>
      </div>
      <div className="px-5 pb-3 pt-4">
        <div role="group" aria-label="Periode penghargaan" className="grid grid-cols-2 gap-2 rounded-xl bg-hub-canvas p-1">
          {[{jenis:"BULANAN",label:"Bulanan"},{jenis:"TAHUNAN",label:"Tahunan"}].map(item => (
            <button key={item.jenis} type="button" aria-pressed={jenis === item.jenis} onClick={() => setJenis(item.jenis)}
              className={`min-h-11 rounded-lg px-3 text-sm font-medium transition-colors ${focusRing} ${jenis === item.jenis ? "bg-hub-navy text-white" : "text-hub-muted hover:bg-hub-line/50"}`}>
              {item.label}
            </button>
          ))}
        </div>
        {error ? <div role="alert" className="py-4 text-sm"><p>{error}</p><button className={`min-h-11 underline ${focusRing}`} onClick={() => setRetry(v => v + 1)}>Coba lagi</button></div>
          : !data ? <div role="status" className="flex min-h-48 items-center justify-center text-sm text-hub-muted">Memuat penghargaan...</div>
          : <div className="pt-4">
            <div className="text-center">
              <h3 className="text-sm font-semibold">Alumni of the {jenis === "BULANAN" ? "Month" : "Year"}</h3>
              {periode && <p className="mt-1 text-xs text-hub-muted">{periode}</p>}
            </div>
            {row?.pemenang.length ? <ul className="mt-4 space-y-3">{row.pemenang.map(w => (
              <li key={w.id} className="flex items-start gap-3 rounded-xl bg-hub-sand/10 p-3">
                <Avatar nama={w.nama} className="size-11 text-sm ring-2 ring-hub-sand/40" />
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <p className="text-sm font-semibold">{w.nama}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-hub-muted">{w.prodi}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-xs font-semibold tabular-nums text-hub-ink">
                    <Icon name="star" className="size-3.5 fill-hub-sand text-hub-sand" />{w.skor.toLocaleString("id-ID")} poin
                  </span>
                </div>
              </li>
            ))}</ul> : <div className="py-5 text-center">
              <div aria-hidden="true" className="relative mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-hub-sand/10 ring-1 ring-hub-sand/25">
                <Icon name="award" className="size-9 text-hub-sand" />
                <Icon name="sparkle" className="absolute -right-1 top-0 size-4 text-hub-sand" />
              </div>
              <p className="text-sm font-medium text-hub-ink">{row ? "Belum ada penerima periode ini" : "Menunggu penetapan penghargaan"}</p>
              <p className="mx-auto mt-1 max-w-56 text-sm leading-relaxed text-hub-muted">Bagikan pengalamanmu lewat logbook.</p>
            </div>}
          </div>}
        <Link href="/profil#kontribusi-saya" className={`mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-hub-line text-sm font-medium text-hub-navy transition-colors hover:bg-hub-canvas ${focusRing}`}>
          Lihat kontribusi saya<Icon name="arrow" className="size-4" />
        </Link>
        <details className="group mt-1 text-xs leading-relaxed text-hub-muted">
          <summary className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg [&::-webkit-details-marker]:hidden ${focusRing}`}>
            Cara penghargaan ditentukan<Icon name="chevron" className="size-3.5 group-open:rotate-180" />
          </summary>
          <p className="pb-2">Satu hari aktif menulis logbook = satu poin, berdasarkan WIB. {row ? `Minimum periode ini ${row.minimum} poin. ` : ""}Pemenang ditentukan dari poin tertinggi setelah periode berakhir. Skor seri mendapat penghargaan bersama.</p>
        </details>
      </div>
    </section>
  );
}
