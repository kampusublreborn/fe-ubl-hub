"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { tautanNotifikasi, type HalamanNotifikasi, type Notifikasi } from "../lib/types";
import { PushSettings } from "./push-settings";

const kabari = () => window.dispatchEvent(new Event("notifikasi-dibaca"));
export function NotificationInbox() {
  const router = useRouter();
  const bukaId = useSearchParams().get("buka");
  const [halaman, setHalaman] = useState<HalamanNotifikasi | null>(null);
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  useEffect(() => {
    let alive = true;
    void panggilApi<HalamanNotifikasi>("notifikasi", "GET", "").then((r) => { if (alive) setHalaman(r); })
      .catch((e) => { if (alive) setGalat(pesanGalat(e)); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!bukaId || !/^[1-9]\d*$/.test(bukaId)) return;
    let alive = true;
    void (async () => {
      const n = await panggilApi<Notifikasi>("notifikasi", "GET", bukaId);
      await panggilApi("notifikasi", "PATCH", `${n.id}/baca`);
      if (alive) { kabari(); router.replace(tautanNotifikasi(n)); }
    })().catch((e) => { if (alive) setGalat(pesanGalat(e)); });
    return () => { alive = false; };
  }, [bukaId, router]);

  async function jalankan(action: () => Promise<void>) {
    setSibuk(true); setGalat("");
    try { await action(); } catch (e) { setGalat(pesanGalat(e)); }
    finally { setSibuk(false); }
  }
  const buka = (n: Notifikasi) => jalankan(async () => {
    await panggilApi("notifikasi", "PATCH", `${n.id}/baca`);
    kabari(); router.push(tautanNotifikasi(n));
  });

  return <>
    <div><h1 className="text-2xl font-semibold">Notifikasi</h1><p className="mt-1 text-sm text-hub-muted">Ikuti pembaruan tracer study, logbook, dan komunitas kamu.</p></div>
    <section className="overflow-hidden rounded-2xl border border-hub-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hub-line p-4">
        <div><h2 className="font-semibold text-hub-ink">Kotak masuk</h2><p role="status" className="mt-1 text-sm text-hub-muted">{halaman ? halaman.belumDibaca ? `${halaman.belumDibaca} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca" : "Pembaruan terbaru untuk kamu"}</p></div>
        <button type="button" disabled={sibuk || !halaman?.belumDibaca} className={`min-h-11 rounded-xl border border-hub-line px-3 text-sm font-medium text-hub-navy hover:bg-hub-canvas disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          onClick={() => void jalankan(async () => {
            await panggilApi("notifikasi", "PATCH", "baca-semua");
            setHalaman((h) => h && ({ ...h, belumDibaca: 0, data: h.data.map((n) => ({ ...n, dibaca_at: n.dibaca_at ?? new Date().toISOString() })) }));
            kabari();
          })}>Tandai semua dibaca</button>
      </div>
      {!halaman && !galat && <p role="status" className="p-5 text-sm">Memuat notifikasi…</p>}
      {halaman?.data.length === 0 && <div className="px-6 py-12 text-center"><p className="font-semibold text-hub-ink">Belum ada pembaruan</p><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-hub-muted">Balasan komentar, kabar komunitas, dan pembaruan tracer study akan muncul di sini.</p></div>}
      <ul className="divide-y divide-hub-line">{halaman?.data.map((n) => <li key={n.id}>
        <button type="button" disabled={sibuk} onClick={() => void buka(n)}
          className={`group w-full border-l-4 p-4 text-left text-hub-ink transition-colors hover:bg-hub-canvas focus-visible:outline-offset-[-4px] disabled:cursor-wait motion-reduce:transition-none sm:p-5 ${!n.dibaca_at ? "border-l-hub-navy bg-hub-navy/5" : "border-l-transparent"} ${focusRing}`}>
          <span className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-hub-muted">
            <span className="rounded-md border border-hub-line bg-white px-2 py-1">{n.tujuan.fitur === "tracer" ? "Tracer study" : n.tujuan.fitur === "logbook" ? "Logbook" : n.tujuan.fitur === "komunitas" ? "Komunitas" : "UBL Hub"}</span>
            {!n.dibaca_at && <span className="rounded-full bg-hub-navy px-2.5 py-1 text-white">Belum dibaca</span>}
          </span>
          <span className="block break-words text-base font-semibold leading-snug">{n.judul}</span>
          <span className="mt-2 block whitespace-pre-line text-sm leading-relaxed text-hub-muted [overflow-wrap:anywhere]">{n.pesan}</span>
          <span className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <time dateTime={n.created_at} className="text-xs text-hub-muted">{new Date(n.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
            <span className="text-sm font-semibold text-hub-navy group-hover:underline">Lihat pembaruan <span aria-hidden="true">?</span></span>
          </span>
        </button>
      </li>)}</ul>
      {halaman?.cursorBerikutnya && <button type="button" disabled={sibuk} className={`m-4 min-h-11 rounded-full border border-hub-line px-5 text-sm ${focusRing}`}
        onClick={() => void jalankan(async () => {
          const r = await panggilApi<HalamanNotifikasi>("notifikasi", "GET", `?cursor=${halaman.cursorBerikutnya}`);
          setHalaman((h) => ({ ...r, data: [...(h?.data ?? []), ...r.data] }));
        })}>{sibuk ? "Memuat…" : "Muat lainnya"}</button>}
    </section>
    <PushSettings />
    {galat && <p role="alert" className="text-sm text-red-700">{galat} <button type="button" className={`min-h-11 underline ${focusRing}`} onClick={() => window.location.reload()}>Coba lagi</button></p>}
  </>;
}
