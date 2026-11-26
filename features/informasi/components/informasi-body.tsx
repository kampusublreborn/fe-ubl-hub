"use client";
import { InformasiGambar } from "./informasi-gambar";
import Link from "next/link";
import { Icon } from "@/shared/components/icons";
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
     {["", "PELUANG_KARIER", "INFORMASI"].map(v => <button key={v} disabled={busy} aria-pressed={filter === v} onClick={() => { setFilter(v); setDaftar(null); setError(""); setRetry(n => n + 1); }} className={`min-h-11 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors hover:shadow-sm motion-reduce:transition-none ${focusRing} ${filter === v ? "bg-hub-navy text-white" : "border-hub-line bg-white"}`}>{v ? kategoriLabel(v) : "Semua"}</button>)}
   </div>
   {error && <div role="alert" className="mb-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error} <button className={`min-h-11 underline ${focusRing}`} onClick={() => { setError(""); setRetry(n => n + 1); }}>Coba lagi</button></div>}
   {!daftar && !error && <p role="status" className="rounded-2xl border border-hub-line bg-white p-8 text-sm text-hub-muted">Memuat informasi...</p>}
   {daftar?.data.length === 0 && <p className="rounded-2xl border border-dashed border-hub-line bg-white p-8 text-center text-sm text-hub-muted">Belum ada informasi yang sedang tayang untuk kategori ini. Pilih kategori lain atau cek kembali nanti.</p>}
   <ul className={ringkas ? "divide-y divide-hub-line" : "space-y-4"}>{daftar?.data.map(i => <li key={i.id} className={ringkas ? "py-4 first:pt-0" : "rounded-2xl border border-hub-line bg-white p-5 transition-shadow hover:shadow-sm motion-reduce:transition-none sm:p-6"}>
     <article className={ringkas ? "" : "flex flex-col gap-5 sm:flex-row sm:items-start"}>
       {!ringkas && i.gambar && <InformasiGambar item={i} thumbnail />}
       <div className="min-w-0 flex-1">
         <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-hub-muted">
           <span className="inline-flex items-center gap-1.5 rounded-full bg-hub-canvas px-2.5 py-1 font-medium text-hub-navy"><Icon name={i.kategori === "PELUANG_KARIER" ? "idcard" : "megaphone"} className="size-4" />{kategoriLabel(i.kategori)}</span>
           <time dateTime={i.mulai_at}>{tanggalInformasi(i.mulai_at)}</time>
         </div>
         <h2 className="mt-3 break-words text-lg font-semibold leading-snug"><Link href={`/informasi/${i.id}`} className={`rounded hover:underline ${focusRing}`}>{i.judul}</Link></h2>
         <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-hub-muted">{i.isi}</p>
         {!ringkas && <Link href={`/informasi/${i.id}`} aria-label={`Baca selengkapnya: ${i.judul}`} className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-hub-navy hover:text-hub-teal-dark ${focusRing}`}>Baca selengkapnya <Icon name="arrow" className="size-4" /></Link>}
       </div>
     </article>
   </li>)}</ul>
   {!ringkas && daftar?.cursorBerikutnya && <button disabled={busy} onClick={lanjut} className={`mt-5 min-h-11 rounded-xl border border-hub-line bg-white px-4 hover:bg-hub-canvas ${focusRing}`}>{busy ? "Memuat..." : "Muat lebih banyak"}</button>}
 </div>;
}
