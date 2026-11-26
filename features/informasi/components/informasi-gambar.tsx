/* eslint-disable @next/next/no-img-element -- Gambar privat memakai cookie sesi dan endpoint tanpa cache. */
"use client";
import { useState } from "react";
import { kompresFoto } from "@/features/logbook/client";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import type { Informasi } from "../types";
export function InformasiGambar({ item, admin = false }: { item: Informasi; admin?: boolean }) {
 if (!item.gambar) return null;
 const src = `/api/${admin ? "informasi-admin" : "informasi"}/${item.id}/gambar?v=${encodeURIComponent(item.gambar.updated_at)}`;
 return <a href={src} target="_blank" rel="noopener noreferrer" className="my-4 block rounded-xl focus-visible:outline-2 focus-visible:outline-hub-navy" aria-label={`Buka gambar ${item.judul} ukuran penuh`}><img src={src} alt={`Gambar informasi: ${item.judul}`} loading="lazy" className="max-h-[32rem] w-full rounded-xl bg-hub-canvas object-contain" /></a>;
}
export function InformasiGambarField({ item, onChange, onBusy }: { item: Informasi; onChange: (gambar: Informasi["gambar"]) => void; onBusy: (busy: boolean) => void }) {
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState("");
 async function upload(file: File) {
  setBusy(true); onBusy(true); setError("");
  try {
   const { blob } = await kompresFoto(file);
   if (blob.size > 800 * 1024) throw new Error("Gambar masih lebih dari 800 KB setelah kompresi. Pilih gambar yang lebih kecil.");
   const gambar = await panggilApi<NonNullable<Informasi["gambar"]>>("informasi-admin", "POST", `${item.id}/gambar`, blob, blob.type);
   onChange(gambar);
  } catch(e) { setError(pesanGalat(e)); } finally { setBusy(false); onBusy(false); }
 }
 async function remove() {
  setBusy(true); onBusy(true); setError("");
  try { await panggilApi("informasi-admin", "DELETE", `${item.id}/gambar`); onChange(null); }
  catch(e) { setError(pesanGalat(e)); } finally { setBusy(false); onBusy(false); }
 }
 return <div className="rounded-xl border border-hub-line p-4">
 <p className="font-medium">Gambar informasi (opsional)</p>
 <p className="mt-1 text-sm text-hub-muted">Satu gambar JPEG, PNG, atau WebP. Otomatis diperkecil. Unggah, ganti, dan hapus langsung disimpan.</p>
 <InformasiGambar item={item} admin />
 <label className="mt-3 block text-sm">{item.gambar ? "Ganti gambar" : "Unggah gambar"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="mt-2 block min-h-11 w-full text-sm" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; if(file) void upload(file); }} /></label>
 {item.gambar && <button type="button" disabled={busy} onClick={remove} className="mt-2 min-h-11 rounded-xl border border-hub-line px-4">Hapus gambar</button>}
 {busy && <p role="status" className="text-sm">Menyimpan gambar...</p>}
 {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
 </div>;
}
