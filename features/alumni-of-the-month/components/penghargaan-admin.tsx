"use client";
import { PoinKontribusi } from "./poin-kontribusi";
import { useEffect, useState } from "react";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import type { Penghargaan } from "./alumni-of-the-month-card";
export function PenghargaanAdmin() {
  const [rows, setRows] = useState<Penghargaan[] | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; panggilApi<{data: Penghargaan[]}>("penghargaan-admin", "GET", "").then(r => { if(active) setRows(r.data); }).catch(e => { if(active) setError(pesanGalat(e)); }); return () => { active = false; }; }, [reload]);
  async function batalkan(event: React.FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault(); setBusy(true); setError("");
    try { await panggilApi("penghargaan-admin", "POST", `${id}/batalkan`, { alasan: String(new FormData(event.currentTarget).get("alasan") ?? "") }); setReload(v => v + 1); }
    catch(e) { setError(pesanGalat(e)); } finally { setBusy(false); }
  }
  return <section className="space-y-5"><h1 className="text-2xl font-semibold">Penghargaan Alumni</h1>
    <p>Penetapan otomatis berdasarkan jumlah hari aktif logbook (WIB). Minimum 4 hari per bulan dan 24 hari per tahun. Pembatalan tidak memilih pengganti otomatis.</p>
    {error && <div role="alert">{error} <button className="min-h-11 underline" onClick={() => {setError(""); setReload(v => v + 1);}}>Coba lagi</button></div>}
    {!rows ? <p role="status">Memuat...</p> : !rows.length ? <p>Belum ada hasil penetapan.</p> : rows.map(r => <article key={r.id} className="space-y-3 rounded-2xl border border-hub-line bg-white p-5"><h2 className="font-semibold">{r.jenis === "BULANAN" ? "Alumni of the Month" : "Alumni of the Year"} / {r.periode}</h2><p className="text-sm">Aturan v{r.aturan} / Minimum {r.minimum} hari</p>
      {!r.pemenang.length && <p>Tidak ada alumni yang memenuhi minimum.</p>}
      {r.pemenang.map(w => <div key={w.id} className="border-t border-hub-line pt-3"><p className="font-semibold">{w.nama}</p><p className="text-sm text-hub-muted">{w.prodi}</p><PoinKontribusi skor={w.skor} />{w.dibatalkanAt ? <p>Dibatalkan: {w.alasan}</p> : <form onSubmit={e => void batalkan(e, w.id)} className="mt-3 flex flex-wrap gap-3"><label className="flex-1">Alasan pembatalan<textarea name="alasan" required minLength={10} maxLength={1000} className="mt-1 block w-full rounded-lg border border-hub-line p-2" /></label><button disabled={busy} className="min-h-11 self-end rounded-lg bg-hub-navy px-4 py-2 text-white disabled:opacity-50">Batalkan penghargaan</button></form>}</div>)}
    </article>)}
  </section>;
}
