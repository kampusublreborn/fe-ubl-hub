"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { focusRing } from "@/shared/lib/ui";

type Hasil = { judul: string; ringkasan: string; kategori: string; href: string };
const menu: Hasil[] = [
  ["Beranda", "/", "Dashboard aktivitas alumni UBL"],
  ["Profil", "/profil", "Identitas dan profil alumni"],
  ["Tracer Study", "/tracer", "Survei kuesioner pendidikan dan pekerjaan alumni"],
  ["Career Path", "/career-path", "Karier kompetensi rekomendasi pengembangan diri"],
  ["Kartu Alumni", "/kartu", "Kartu identitas alumni digital"],
  ["Logbook", "/logbook", "Cerita pengalaman dan aktivitas alumni"],
  ["Komunitas", "/komunitas", "Grup jejaring alumni"],
  ["Informasi", "/informasi", "Berita pengumuman lowongan peluang karier dan acara UBL"],
  ["Notifikasi", "/notifikasi", "Pemberitahuan dan pembaruan pribadi"],
].map(([judul, href, ringkasan]) => ({ judul, href, ringkasan, kategori: "Menu" }));

export function GlobalSearch() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; data: Hasil[]; berikutnya: boolean } | null>(null);
  const [error, setError] = useState("");
  const q = query.trim();
  const key = `${q}:${page}:${retry}`;
  const valid = q.length >= 2;
  const loading = valid && result?.key !== key && !error;
  const suggestions = menu.filter(item => !q || `${item.judul} ${item.ringkasan}`.toLowerCase().includes(q.toLowerCase()));

  function show() { dialog.current?.showModal(); setOpen(true); input.current?.focus(); }
  function close() { dialog.current?.close(); setOpen(false); }

  useEffect(() => {
    if (!open || !valid) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/pencarian?q=${encodeURIComponent(q)}&page=${page}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error(response.status === 401 ? "Sesi berakhir. Silakan masuk kembali." : "Pencarian belum berhasil. Coba lagi.");
        const data = await response.json();
        if (!controller.signal.aborted) setResult({ key, ...data });
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Pencarian belum berhasil.");
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, valid, q, page, key]);

  const rows = [...(page === 1 ? suggestions : []), ...(result?.key === key ? result.data : [])];
  return <>
    <button type="button" onClick={show} aria-label="Cari di UBL Hub" className={`flex min-h-11 items-center gap-2 rounded-full border border-hub-line bg-hub-canvas px-3 text-sm text-hub-muted hover:bg-hub-navy/10 lg:w-80 ${focusRing}`}>
      <Icon name="search" /><span className="hidden sm:inline">Cari di UBL Hub…</span>
    </button>
    <dialog ref={dialog} onClose={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) close(); }} aria-labelledby="search-title" className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-2xl border border-hub-line bg-white p-0 text-hub-ink shadow-xl backdrop:bg-hub-navy/50">
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <h2 id="search-title" className="text-lg font-semibold">Cari di UBL Hub</h2>
        <button type="button" onClick={close} aria-label="Tutup pencarian" className={`flex size-11 items-center justify-center rounded-full hover:bg-hub-canvas ${focusRing}`}><Icon name="x" /></button>
      </div>
      <div className="px-5 pb-4">
        <label htmlFor="hub-search" className="mb-2 block text-sm font-medium">Apa yang ingin kamu temukan?</label>
        <input ref={input} id="hub-search" type="search" value={query} maxLength={100} autoComplete="off" placeholder="Cari informasi, logbook, komunitas…" aria-describedby="search-help" onChange={e => { setQuery(e.target.value); setPage(1); setError(""); }} className={`min-h-12 w-full rounded-xl border border-hub-line bg-hub-canvas px-4 text-base ${focusRing}`} />
        <p id="search-help" className="mt-2 text-xs text-hub-muted">Ketik minimal 2 karakter. Hasil mengikuti akses akun kamu.</p>
      </div>
      <div className="max-h-[55dvh] overflow-y-auto overscroll-contain border-t border-hub-line px-3 pb-4">
        <p role="status" className="px-2 py-3 text-sm text-hub-muted">{loading ? "Mencari…" : !valid ? "Jelajahi menu UBL Hub" : rows.length ? `${rows.length} hasil di halaman ini` : error ? "" : "Belum ada hasil. Coba kata yang lebih singkat atau berbeda."}</p>
        {error && <div role="alert" className="px-2 pb-3 text-sm"><p>{error}</p><button type="button" onClick={() => { setError(""); setRetry(n => n + 1); }} className={`mt-2 min-h-11 rounded-lg border border-hub-line px-4 ${focusRing}`}>Coba lagi</button></div>}
        <ul className="space-y-1">{rows.map(item => <li key={item.href}>
          <Link href={item.href} onClick={close} className={`block rounded-xl p-3 hover:bg-hub-canvas ${focusRing}`}>
            <span className="text-xs font-medium text-hub-muted">{item.kategori}</span>
            <p className="font-semibold [overflow-wrap:anywhere]">{item.judul}</p>
            <p className="mt-1 line-clamp-2 text-sm text-hub-muted [overflow-wrap:anywhere]">{item.ringkasan}</p>
          </Link>
        </li>)}</ul>
        {valid && <div className="mt-3 flex justify-between gap-3 px-2">
          <button type="button" disabled={page === 1 || loading} onClick={() => { setPage(p => p - 1); setError(""); }} className={`min-h-11 rounded-lg px-3 text-sm disabled:opacity-40 ${focusRing}`}>Sebelumnya</button>
          <button type="button" disabled={loading || result?.key !== key || !result?.berikutnya} onClick={() => { setPage(p => p + 1); setError(""); }} className={`min-h-11 rounded-lg px-3 text-sm disabled:opacity-40 ${focusRing}`}>Berikutnya</button>
        </div>}
      </div>
    </dialog>
  </>;
}
