"use client";
import { InformasiGambar } from "./informasi-gambar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { type Informasi, kategoriLabel, tanggalInformasi } from "../types";
export function InformasiDetail({ id }: { id: string }) {
 const [item, setItem] = useState<Informasi | null>(null);
 const [error, setError] = useState("");
 useEffect(() => { let active = true; panggilApi<Informasi>("informasi", "GET", id).then(v => { if(active) setItem(v); }).catch(e => { if(active) setError(pesanGalat(e)); }); return () => { active = false; }; }, [id]);
 return <article className="rounded-2xl border border-hub-line bg-white p-6">
 <Link href="/informasi" className="inline-flex min-h-11 items-center text-sm underline">Kembali ke informasi</Link>
 {error ? <p role="alert">{error}</p> : !item ? <p role="status">Memuat informasi?</p> : <>
 <p className="mt-4 text-sm text-hub-muted">{kategoriLabel(item.kategori)} ? {tanggalInformasi(item.mulai_at)}</p>
 <h1 className="mt-2 break-words text-2xl font-semibold">{item.judul}</h1>
 <InformasiGambar item={item} />
     <div className="mt-6 whitespace-pre-wrap break-words leading-relaxed">{item.isi}</div>
 {item.selesai_at && <p className="mt-6 text-sm text-hub-muted">Tayang sampai {tanggalInformasi(item.selesai_at)}</p>}
 {item.tautan && /^https?:\/\//i.test(item.tautan) && <a href={item.tautan} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-hub-navy px-5 text-white">Buka tautan informasi ?</a>}
 </>}
 </article>;
}
