"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon, type IconName } from "@/shared/components/icons";
import type { ProfilPublik } from "../lib/api";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-navy";
const focusRingLight =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const idx = (i: number) => ({ "--i": i }) as React.CSSProperties;

function initials(nama: string) {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  return ((kata[0]?.[0] ?? "") + (kata.length > 1 ? (kata.at(-1)?.[0] ?? "") : "")).toUpperCase();
}

function bagianNomor(p: ProfilPublik) {
  const n = p.nomor;
  if (!n) return [];
  return [
    { nilai: n.slice(0, 2), judul: "Program studi", arti: p.prodi ?? "Program studi alumni" },
    {
      nilai: n.slice(2, 4),
      judul: "Tahun lulus",
      arti: `Lulus tahun ${p.tahunLulus ?? "20" + n.slice(2, 4)}`,
    },
    {
      nilai: n.slice(4, 5),
      judul: "Periode wisuda",
      arti: n[4] === "1" ? "Wisuda semester ganjil" : "Wisuda semester genap",
    },
    { nilai: n.slice(5), judul: "Nomor urut", arti: "Urutan pemanggilan saat wisuda" },
  ];
}

const periodeTeks = (p: ProfilPublik) =>
  p.periodeWisuda === "GANJIL" ? "Ganjil" : p.periodeWisuda === "GENAP" ? "Genap" : "-";

/* ------------------------------------------------------------ Potongan UI */

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 items-center rounded-xl bg-white px-2 py-1.5 ring-1 ring-black/10">
        <Image src="/ubl-logo.png" alt="" width={1024} height={609} className="h-full w-auto" />
      </span>
      <p className={`text-sm font-semibold leading-tight ${dark ? "text-white" : ""}`}>
        Universitas Bandar Lampung
        <span
          className={`block text-xs font-semibold uppercase tracking-[0.2em] ${
            dark ? "text-white/70" : "text-hub-muted"
          }`}
        >
          Profil alumni
        </span>
      </p>
    </div>
  );
}

/** Avatar inisial dengan cincin gradien berputar dan lencana terverifikasi yang berdenyut. */
function Avatar({ p, besar = false }: { p: ProfilPublik; besar?: boolean }) {
  const terbit = p.nomor !== null;
  return (
    <div className={`relative ${besar ? "size-44" : "size-28"}`}>
      <span
        aria-hidden="true"
        className="hub-spin absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#26a69a,#e0a100,#26a69a)]"
      />
      <span
        className={`absolute inset-[3px] flex items-center justify-center rounded-full bg-hub-navy font-bold tracking-wide text-white ${
          besar ? "text-6xl" : "text-4xl"
        }`}
      >
        <span aria-hidden="true">
          {initials(p.nama) || <Icon name="user" className={besar ? "size-16" : "size-10"} />}
        </span>
      </span>
      {terbit && (
        <span
          className={`absolute flex items-center justify-center ${
            besar ? "-bottom-1 right-1 size-12" : "-bottom-1 -right-1 size-9"
          }`}
        >
          <span aria-hidden="true" className="hub-ping absolute inset-1 rounded-full bg-hub-teal" />
          <span
            className={`relative flex items-center justify-center rounded-full bg-hub-teal text-hub-ink ring-4 ring-hub-navy ${
              besar ? "size-11" : "size-8"
            }`}
          >
            <Icon name="check" className={besar ? "size-6" : "size-4"} />
            <span className="sr-only">Terverifikasi</span>
          </span>
        </span>
      )}
    </div>
  );
}

function Lencana({ p }: { p: ProfilPublik }) {
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 ring-1 ring-white/15">
      <Icon name="award" className="size-3.5" />
      {p.nomor ? "Alumni terverifikasi" : "Alumni UBL"}
    </p>
  );
}

function Linimasa({ p }: { p: ProfilPublik }) {
  const langkah: { icon: IconName; judul: string; isi: string }[] = [
    {
      icon: "book",
      judul: "Menempuh studi",
      isi: p.prodi ? `Program studi ${p.prodi}` : "Universitas Bandar Lampung",
    },
    {
      icon: "calendar",
      judul: p.periodeWisuda ? `Wisuda ${periodeTeks(p).toLowerCase()}` : "Wisuda",
      isi: p.tahunLulus ? `Tahun ${p.tahunLulus}` : "Tahun belum tercatat",
    },
    { icon: "award", judul: "Resmi menjadi alumni UBL", isi: "Tergabung dalam jejaring alumni" },
  ];
  return (
    <ol className="relative flex flex-col gap-5">
      <span
        aria-hidden="true"
        className="hub-grow absolute bottom-4 left-[19px] top-4 w-0.5 bg-gradient-to-b from-hub-teal to-hub-sand"
      />
      {langkah.map((l, i) => (
        <li key={l.judul} className="hub-pop relative flex gap-4" style={idx(i + 6)}>
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-hub-teal-dark ring-2 ring-hub-teal">
            <Icon name={l.icon} className="size-5" />
          </span>
          <div className="min-w-0 pt-1">
            <p className="font-semibold leading-tight">{l.judul}</p>
            <p className="text-sm text-hub-muted [overflow-wrap:anywhere]">{l.isi}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------- Komponen */

export function ProfilCard({ p }: { p: ProfilPublik }) {
  const tilt = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [aktif, setAktif] = useState(0);
  const [status, setStatus] = useState("");
  const bagian = bagianNomor(p);
  const terbit = p.nomor !== null;

  function onMove(e: React.PointerEvent) {
    // Efek hanya untuk mouse. Sentuhan dibiarkan agar tidak mengganggu scroll.
    if (e.pointerType !== "mouse" || !tilt.current) return;
    const r = tilt.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const s = tilt.current.style;
    s.setProperty("--rx", `${((0.5 - py) * 6).toFixed(2)}deg`);
    s.setProperty("--ry", `${((px - 0.5) * 8).toFixed(2)}deg`);
    s.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    s.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    s.setProperty("--glare", "1");
  }

  function onLeave() {
    const s = tilt.current?.style;
    if (!s) return;
    s.setProperty("--rx", "0deg");
    s.setProperty("--ry", "0deg");
    s.setProperty("--glare", "0");
  }

  /** Paralaks latar panel kiri (desktop) mengikuti mouse. */
  function onPanelMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !panel.current) return;
    const r = panel.current.getBoundingClientRect();
    const s = panel.current.style;
    s.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    s.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  }

  function umumkan(teks: string) {
    setStatus(teks);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(""), 2500);
  }

  async function salin() {
    if (!p.nomor) return;
    try {
      await navigator.clipboard.writeText(p.nomor);
      umumkan("ID alumni disalin");
    } catch {
      umumkan("Gagal menyalin, salin manual dari kartu");
    }
  }

  async function bagikan() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Alumni UBL: ${p.nama}`, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      umumkan("Tautan profil disalin");
    } catch {
      umumkan("Gagal menyalin tautan");
    }
  }

  const stat: { icon: IconName; label: string; nilai: string }[] = [
    { icon: "book", label: "Program studi", nilai: p.prodi ?? "-" },
    { icon: "calendar", label: "Tahun lulus", nilai: p.tahunLulus ? String(p.tahunLulus) : "-" },
    { icon: "award", label: "Wisuda", nilai: periodeTeks(p) },
  ];

  const btn = `inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] motion-reduce:active:scale-100 ${focusRing}`;
  const btnSalin = `${btn} border border-hub-line bg-white hover:bg-hub-canvas disabled:cursor-not-allowed disabled:opacity-50`;
  const btnBagikan = `${btn} bg-hub-navy text-white hover:bg-hub-ink`;

  const aksi = (
    <>
      <button type="button" onClick={salin} disabled={!terbit} className={btnSalin}>
        <Icon name="copy" className="size-4" />
        Salin ID
      </button>
      <button type="button" onClick={bagikan} className={btnBagikan}>
        <Icon name="arrow" className="size-4" />
        Bagikan profil
      </button>
    </>
  );

  return (
    <>
      <p role="status" className="sr-only">
        {status}
      </p>

      {/* ============================ VERSI MOBILE ============================ */}
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-4 pb-32 pt-8 lg:hidden">
        <Logo />

        <div className="perspective-distant">
          <div
            ref={tilt}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className="hub-tilt transform-3d hub-rise relative overflow-hidden rounded-3xl bg-hub-navy text-white shadow-[0_24px_50px_-22px_rgba(7,25,82,0.7)]"
          >
            <div aria-hidden="true" className="hub-dots absolute inset-0" />
            <div
              aria-hidden="true"
              className="hub-float absolute -right-12 -top-16 size-56 rounded-full bg-white/[0.07]"
            />
            <div
              aria-hidden="true"
              className="hub-float absolute -bottom-20 -left-14 size-60 rounded-full bg-hub-teal/20 [animation-delay:-4s]"
            />
            <div aria-hidden="true" className="hub-sheen pointer-events-none absolute inset-0" />

            <div className="relative flex flex-col items-center px-6 pb-7 pt-8 text-center">
              <Avatar p={p} />
              <div className="hub-pop mt-5" style={idx(1)}>
                <Lencana p={p} />
              </div>
              <h1
                className="hub-pop mt-3 text-balance text-2xl font-bold leading-tight [overflow-wrap:anywhere]"
                style={idx(2)}
              >
                {p.nama}
              </h1>
              {p.prodi && (
                <p className="hub-pop mt-1 text-base text-white/80" style={idx(3)}>
                  {p.prodi}
                </p>
              )}

              <div className="hub-pop mt-6 w-full" style={idx(4)}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  ID alumni
                </p>
                {terbit ? (
                  <div
                    className="mt-2 flex justify-center gap-1.5"
                    role="group"
                    aria-label={`ID alumni ${p.nomor}. Pilih bagian untuk melihat artinya`}
                  >
                    {bagian.map((b, i) => (
                      <button
                        key={b.judul}
                        type="button"
                        onClick={() => setAktif(i)}
                        aria-pressed={aktif === i}
                        aria-label={`${b.nilai}, ${b.judul}`}
                        className={`min-h-12 min-w-11 cursor-pointer rounded-xl px-2.5 font-mono text-xl font-bold tabular-nums tracking-wider transition-all duration-200 ${focusRingLight} ${
                          aktif === i
                            ? "-translate-y-0.5 bg-hub-sand text-hub-ink shadow-lg"
                            : "bg-white/10 text-white hover:bg-white/20 active:bg-white/25"
                        }`}
                      >
                        {b.nilai}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-hub-sand">
                    <Icon name="clock" className="size-5" />
                    Belum terbit
                  </p>
                )}
                {terbit && (
                  <p key={aktif} className="hub-fade mt-3 min-h-10 text-sm text-white/85" aria-live="polite">
                    <span className="font-semibold text-hub-sand">{bagian[aktif]?.judul}: </span>
                    {bagian[aktif]?.arti}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <ul className="grid grid-cols-3 gap-2.5">
          {stat.map((s, i) => (
            <li
              key={s.label}
              className="hub-pop flex flex-col items-center gap-1 rounded-2xl border border-hub-line bg-white px-2 py-3.5 text-center"
              style={idx(i + 5)}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-[#E3F4F1] text-hub-teal-dark">
                <Icon name={s.icon} className="size-5" />
              </span>
              <span className="text-xs text-hub-muted">{s.label}</span>
              <span className="text-balance text-sm font-bold leading-tight [overflow-wrap:anywhere]">
                {s.nilai}
              </span>
            </li>
          ))}
        </ul>

        <section
          aria-labelledby="perjalanan-m"
          className="rounded-2xl border border-hub-line bg-white p-5"
        >
          <h2 id="perjalanan-m" className="mb-4 text-base font-semibold">
            Perjalanan alumni
          </h2>
          <Linimasa p={p} />
        </section>

        <p className="flex items-start gap-2 rounded-2xl bg-white px-4 py-3 text-xs text-hub-muted ring-1 ring-hub-line">
          <Icon name="lock" className="mt-0.5 size-4" />
          Hanya data publik yang ditampilkan. Data pribadi alumni tidak dibuka lewat QR.
        </p>

        {status && (
          <p
            aria-hidden="true"
            className="hub-fade fixed inset-x-0 bottom-24 z-30 mx-auto w-fit max-w-[90vw] rounded-full bg-hub-ink px-4 py-2 text-sm font-medium text-white shadow-lg"
          >
            {status}
          </p>
        )}

        {/* Bar aksi menempel di bawah supaya selalu terjangkau ibu jari. */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-hub-line bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="mx-auto grid max-w-md grid-cols-2 gap-2.5">{aksi}</div>
        </div>
      </div>

      {/* ============================ VERSI DESKTOP ============================ */}
      <div className="hidden min-h-dvh lg:grid lg:grid-cols-[minmax(380px,5fr)_7fr]">
        {/* Panel identitas */}
        <aside
          ref={panel}
          onPointerMove={onPanelMove}
          className="relative flex flex-col justify-between overflow-hidden bg-hub-navy p-10 text-white xl:p-14"
        >
          <div aria-hidden="true" className="hub-dots absolute inset-0" />
          <div aria-hidden="true" className="hub-parallax absolute -right-24 -top-24">
            <div className="hub-float size-96 rounded-full bg-white/[0.06]" />
          </div>
          <div
            aria-hidden="true"
            className="hub-parallax absolute -bottom-32 -left-24"
          >
            <div className="hub-float size-[28rem] rounded-full bg-hub-teal/20 [animation-delay:-5s]" />
          </div>

          <div className="relative">
            <Logo dark />
          </div>

          <div className="relative flex flex-col items-center py-10 text-center">
            <div className="hub-rise">
              <Avatar p={p} besar />
            </div>
            <div className="hub-pop mt-8" style={idx(1)}>
              <Lencana p={p} />
            </div>
            <h1
              className="hub-pop mt-4 max-w-md text-balance text-4xl font-bold leading-tight [overflow-wrap:anywhere] xl:text-5xl"
              style={idx(2)}
            >
              {p.nama}
            </h1>
            {p.prodi && (
              <p className="hub-pop mt-2 text-lg text-white/80" style={idx(3)}>
                {p.prodi}
              </p>
            )}
            {p.tahunLulus && (
              <p
                className="hub-pop mt-5 inline-flex items-center gap-2 rounded-full bg-hub-sand px-4 py-1.5 text-sm font-bold text-hub-ink"
                style={idx(4)}
              >
                <Icon name="calendar" className="size-4" />
                Angkatan lulus {p.tahunLulus}
              </p>
            )}
          </div>

          <p className="relative text-sm text-white/70">
            Profil ini dibuka dari kartu alumni resmi UBL Hub.
          </p>
        </aside>

        {/* Panel detail */}
        <main className="bg-hub-canvas px-10 py-12 text-hub-ink xl:px-16">
          <div className="mx-auto flex max-w-2xl flex-col gap-8">
            <header className="hub-rise">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hub-teal-dark">
                Identitas alumni
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">ID alumni UBL</h2>
              <p className="mt-1 text-sm text-hub-muted">
                Setiap bagian ID punya arti. Arahkan kursor atau pilih bagian untuk menyorotnya.
              </p>
            </header>

            {terbit ? (
              <ul
                className="grid grid-cols-4 gap-3"
                aria-label={`ID alumni ${p.nomor}`}
              >
                {bagian.map((b, i) => (
                  <li key={b.judul} className="hub-pop" style={idx(i + 1)}>
                    <button
                      type="button"
                      onClick={() => setAktif(i)}
                      onMouseEnter={() => setAktif(i)}
                      onFocus={() => setAktif(i)}
                      aria-pressed={aktif === i}
                      aria-label={`${b.nilai}, ${b.judul}: ${b.arti}`}
                      className={`flex h-full w-full cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-left transition-all duration-200 ${focusRing} ${
                        aktif === i
                          ? "-translate-y-1 border-hub-sand bg-hub-navy text-white shadow-xl"
                          : "border-hub-line bg-white hover:-translate-y-0.5 hover:shadow-md"
                      }`}
                    >
                      <span
                        className={`font-mono text-3xl font-bold tabular-nums tracking-wider ${
                          aktif === i ? "text-hub-sand" : "text-hub-navy"
                        }`}
                      >
                        {b.nilai}
                      </span>
                      <span className="text-sm font-semibold">{b.judul}</span>
                      <span
                        className={`text-xs leading-snug [overflow-wrap:anywhere] ${
                          aktif === i ? "text-white/80" : "text-hub-muted"
                        }`}
                      >
                        {b.arti}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="inline-flex items-center gap-2 rounded-2xl border border-hub-line bg-white p-5 text-lg font-semibold text-[#6B4A00]">
                <Icon name="clock" className="size-5" />
                ID alumni belum terbit
              </p>
            )}

            <ul className="grid grid-cols-3 gap-3">
              {stat.map((s, i) => (
                <li
                  key={s.label}
                  className="hub-pop flex items-center gap-3 rounded-2xl border border-hub-line bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-hub-teal hover:shadow-md"
                  style={idx(i + 4)}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E3F4F1] text-hub-teal-dark">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-hub-muted">{s.label}</span>
                    <span className="block text-sm font-bold leading-tight [overflow-wrap:anywhere]">
                      {s.nilai}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <section
              aria-labelledby="perjalanan-d"
              className="rounded-3xl border border-hub-line bg-white p-7"
            >
              <h3 id="perjalanan-d" className="mb-5 text-lg font-semibold">
                Perjalanan alumni
              </h3>
              <Linimasa p={p} />
            </section>

            <div className="flex flex-wrap items-center gap-3">
              {aksi}
              <p
                aria-hidden="true"
                className="min-h-5 text-sm font-medium text-hub-teal-dark"
              >
                {status}
              </p>
            </div>

            <p className="flex items-start gap-2 text-xs text-hub-muted">
              <Icon name="lock" className="mt-0.5 size-4" />
              Hanya data publik yang ditampilkan. Data pribadi alumni tidak dibuka lewat QR.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
