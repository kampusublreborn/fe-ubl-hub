"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Icon } from "@/shared/components/icons";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { panggilLogbook } from "../lib/client";
import { KATEGORI, type Halaman, type Kategori, type Logbook } from "../lib/types";
import { LogbookItem } from "./logbook-item";

type Tab = "semua" | "saya";
const TABS: { nilai: Tab; label: string }[] = [
  { nilai: "semua", label: "Semua alumni" },
  { nilai: "saya", label: "Logbook saya" },
];

type Daftar = { item: Logbook[]; cursor: number | null };
const dari = (h: Halaman<Logbook>): Daftar => ({ item: h.data, cursor: h.cursorBerikutnya });

export function LogbookFeed({ umpan, saya }: { umpan: Halaman<Logbook>; saya: Halaman<Logbook> }) {
  const [tab, setTab] = useState<Tab>("semua");
  const [kategori, setKategori] = useState<Kategori | null>(null);
  const [daftar, setDaftar] = useState<Record<Tab, Daftar>>({ semua: dari(umpan), saya: dari(saya) });
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const aktif = daftar[tab];
  // Filter kategori memengaruhi dua tab: tab "semua" ke server, tab "saya" difilter di klien.
  const tampil = tab === "saya" && kategori ? aktif.item.filter((l) => l.kategori === kategori) : aktif.item;

  async function muat(tabTujuan: Tab, kat: Kategori | null, cursor: number | null, tambah: boolean) {
    setMemuat(true);
    setGalat(null);
    try {
      const q = new URLSearchParams({ limit: "20" });
      if (kat && tabTujuan === "semua") q.set("kategori", kat);
      if (cursor) q.set("cursor", String(cursor));
      const r = await panggilLogbook<Halaman<Logbook>>("GET", `${tabTujuan === "saya" ? "saya" : ""}?${q}`);
      setDaftar((d) => ({
        ...d,
        [tabTujuan]: tambah ? { item: [...d[tabTujuan].item, ...r.data], cursor: r.cursorBerikutnya } : dari(r),
      }));
    } catch (e) {
      setGalat(pesanGalat(e, "Logbook belum dapat dimuat."));
    } finally {
      setMemuat(false);
    }
  }

  function pilihKategori(k: Kategori | null) {
    setKategori(k);
    if (tab === "semua") void muat("semua", k, null, false);
  }

  function hapus(id: number) {
    setDaftar((d) => ({
      semua: { ...d.semua, item: d.semua.item.filter((l) => l.id !== id) },
      saya: { ...d.saya, item: d.saya.item.filter((l) => l.id !== id) },
    }));
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const next = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(TABS[next]!.nilai);
    tabRefs.current[next]?.focus();
  }

  const chip = (aktifChip: boolean) =>
    `inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors ${focusRing} ${
      aktifChip ? "border-hub-navy bg-hub-navy text-white" : "border-hub-line bg-white hover:bg-hub-canvas"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Daftar logbook" className="grid grid-cols-2 rounded-2xl border border-hub-line bg-white">
        {TABS.map((t, i) => {
          const sel = t.nilai === tab;
          return (
            <button
              key={t.nilai}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${t.nilai}`}
              aria-selected={sel}
              aria-controls={`${baseId}-panel`}
              tabIndex={sel ? 0 : -1}
              onClick={() => setTab(t.nilai)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative min-h-12 cursor-pointer rounded-2xl px-4 text-sm font-medium transition-colors ${focusRing} ${
                sel ? "font-semibold text-hub-ink" : "text-hub-muted hover:bg-hub-canvas"
              }`}
            >
              {t.label}
              {sel && (
                <span aria-hidden="true" className="absolute inset-x-1/4 bottom-0 h-1 rounded-full bg-hub-navy" />
              )}
            </button>
          );
        })}
      </div>

      <div role="group" aria-label="Filter kategori" className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <button type="button" aria-pressed={kategori === null} onClick={() => pilihKategori(null)} className={chip(kategori === null)}>
          Semua
        </button>
        {KATEGORI.map((k) => (
          <button key={k.nilai} type="button" aria-pressed={kategori === k.nilai} onClick={() => pilihKategori(k.nilai)} className={chip(kategori === k.nilai)}>
            {k.label}
          </button>
        ))}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${tab}`}
        aria-busy={memuat}
        className="flex flex-col gap-4"
      >
        {galat && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {galat}
          </p>
        )}

        {tampil.length === 0 && !memuat && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-hub-line bg-white px-6 py-12 text-center">
            <p className="font-medium">
              {tab === "saya" ? "Anda belum menulis logbook" : "Belum ada logbook di kategori ini"}
            </p>
            <p className="max-w-sm text-sm text-hub-muted">
              {tab === "saya"
                ? "Logbook pertama Anda juga menjadi dasar Career Path."
                : "Jadilah yang pertama berbagi kabar karier dengan sesama alumni."}
            </p>
            <Link
              href="/logbook/baru"
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl bg-hub-navy px-5 text-sm font-semibold text-white ${focusRing}`}
            >
              <Icon name="plus" className="size-4" />
              Tulis logbook
            </Link>
          </div>
        )}

        {tampil.map((l) => (
          <LogbookItem key={l.id} awal={l} onHapus={hapus} />
        ))}

        {memuat && (
          <p role="status" className="text-center text-sm text-hub-muted">
            Memuat...
          </p>
        )}

        {aktif.cursor && !memuat && (
          <button
            type="button"
            onClick={() => muat(tab, kategori, aktif.cursor, true)}
            className={`min-h-12 self-center rounded-xl border border-hub-line bg-white px-6 text-sm font-medium hover:bg-hub-canvas ${focusRing}`}
          >
            Muat lebih banyak
          </button>
        )}
      </div>
    </div>
  );
}
