"use client";
import { InformasiGambarField } from "./informasi-gambar";
import { useEffect, useState, type FormEvent } from "react";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { type Informasi, type HalamanInformasi, kategoriLabel } from "../types";
const input = `mt-1 block min-h-11 w-full rounded-xl border border-hub-line bg-white px-3 py-2 ${focusRing}`;
const button = `min-h-11 rounded-xl border border-hub-line px-4 disabled:opacity-50 ${focusRing}`;
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
 <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Kelola informasi UBL</h1><p className="mt-1 text-sm text-hub-muted">Terbitkan peluang karier dan pengumuman untuk alumni.</p></div><button disabled={busy} className={`${button} bg-hub-navy text-white`} onClick={() => { setEdit("baru"); setError(""); setNotice(""); }}>Tambah informasi</button></div>
 {error && <p role="alert" className="mb-4 text-red-700">{error} <button className={`${button} ml-2`} onClick={() => { setError(""); setReload(v => v+1); }}>Muat ulang daftar</button></p>}
 {notice && <p role="status" className="mb-4 text-hub-teal">{notice}</p>}
 {edit && <form key={current?.id ?? "baru"} onSubmit={save} className="mb-6 space-y-4 rounded-2xl border border-hub-line bg-white p-5">
 <h2 className="text-lg font-semibold">{current ? "Ubah informasi" : "Informasi baru"}</h2>
 <fieldset disabled={busy} className="space-y-4">
 <label className="block text-sm">Judul<input name="judul" required maxLength={200} defaultValue={current?.judul} className={input} /></label>
 <label className="block text-sm">Kategori<select name="kategori" defaultValue={current?.kategori ?? "INFORMASI"} className={input}><option value="INFORMASI">Informasi</option><option value="PELUANG_KARIER">Peluang karier</option></select></label>
 <label className="block text-sm">Isi informasi<textarea name="isi" required maxLength={20000} rows={8} defaultValue={current?.isi} className={input} /></label>
 {current ? <InformasiGambarField key={current.id} item={current} onBusy={setBusy} onChange={gambar => { setEdit({ ...current, gambar }); setReload(v => v + 1); }} /> : <p className="text-sm text-hub-muted">Simpan informasi sebagai Draft terlebih dahulu untuk menambahkan gambar, lalu pilih Terbit saat siap.</p>}
 <label className="block text-sm">Tautan (opsional, HTTP/HTTPS)<input name="tautan" type="url" maxLength={2048} defaultValue={current?.tautan ?? ""} className={input} /></label>
 <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">Mulai tayang<input name="mulai_at" type="datetime-local" required defaultValue={localDate(current?.mulai_at ?? new Date().toISOString())} className={input} /></label><label className="block text-sm">Akhir tayang (opsional)<input name="selesai_at" type="datetime-local" defaultValue={current?.selesai_at ? localDate(current.selesai_at) : ""} className={input} /></label></div>
 <p className="text-xs text-hub-muted">Waktu mengikuti zona waktu perangkat Anda. Kosongkan akhir tayang agar tidak kedaluwarsa.</p>
 <label className="block text-sm">Status<select name="status" defaultValue={current?.status ?? "DRAFT"} className={input}><option value="DRAFT">Draft ? belum terlihat alumni</option><option value="TERBIT">Terbit ? tampil sesuai periode tayang</option></select></label>
 <p className="text-sm text-hub-muted">Untuk menarik informasi dari alumni, simpan kembali sebagai Draft.</p>
 <div className="flex gap-3"><button className={`${button} bg-hub-navy text-white`} type="submit">{busy ? "Menyimpan?" : "Simpan informasi"}</button><button type="button" className={button} onClick={() => setEdit(null)}>Batal</button></div>
 </fieldset></form>}
 {!daftar && !error && <p role="status">Memuat informasi?</p>}
 {daftar?.data.length === 0 && <p className="rounded-2xl bg-white p-6 text-hub-muted">Belum ada informasi. Buat informasi pertama melalui tombol Tambah informasi.</p>}
 <ul className="space-y-3">{daftar?.data.map(i => <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hub-line bg-white p-5"><div className="min-w-0 flex-1"><p className="text-xs text-hub-muted">{kategoriLabel(i.kategori)} ? {i.status === "DRAFT" ? "Draft" : new Date(i.mulai_at) > new Date() ? "Terjadwal" : i.selesai_at && new Date(i.selesai_at) <= new Date() ? "Selesai tayang" : "Sedang tayang"}</p><h2 className="mt-1 break-words font-semibold">{i.judul}</h2></div><button disabled={busy} className={button} onClick={() => { setEdit(i); setError(""); setNotice(""); window.scrollTo({top:0}); }}>Ubah<span className="sr-only"> {i.judul}</span></button></li>)}</ul>
 {daftar?.cursorBerikutnya && <button disabled={busy} className={`${button} mt-4`} onClick={more}>{busy ? "Memuat?" : "Muat lebih banyak"}</button>}
 </section>;
}
