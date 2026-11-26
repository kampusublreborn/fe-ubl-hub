"use client";
import { InformasiGambar } from "./informasi-gambar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { type HalamanInformasi, kategoriLabel, tanggalInformasi } from "../types";

export function InformasiBody({ ringkas = false }: { ringkas?: boolean }) {
 const [filter, setFilter] = useState("");
 const [daftar, setDaftar] = useState<HalamanInformasi | null>(null);
 const [error, setError] = useState("");
 const [busy, setBusy] = useState(false);
 const [retry, setRetry] = useState(0);
 useEffect(() => {
   let active = true;
   panggilApi<HalamanInformasi>("informasi", "GET", `?limit=${ringkas ? 3 : 20}&${filter ? `kategori=${filter}` : ""}`)
     .then(v => { if (active) setDaftar(v); })
     .catch(e => { if (active) setError(pesanGalat(e)); });
   return () => { active = false; };
 }, [filter, ringkas, retry]);
 async function lanjut() {
   setBusy(true); setError("");
   try {
     const next = await panggilApi<HalamanInformasi>("informasi", "GET", `?cursor=${daftar?.cursorBerikutnya}&${filter ? `kategori=${filter}` : ""}`);
     setDaftar(v => ({ data: [...(v?.data ?? []), ...next.data], cursorBerikutnya: next.cursorBerikutnya }));
   } catch(e) { setError(pesanGalat(e)); } finally { setBusy(false); }
 }
 return <div>
   <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter informasi">
     {["", "PELUANG_KARIER", "INFORMASI"].map(v => <button key={v} disabled={busy} aria-pressed={filter === v} onClick={() => { setFilter(v); setDaftar(null); setError(""); setRetry(n => n + 1); }} className={`min-h-11 rounded-full border px-4 text-sm ${focusRing} ${filter === v ? "bg-hub-navy text-white" : "border-hub-line bg-white"}`}>{v ? kategoriLabel(v) : "Semua"}</button>)}
   </div>
   {error && <div role="alert" className="mb-3 text-sm text-red-700">{error} <button className={`min-h-11 underline ${focusRing}`} onClick={() => { setError(""); setRetry(n => n + 1); }}>Coba lagi</button></div>}
   {!daftar && !error && <p role="status">Memuat informasi?</p>}
   {daftar?.data.length === 0 && <p className="py-6 text-sm text-hub-muted">Belum ada informasi yang sedang tayang untuk kategori ini.</p>}
   <ul className="divide-y divide-hub-line">{daftar?.data.map(i => <li key={i.id} className="py-4 first:pt-0">
     <p className="text-xs text-hub-muted">{kategoriLabel(i.kategori)} ? {tanggalInformasi(i.mulai_at)}</p>
     <Link href={`/informasi/${i.id}`} className={`mt-2 block font-semibold hover:underline ${focusRing}`}>{i.judul}</Link>
     {!ringkas && <InformasiGambar item={i} />}
     <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm text-hub-muted">{i.isi}</p>
   </li>)}</ul>
   {!ringkas && daftar?.cursorBerikutnya && <button disabled={busy} onClick={lanjut} className={`min-h-11 rounded-xl border border-hub-line px-4 ${focusRing}`}>{busy ? "Memuat?" : "Muat lebih banyak"}</button>}
 </div>;
}
