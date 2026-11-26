"use client";
import { Icon } from "@/shared/components/icons";
import { InformasiGambarField } from "./informasi-gambar";
import { useEffect, useState, type FormEvent } from "react";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { type Informasi, type HalamanInformasi, kategoriLabel, tanggalInformasi } from "../types";
const input = `mt-2 block min-h-11 w-full rounded-xl border border-hub-line bg-white px-3 py-2.5 text-base font-normal ${focusRing}`;
const button = `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-hub-line px-4 text-sm font-semibold transition-colors hover:border-hub-navy disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${focusRing}`;
const localDate = (v: string) => { const d = new Date(v); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16); };
export function InformasiAdmin() {
 const [daftar, setDaftar] = useState<HalamanInformasi | null>(null);
 const [edit, setEdit] = useState<Informasi | "baru" | null>(null);
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState("");
 const [notice, setNotice] = useState("");
 const [reload, setReload] = useState(0);
 useEffect(() => { let active = true; panggilApi<HalamanInformasi>("informasi-admin", "GET", "").then(v => { if(active) setDaftar(v); }).catch(e => { if(active) setError(pesanGalat(e)); }); return () => { active = false; }; }, [reload]);
 async function more() {
  setBusy(true); setError("");
  try { const next = await panggilApi<HalamanInformasi>("informasi-admin", "GET", `?cursor=${daftar?.cursorBerikutnya}`); setDaftar(v => ({data: [...(v?.data ?? []), ...next.data], cursorBerikutnya: next.cursorBerikutnya})); }
  catch(e) { setError(pesanGalat(e)); } finally { setBusy(false); }
 }
 async function save(e: FormEvent<HTMLFormElement>) {
  e.preventDefault(); setBusy(true); setError(""); setNotice("");
  const f = new FormData(e.currentTarget);
  try {
   const payload = { judul: f.get("judul"), isi: f.get("isi"), kategori: f.get("kategori"), tautan: String(f.get("tautan") || "").trim() || null, status: f.get("status"), mulai_at: new Date(String(f.get("mulai_at"))).toISOString(), selesai_at: f.get("selesai_at") ? new Date(String(f.get("selesai_at"))).toISOString() : null };
   const saved = await panggilApi<Informasi>("informasi-admin", edit === "baru" ? "POST" : "PUT", edit && edit !== "baru" ? String(edit.id) : "", payload);
   if (edit === "baru") setEdit(saved);
   setNotice("Informasi berhasil disimpan."); setReload(v => v + 1);
  } catch(e) { setError(pesanGalat(e)); } finally { setBusy(false); }
 }
 const current = edit && edit !== "baru" ? edit : null;
 return <section>
 <header className="mb-6 flex flex-col gap-5 rounded-3xl border border-hub-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
   <div><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-hub-teal-dark"><Icon name="megaphone" className="size-4" /> Pusat informasi</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Kelola informasi UBL</h1><p className="mt-2 max-w-lg text-sm leading-relaxed text-hub-muted">Siapkan pengumuman, atur jadwal tayang, dan bagikan peluang karier kepada alumni.</p></div>
   <button disabled={busy} className={`${button} shrink-0 bg-hub-navy text-white`} onClick={() => { setEdit("baru"); setError(""); setNotice(""); }}><Icon name="plus" className="size-4" />Tambah informasi</button>
 </header>
 {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error} <button className={`${button} ml-2`} onClick={() => { setError(""); setReload(v => v+1); }}>Muat ulang daftar</button></p>}
 {notice && <p role="status" className="mb-4 rounded-xl border border-hub-teal/30 bg-hub-teal/10 p-4 text-sm text-hub-teal-dark">{notice}</p>}
 {edit && <form key={current?.id ?? "baru"} onSubmit={save} className="mb-8 overflow-hidden rounded-2xl border border-hub-line bg-white">
 <div className="border-b border-hub-line bg-hub-canvas/60 px-5 py-5 sm:px-7"><p className="mb-1 text-xs font-medium text-hub-muted">EDITOR INFORMASI</p><h2 className="text-xl font-semibold">{current ? "Ubah informasi" : "Buat informasi baru"}</h2><p className="mt-1 text-sm text-hub-muted">Lengkapi isi, lalu tentukan kapan informasi ditampilkan.</p></div>
 <fieldset disabled={busy} className="space-y-6 p-5 sm:p-7">
 <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]"><div className="min-w-0 space-y-5"><h3 className="flex items-center gap-2 font-semibold"><Icon name="clipboard" />Isi & media</h3>
 <label className="block text-sm font-medium">Judul<input name="judul" required maxLength={200} defaultValue={current?.judul} className={input} /></label>
 <label className="block text-sm font-medium">Kategori<select name="kategori" defaultValue={current?.kategori ?? "INFORMASI"} className={input}><option value="INFORMASI">Informasi</option><option value="PELUANG_KARIER">Peluang karier</option></select></label>
 <label className="block text-sm font-medium">Isi informasi<textarea name="isi" required maxLength={20000} rows={8} defaultValue={current?.isi} className={input} /></label>
 {current ? <InformasiGambarField key={current.id} item={current} onBusy={setBusy} onChange={gambar => { setEdit({ ...current, gambar }); setReload(v => v + 1); }} /> : <p className="rounded-xl border border-dashed border-hub-line bg-hub-canvas p-4 text-sm leading-relaxed text-hub-muted">Simpan informasi sebagai Draft terlebih dahulu untuk menambahkan gambar, lalu pilih Terbit saat siap.</p>}
 <label className="block text-sm font-medium">Tautan (opsional, HTTP/HTTPS)<input name="tautan" type="url" maxLength={2048} defaultValue={current?.tautan ?? ""} className={input} /></label>
 </div><div className="min-w-0 space-y-5 rounded-2xl bg-hub-canvas p-5"><h3 className="flex items-center gap-2 font-semibold"><Icon name="calendar" />Pengaturan tayang</h3><div className="space-y-4"><label className="block text-sm font-medium">Mulai tayang<input name="mulai_at" type="datetime-local" required defaultValue={localDate(current?.mulai_at ?? new Date().toISOString())} className={input} /></label><label className="block text-sm font-medium">Akhir tayang (opsional)<input name="selesai_at" type="datetime-local" defaultValue={current?.selesai_at ? localDate(current.selesai_at) : ""} className={input} /></label></div>
 <p className="text-xs text-hub-muted">Waktu mengikuti zona waktu perangkat Anda. Kosongkan akhir tayang agar tidak kedaluwarsa.</p>
 <label className="block text-sm font-medium">Status<select name="status" defaultValue={current?.status ?? "DRAFT"} className={input}><option value="DRAFT">Draft - belum terlihat alumni</option><option value="TERBIT">Terbit - sesuai periode tayang</option></select></label>
 <p className="text-sm text-hub-muted">Untuk menarik informasi dari alumni, simpan kembali sebagai Draft.</p>
 </div></div>
 <div className="flex flex-wrap items-center gap-3 border-t border-hub-line pt-5"><button className={`${button} bg-hub-navy text-white`} type="submit">{busy ? "Menyimpan..." : "Simpan informasi"}</button><button type="button" className={button} onClick={() => setEdit(null)}>Tutup editor</button></div>
 </fieldset></form>}
 {!daftar && !error && <p role="status">Memuat informasi...</p>}
 {daftar?.data.length === 0 && <p className="rounded-2xl bg-white p-6 text-hub-muted">Belum ada informasi. Buat informasi pertama melalui tombol Tambah informasi.</p>}
 <div className="mb-4 mt-6 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg font-semibold">Daftar informasi</h2>{daftar && <p className="text-sm text-hub-muted">{daftar.data.length} informasi dimuat</p>}</div>
 <ul className="space-y-3">{daftar?.data.map(i => <li key={i.id} className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 sm:flex-row sm:items-center ${current?.id === i.id ? "border-hub-navy ring-1 ring-hub-navy" : "border-hub-line"}`}>
   <div className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-hub-canvas text-hub-navy sm:flex"><Icon name={i.kategori === "PELUANG_KARIER" ? "idcard" : "megaphone"} /></div>
   <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2 text-xs"><span className={`rounded-full px-2.5 py-1 font-medium ${i.status === "DRAFT" ? "bg-hub-canvas text-hub-muted" : "bg-hub-teal/10 text-hub-teal-dark"}`}>{i.status === "DRAFT" ? "Draft" : new Date(i.mulai_at) > new Date() ? "Terjadwal" : i.selesai_at && new Date(i.selesai_at) <= new Date() ? "Selesai tayang" : "Sedang tayang"}</span><span className="text-hub-muted">{kategoriLabel(i.kategori)}</span></div><h3 className="mt-2 break-words font-semibold">{i.judul}</h3><p className="mt-1 text-xs leading-relaxed text-hub-muted">Mulai {tanggalInformasi(i.mulai_at)}{i.selesai_at ? ` / Berakhir ${tanggalInformasi(i.selesai_at)}` : " / Tanpa batas akhir"}</p></div>
   <button disabled={busy} className={`${button} shrink-0 bg-hub-canvas`} onClick={() => { setEdit(i); setError(""); setNotice(""); window.scrollTo({top:0}); }}>{current?.id === i.id ? "Sedang diedit" : "Ubah informasi"}<span className="sr-only"> {i.judul}</span><Icon name="arrow" className="size-4" /></button>
 </li>)}</ul>
 {daftar?.cursorBerikutnya && <button disabled={busy} className={`${button} mt-4`} onClick={more}>{busy ? "Memuat..." : "Muat lebih banyak"}</button>}
 </section>;
}
