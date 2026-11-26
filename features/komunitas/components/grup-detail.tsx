"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import { Icon } from "@/shared/components/icons";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { panggilKomunitas } from "../lib/client";
import { adalahAdmin, aktif, bisaModerasi, labelOrientasi, type DetailGrup, type Halaman, type Post } from "../lib/types";
import { AnggotaPanel } from "./anggota-panel";
import { tanggal } from "@/features/logbook/client";
import { urlGambarGrup } from "../lib/gambar";
import { LambangGrup, LencanaJenis } from "./kartu-grup";
import { PengaturanPanel } from "./pengaturan-panel";
import { PostFeed } from "./post-feed";

type Tab = "diskusi" | "anggota" | "pengaturan";

const btnUtama = `inline-flex w-full min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-hub-navy shadow-sm transition hover:bg-hub-canvas active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none sm:w-auto ${focusRing} focus-visible:outline-white`;
const btnSekunder = `inline-flex w-full min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${focusRing} focus-visible:outline-white`;

export function GrupDetail({
  grup, posts, nama, idSaya, tabAwal,
}: {
  grup: DetailGrup;
  /** Null bila isi grup terkunci (grup privat dan saya bukan anggota). */
  posts: Halaman<Post> | null;
  nama: string;
  idSaya?: number;
  tabAwal?: string;
}) {
  const router = useRouter();
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [, mulai] = useTransition();
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [deskripsiBuka, setDeskripsiBuka] = useState(false);
  const [konfirmasiKeluar, setKonfirmasiKeluar] = useState(false);

  const moderasi = bisaModerasi(grup.saya);
  const admin = adalahAdmin(grup.saya);
  const tabs: { nilai: Tab; label: string; badge?: number }[] = [
    { nilai: "diskusi", label: "Diskusi" },
    { nilai: "anggota", label: "Anggota", badge: moderasi ? grup.permintaanMenunggu : 0 },
    ...(admin ? [{ nilai: "pengaturan" as const, label: "Pengaturan" }] : []),
  ];
  const [tab, setTab] = useState<Tab>(tabs.some((t) => t.nilai === tabAwal) ? (tabAwal as Tab) : "diskusi");
  const tabAktif = tabs.some((t) => t.nilai === tab) ? tab : "diskusi";

  async function aksi(metode: "POST" | "DELETE") {
    setSibuk(true);
    setGalat(null);
    setInfo(null);
    const awalAksi = grup.aksiGabung;
    try {
      const r = await panggilKomunitas<{ grupDihapus?: boolean }>(metode, `${grup.id}/gabung`);
      // Hasil aksi diumumkan lewat role="status", karena tombolnya berganti setelah halaman dimuat ulang.
      setInfo(
        metode === "POST"
          ? awalAksi === "MINTA" ? "Permintaan terkirim. Admin grup akan meninjaunya." : "Anda sekarang anggota grup ini."
          : awalAksi === "SUDAH_MINTA" ? "Permintaan dibatalkan." : awalAksi === "TERIMA_UNDANGAN" ? "Undangan ditolak." : "Anda telah keluar dari grup.",
      );
      if (r.grupDihapus) {
        router.push("/komunitas");
      }
      setKonfirmasiKeluar(false);
      mulai(() => router.refresh());
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setSibuk(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const next = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i - 1 + tabs.length) % tabs.length : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(tabs[next]!.nilai);
    tabRefs.current[next]?.focus();
  }

  const orientasi = labelOrientasi(grup.orientasi);
  const bisaBaca = !grup.isiTerkunci;

  const tombolGabung = (() => {
    switch (grup.aksiGabung) {
      case "LANGSUNG":
        return (
          <button type="button" disabled={sibuk} onClick={() => aksi("POST")} className={btnUtama}>
            <Icon name="plus" className="size-4" />
            {sibuk ? "Memproses..." : "Gabung"}
          </button>
        );
      case "MINTA":
        return (
          <button type="button" disabled={sibuk} onClick={() => aksi("POST")} className={btnUtama}>
            <Icon name="lock" className="size-4" />
            {sibuk ? "Memproses..." : "Minta bergabung"}
          </button>
        );
      case "SUDAH_MINTA":
        return (
          <button type="button" disabled={sibuk} onClick={() => aksi("DELETE")} className={btnSekunder}>
            <Icon name="clock" className="size-4" />
            Menunggu persetujuan · Batalkan
          </button>
        );
      case "TERIMA_UNDANGAN":
        return (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={sibuk} onClick={() => aksi("POST")} className={btnUtama}>
              Terima undangan
            </button>
            <button type="button" disabled={sibuk} onClick={() => aksi("DELETE")} className={btnSekunder}>
              Tolak
            </button>
          </div>
        );
      default:
        return konfirmasiKeluar ? (
          <div role="group" aria-label="Konfirmasi keluar" className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-white">Keluar dari grup ini?</span>
            <button type="button" disabled={sibuk} onClick={() => aksi("DELETE")} className={`min-h-11 cursor-pointer rounded-lg bg-red-700 px-4 text-sm font-medium text-white disabled:opacity-60 ${focusRing}`}>
              Keluar
            </button>
            <button type="button" onClick={() => setKonfirmasiKeluar(false)} className={`min-h-11 cursor-pointer rounded-lg px-4 text-sm font-medium text-white hover:bg-white/15 ${focusRing} focus-visible:outline-white`}>
              Batal
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setKonfirmasiKeluar(true)} className={btnSekunder}>
            <Icon name="logout" className="size-4" />
            Keluar grup
          </button>
        );
    }
  })();

  const deskripsiPanjang = grup.deskripsi.length > 110 || grup.deskripsi.includes("\n");
  const peranTeks = grup.saya ? (grup.saya.peran === "ADMIN" ? "Admin" : grup.saya.peran === "MODERATOR" ? "Moderator" : "Anggota") : null;

  return (
    <div className="flex flex-col gap-4">
      <header className="hub-rise relative isolate overflow-hidden rounded-2xl border border-hub-line bg-hub-navy text-white shadow-[0_18px_40px_-24px_rgba(7,25,82,0.6)]">
        {/* Latar: banner bila ada; bila tidak, gradasi merek dengan sorot cahaya halus. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          {grup.gambar.banner !== null ? (
            // eslint-disable-next-line @next/next/no-img-element -- banner dari API berotentikasi, sudah dikompres
            <img src={urlGambarGrup(grup.id, "banner", grup.gambar.banner)!} alt="" decoding="async" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-gradient-to-br from-hub-navy via-[#0a3d73] to-hub-teal-dark">
              <div className="size-full bg-[radial-gradient(60%_90%_at_85%_-10%,rgba(255,255,255,0.22),transparent_60%),radial-gradient(40%_60%_at_0%_100%,rgba(38,166,154,0.35),transparent_70%)]" />
            </div>
          )}
          {/* Lapisan gelap dari bawah supaya teks putih terbaca di atas gambar apa pun. */}
          <div className="absolute inset-0 bg-gradient-to-t from-hub-navy via-hub-navy/70 to-hub-navy/25" />
        </div>

        <div className="flex min-h-[17rem] flex-col justify-between gap-8 p-4 sm:min-h-[18rem] sm:p-6">
          <Link
            href="/komunitas"
            className={`inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full bg-white/15 py-1 pl-3 pr-4 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/25 ${focusRing} focus-visible:outline-white`}
          >
            <Icon name="arrow" className="size-4 rotate-180" />
            Grup
            <span className="sr-only"> Semua grup</span>
          </Link>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div className="flex min-w-0 items-end gap-4">
                <LambangGrup nama={grup.nama} id={grup.id} versi={grup.gambar.logo} className="size-16 text-xl shadow-lg ring-2 ring-white/70 sm:size-20 sm:text-2xl" />
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-2xl">{grup.nama}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <LencanaJenis jenis={grup.jenis} gelap />
                    {peranTeks && aktif(grup.saya) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-hub-teal/30 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">
                        <Icon name="check" className="size-3.5" />
                        {peranTeks}
                      </span>
                    )}
                    <span className="text-sm text-white/85">
                      <span className="font-semibold tabular-nums text-white">{grup.jumlahAnggota}</span> anggota
                    </span>
                  </div>
                </div>
              </div>
              <div className="shrink-0">{tombolGabung}</div>
            </div>

            {/* Di layar lebar deskripsi pindah ke panel samping. */}
            <div className="lg:hidden">
              <p className={`whitespace-pre-line text-sm leading-relaxed text-white/90 [overflow-wrap:anywhere] ${deskripsiBuka ? "" : "line-clamp-2"}`}>{grup.deskripsi}</p>
              {deskripsiPanjang && (
                <button
                  type="button"
                  onClick={() => setDeskripsiBuka((v) => !v)}
                  aria-expanded={deskripsiBuka}
                  className={`-my-2 min-h-11 cursor-pointer rounded-lg py-2 text-sm font-medium text-white underline underline-offset-4 hover:no-underline ${focusRing} focus-visible:outline-white`}
                >
                  {deskripsiBuka ? "Lebih sedikit" : "Selengkapnya"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <p role="status" className={info ? "rounded-xl border border-hub-teal-dark/30 bg-hub-teal-dark/5 px-4 py-3 text-sm text-hub-teal-dark" : "sr-only"}>
        {info}
      </p>
      {galat && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {galat}
        </p>
      )}

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-5">
        <div className="flex min-w-0 flex-col gap-4">
      {!bisaBaca ? (
        <section aria-labelledby={`${baseId}-kunci`} className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-hub-line bg-white px-6 py-12 text-center">
          <Icon name="lock" className="size-8 text-hub-muted" />
          <h2 id={`${baseId}-kunci`} className="text-base font-semibold">
            Ini grup privat
          </h2>
          <p className="max-w-sm text-sm text-hub-muted">Postingan dan daftar anggota hanya terlihat oleh anggota. Minta bergabung, dan admin grup akan meninjau permintaan Anda.</p>
        </section>
      ) : (
        <>
          <div role="tablist" aria-label="Isi grup" className={`sticky top-14 z-20 grid rounded-2xl border border-hub-line bg-white shadow-[0_6px_12px_-10px_rgba(15,27,61,0.35)] lg:top-3 ${tabs.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {tabs.map((t, i) => {
              const sel = t.nilai === tabAktif;
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
                  className={`relative min-h-12 cursor-pointer rounded-2xl px-3 text-sm font-medium transition-colors ${focusRing} ${sel ? "font-semibold text-hub-ink" : "text-hub-muted hover:bg-hub-canvas"}`}
                >
                  {t.label}
                  {!!t.badge && " "}
                  {!!t.badge && (
                    <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-hub-sand px-1.5 text-xs font-bold tabular-nums text-hub-ink">
                      {t.badge}
                      <span className="sr-only"> permintaan menunggu</span>
                    </span>
                  )}
                  {sel && <span aria-hidden="true" className="absolute inset-x-1/4 bottom-0 h-1 rounded-full bg-hub-navy" />}
                </button>
              );
            })}
          </div>

          <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${tabAktif}`}>
            {tabAktif === "diskusi" && posts && <PostFeed grupId={grup.id} awal={posts} saya={grup.saya} nama={nama} />}
            {tabAktif === "diskusi" && !posts && (
              <p role="alert" className="rounded-2xl border border-hub-line bg-white p-5 text-sm">
                Postingan belum dapat dimuat. Coba muat ulang halaman.
              </p>
            )}
            {tabAktif === "anggota" && (
              <AnggotaPanel grupId={grup.id} jenis={grup.jenis} saya={grup.saya} idSaya={idSaya} onUbahJumlah={() => mulai(() => router.refresh())} />
            )}
            {tabAktif === "pengaturan" && admin && <PengaturanPanel grup={grup} />}
          </div>
        </>
      )}
        </div>

        <aside aria-labelledby={`${baseId}-tentang`} className="hidden rounded-2xl border border-hub-line bg-white p-5 lg:sticky lg:top-3 lg:block">
          <h2 id={`${baseId}-tentang`} className="text-base font-semibold">
            Tentang grup
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-hub-muted [overflow-wrap:anywhere]">{grup.deskripsi}</p>
          <dl className="mt-4 flex flex-col gap-3 border-t border-hub-line pt-4 text-sm">
            <div className="flex gap-3">
              <Icon name={grup.jenis === "PRIVAT" ? "lock" : "users"} className="mt-0.5 size-4 shrink-0 text-hub-muted" />
              <div>
                <dt className="font-medium">{grup.jenis === "PRIVAT" ? "Privat" : "Publik"}</dt>
                <dd className="text-hub-muted">
                  {grup.jenis === "PRIVAT" ? "Isi hanya untuk anggota. Gabung perlu disetujui admin." : "Semua alumni dapat membaca isinya."}
                </dd>
              </div>
            </div>
            {orientasi && (
              <div className="flex gap-3">
                <Icon name="target" className="mt-0.5 size-4 shrink-0 text-hub-muted" />
                <div>
                  <dt className="font-medium">Orientasi karier</dt>
                  <dd className="text-hub-muted">{orientasi}</dd>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Icon name="calendar" className="mt-0.5 size-4 shrink-0 text-hub-muted" />
              <div>
                <dt className="font-medium">Dibuat</dt>
                <dd className="text-hub-muted">
                  <time dateTime={grup.dibuat}>{tanggal(grup.dibuat)}</time>
                </dd>
              </div>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
