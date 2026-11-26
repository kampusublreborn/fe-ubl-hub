"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Icon } from "@/shared/components/icons";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { panggilKomunitas } from "../lib/client";
import { labelOrientasi, type Halaman, type Jenis, type KartuGrup } from "../lib/types";
import { KartuGrup as Kartu } from "./kartu-grup";

type Tab = "jelajah" | "saya";
const TABS: { nilai: Tab; label: string }[] = [
  { nilai: "jelajah", label: "Jelajahi" },
  { nilai: "saya", label: "Grup saya" },
];

type Daftar = { item: KartuGrup[]; cursor: number | null };
const dari = (h: Halaman<KartuGrup>): Daftar => ({ item: h.data, cursor: h.cursorBerikutnya });

export function KomunitasJelajah({
  jelajah,
  saya,
  saran,
  undangan,
}: {
  jelajah: Halaman<KartuGrup>;
  saya: Halaman<KartuGrup>;
  saran: { orientasi: string | null; data: KartuGrup[] };
  undangan: KartuGrup[];
}) {
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tab, setTab] = useState<Tab>(saya.data.length > 0 ? "saya" : "jelajah");
  const [daftar, setDaftar] = useState<Record<Tab, Daftar>>({ jelajah: dari(jelajah), saya: dari(saya) });
  const [q, setQ] = useState("");
  const [jenis, setJenis] = useState<Jenis | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [daftarUndangan, setUndangan] = useState(undangan);
  const [sibukUndangan, setSibukUndangan] = useState<number | null>(null);

  const aktif = daftar[tab];
  const mencari = tab === "jelajah" && (q.trim() !== "" || jenis !== null);

  async function muat(t: Tab, kata: string, j: Jenis | null, cursor: number | null, tambah: boolean) {
    setMemuat(true);
    setGalat(null);
    try {
      const p = new URLSearchParams({ limit: "20" });
      if (t === "saya") p.set("saya", "1");
      if (kata.trim()) p.set("q", kata.trim());
      if (j) p.set("jenis", j);
      if (cursor) p.set("cursor", String(cursor));
      const r = await panggilKomunitas<Halaman<KartuGrup>>("GET", `?${p}`);
      setDaftar((d) => ({
        ...d,
        [t]: tambah ? { item: [...d[t].item, ...r.data], cursor: r.cursorBerikutnya } : dari(r),
      }));
    } catch (e) {
      setGalat(pesanGalat(e, "Grup belum dapat dimuat."));
    } finally {
      setMemuat(false);
    }
  }

  function pilihJenis(j: Jenis | null) {
    setJenis(j);
    void muat("jelajah", q, j, null, false);
  }

  async function jawabUndangan(g: KartuGrup, terima: boolean) {
    setSibukUndangan(g.id);
    setGalat(null);
    try {
      await panggilKomunitas(terima ? "POST" : "DELETE", `${g.id}/gabung`);
      setUndangan((u) => u.filter((x) => x.id !== g.id));
      if (terima) {
        const baru: KartuGrup = { ...g, saya: { status: "AKTIF", peran: "ANGGOTA" }, jumlahAnggota: g.jumlahAnggota + 1 };
        setDaftar((d) => ({ ...d, saya: { ...d.saya, item: [baru, ...d.saya.item] } }));
      }
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setSibukUndangan(null);
    }
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const next = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(TABS[next]!.nilai);
    tabRefs.current[next]?.focus();
  }

  const chip = (on: boolean) =>
    `inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors ${focusRing} ${
      on ? "border-hub-navy bg-hub-navy text-white" : "border-hub-line bg-white hover:bg-hub-canvas"
    }`;

  const orientasi = labelOrientasi(saran.orientasi);
  const tampilSaran = tab === "jelajah" && !mencari && saran.data.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {daftarUndangan.length > 0 && (
        <section aria-labelledby={`${baseId}-undangan`} className="rounded-2xl border border-hub-sand/60 bg-hub-sand/10 p-4 sm:p-5">
          <h2 id={`${baseId}-undangan`} className="text-base font-semibold">
            Undangan untuk Anda
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {daftarUndangan.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/komunitas/${g.id}`} className={`text-sm font-semibold hover:underline [overflow-wrap:anywhere] ${focusRing}`}>
                    {g.nama}
                  </Link>
                  <p className="text-xs text-hub-muted">
                    <span className="tabular-nums">{g.jumlahAnggota}</span> anggota · {g.jenis === "PRIVAT" ? "Privat" : "Publik"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={sibukUndangan === g.id}
                    onClick={() => jawabUndangan(g, true)}
                    className={`min-h-11 cursor-pointer rounded-full bg-hub-navy px-5 text-sm font-semibold text-white disabled:opacity-60 ${focusRing}`}
                  >
                    Terima<span className="sr-only"> undangan grup {g.nama}</span>
                  </button>
                  <button
                    type="button"
                    disabled={sibukUndangan === g.id}
                    onClick={() => jawabUndangan(g, false)}
                    className={`min-h-11 cursor-pointer rounded-full border border-hub-line bg-white px-4 text-sm font-medium hover:bg-hub-canvas disabled:opacity-60 ${focusRing}`}
                  >
                    Tolak<span className="sr-only"> undangan grup {g.nama}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div role="tablist" aria-label="Daftar grup" className="grid grid-cols-2 rounded-2xl border border-hub-line bg-white">
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
              {sel && <span aria-hidden="true" className="absolute inset-x-1/4 bottom-0 h-1 rounded-full bg-hub-navy" />}
            </button>
          );
        })}
      </div>

      {tab === "jelajah" && (
        <div className="flex flex-col gap-3">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              void muat("jelajah", q, jenis, null, false);
            }}
            className="flex gap-2"
          >
            <label htmlFor={`${baseId}-q`} className="sr-only">
              Cari grup
            </label>
            <div className="relative min-w-0 flex-1">
              <input
                id={`${baseId}-q`}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                maxLength={80}
                placeholder="Cari grup, misalnya: data, wirausaha"
                className={`min-h-12 w-full rounded-full border border-hub-line bg-white px-5 pr-12 text-base sm:text-sm [&::-webkit-search-cancel-button]:appearance-none ${focusRing}`}
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    void muat("jelajah", "", jenis, null, false);
                  }}
                  aria-label="Hapus pencarian"
                  className={`absolute right-1 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-hub-muted hover:bg-hub-canvas hover:text-hub-ink ${focusRing}`}
                >
                  <Icon name="x" className="size-4" />
                </button>
              )}
            </div>
            <button type="submit" className={`min-h-12 shrink-0 cursor-pointer rounded-full bg-hub-navy px-6 text-sm font-semibold text-white ${focusRing}`}>
              Cari
            </button>
          </form>
          <div role="group" aria-label="Jenis grup" className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <button type="button" aria-pressed={jenis === null} onClick={() => pilihJenis(null)} className={chip(jenis === null)}>
              Semua
            </button>
            <button type="button" aria-pressed={jenis === "PUBLIK"} onClick={() => pilihJenis("PUBLIK")} className={chip(jenis === "PUBLIK")}>
              Publik
            </button>
            <button type="button" aria-pressed={jenis === "PRIVAT"} onClick={() => pilihJenis("PRIVAT")} className={chip(jenis === "PRIVAT")}>
              Privat
            </button>
          </div>
        </div>
      )}

      {tampilSaran && (
        <section aria-labelledby={`${baseId}-saran`} className="flex flex-col gap-3">
          <div>
            <h2 id={`${baseId}-saran`} className="flex items-center gap-2 text-base font-semibold">
              <Icon name="sparkle" className="size-5 text-hub-teal-dark" />
              Disarankan untuk Anda
            </h2>
            {orientasi && <p className="text-sm text-hub-muted">Sesuai orientasi karier Anda di tracer study: {orientasi}.</p>}
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {saran.data.map((g) => (
              <Kartu key={g.id} grup={g} />
            ))}
          </ul>
        </section>
      )}

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${tab}`} aria-busy={memuat} className="flex flex-col gap-4">
        {galat && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {galat}
          </p>
        )}

        {aktif.item.length === 0 && !memuat && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-hub-line bg-white px-6 py-12 text-center">
            <p className="font-medium">
              {tab === "saya" ? "Anda belum bergabung ke grup mana pun" : mencari ? "Tidak ada grup yang cocok" : "Belum ada grup"}
            </p>
            <p className="max-w-sm text-sm text-hub-muted">
              {tab === "saya" ? "Jelajahi grup profesi atau buat grup baru untuk sesama alumni." : "Coba kata kunci lain, atau buat grup baru."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {tab === "saya" && (
                <button
                  type="button"
                  onClick={() => setTab("jelajah")}
                  className={`min-h-11 cursor-pointer rounded-xl border border-hub-line bg-white px-5 text-sm font-medium hover:bg-hub-canvas ${focusRing}`}
                >
                  Jelajahi grup
                </button>
              )}
              <Link href="/komunitas/baru" className={`inline-flex min-h-11 items-center gap-2 rounded-xl bg-hub-navy px-5 text-sm font-semibold text-white ${focusRing}`}>
                <Icon name="plus" className="size-4" />
                Buat grup
              </Link>
            </div>
          </div>
        )}

        {aktif.item.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {aktif.item.map((g) => (
              <Kartu key={g.id} grup={g} />
            ))}
          </ul>
        )}

        {/* Hasil pencarian diumumkan ke screen reader tanpa memindahkan fokus. */}
        <p role="status" className={mencari && !memuat ? "text-sm text-hub-muted" : "sr-only"}>
          {memuat ? "Memuat..." : mencari ? `${aktif.item.length}${aktif.cursor ? "+" : ""} grup ditemukan` : ""}
        </p>

        {aktif.cursor && !memuat && (
          <button
            type="button"
            onClick={() => muat(tab, q, jenis, aktif.cursor, true)}
            className={`min-h-12 cursor-pointer self-center rounded-xl border border-hub-line bg-white px-6 text-sm font-medium hover:bg-hub-canvas ${focusRing}`}
          >
            Muat lebih banyak
          </button>
        )}
      </div>
    </div>
  );
}
