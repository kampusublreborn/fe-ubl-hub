"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { LogbookItem, type Halaman } from "@/features/logbook/client";
import type { Logbook } from "@/features/logbook/lib/types";
import { LambangGrup } from "@/features/komunitas/components/kartu-grup";
import { Avatar } from "@/shared/components/avatar";
import { Icon, type IconName } from "@/shared/components/icons";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";

export type GrupAlumni = { id: number; nama: string; jenis: "PUBLIK" | "PRIVAT"; peran: "ADMIN" | "MODERATOR" | "ANGGOTA"; jumlahAnggota: number; bersama: boolean };
export type DataTab = {
  id: number;
  nama: string;
  milikSaya: boolean;
  jumlahLogbook: number;
  jumlahPost: number;
  prodi: string | null;
  tahunLulus: number | null;
  periodeWisuda: "GANJIL" | "GENAP" | null;
  nomor: string | null;
  samaProdi: boolean;
  samaAngkatan: boolean;
  grup: GrupAlumni[];
  penghargaan: { jenis: string; periode: string }[];
};

const TABS = [
  { nilai: "beranda", label: "Beranda" },
  { nilai: "tentang", label: "Tentang" },
  { nilai: "grup", label: "Grup" },
] as const;
type Tab = (typeof TABS)[number]["nilai"];

const peranTeks = { ADMIN: "Admin", MODERATOR: "Moderator", ANGGOTA: "Anggota" } as const;
const kotak = "rounded-2xl border border-hub-line bg-white p-4 shadow-sm sm:p-5";

function LogbookAlumni({ id }: { id: number }) {
  const [daftar, setDaftar] = useState<Logbook[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  async function muat(dari: number | null) {
    setMemuat(true);
    setGalat(null);
    try {
      const q = new URLSearchParams({ limit: "10", penulis: String(id) });
      if (dari) q.set("cursor", String(dari));
      const r = await panggilApi<Halaman<Logbook>>("logbook", "GET", `?${q}`);
      setDaftar((d) => (dari ? [...d, ...r.data] : r.data));
      setCursor(r.cursorBerikutnya);
    } catch (e) {
      setGalat(pesanGalat(e, "Logbook belum dapat dimuat."));
    } finally {
      setMemuat(false);
    }
  }
  useEffect(() => {
    void muat(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hanya saat pindah profil
  }, [id]);

  return (
    <div className="flex flex-col gap-4">
      {galat && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{galat}</p>}
      {!memuat && !galat && daftar.length === 0 && <p className={`${kotak} text-center text-sm text-hub-muted`}>Belum ada logbook yang dibagikan.</p>}
      {daftar.map((l) => (
        <LogbookItem key={l.id} awal={l} onHapus={(x) => setDaftar((d) => d.filter((i) => i.id !== x))} />
      ))}
      {memuat && <div role="status" aria-label="Memuat logbook" className="h-40 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}
      {cursor && !memuat && (
        <button type="button" onClick={() => muat(cursor)} className={`min-h-12 self-center rounded-xl border border-hub-line bg-white px-6 text-sm font-medium hover:bg-hub-canvas ${focusRing}`}>
          Muat lebih banyak
        </button>
      )}
    </div>
  );
}

function GrupAlumniDaftar({ grup }: { grup: GrupAlumni[] }) {
  if (grup.length === 0) return <p className={`${kotak} text-center text-sm text-hub-muted`}>Belum bergabung di grup yang bisa dilihat.</p>;
  return (
    <section aria-labelledby="semua-grup" className={kotak}>
      <h2 id="semua-grup" className="text-xl font-bold">Grup <span className="text-base font-normal text-hub-muted">· {grup.length}</span></h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {grup.map((g) => (
          <li key={g.id}>
            <Link href={`/komunitas/${g.id}`} className={`flex h-full items-center gap-3 rounded-xl border border-hub-line p-3 hover:bg-hub-canvas ${focusRing}`}>
              <LambangGrup nama={g.nama} className="size-16 text-xl" />
              <span className="min-w-0">
                <span className="block font-semibold [overflow-wrap:anywhere]">{g.nama}</span>
                <span className="block text-sm text-hub-muted">
                  {peranTeks[g.peran]} · {g.jumlahAnggota} anggota{g.jenis === "PRIVAT" ? " · Privat" : ""}
                </span>
                {g.bersama && <span className="mt-1 inline-block rounded-full bg-hub-teal-dark/10 px-2 py-0.5 text-xs font-semibold text-hub-teal-dark">Grup bersama</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const periodeTeks = (p: DataTab["periodeWisuda"]) => (p === "GANJIL" ? "Wisuda semester ganjil" : p === "GENAP" ? "Wisuda semester genap" : null);

function Baris({ ikon, children }: { ikon: IconName; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[0.95rem]">
      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-hub-canvas text-hub-muted">
        <Icon name={ikon} className="size-[1.1rem]" />
      </span>
      <span className="min-w-0 pt-1 [overflow-wrap:anywhere]">{children}</span>
    </li>
  );
}

function Intro({ d }: { d: DataTab }) {
  const bersama = d.grup.filter((g) => g.bersama).length;
  const kesamaan = [d.samaProdi && "Satu prodi dengan Anda", d.samaAngkatan && "Seangkatan dengan Anda", bersama > 0 && `${bersama} grup bersama`].filter(Boolean) as string[];
  const wisuda = periodeTeks(d.periodeWisuda);
  return (
    <section aria-labelledby="intro" className={kotak}>
      <h2 id="intro" className="text-xl font-bold">Intro</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {d.prodi && <Baris ikon="book">Program studi <b>{d.prodi}</b></Baris>}
        {d.tahunLulus && <Baris ikon="calendar">Lulus tahun <b>{d.tahunLulus}</b></Baris>}
        {wisuda && <Baris ikon="star">{wisuda}</Baris>}
        {d.nomor && <Baris ikon="idcard">Alumni <b className="tabular-nums">{d.nomor}</b></Baris>}
        <Baris ikon="users">Anggota <b>{d.grup.length}</b> grup</Baris>
        {d.penghargaan.length > 0 && <Baris ikon="award"><b>{d.penghargaan.length}</b> penghargaan</Baris>}
      </ul>
      {kesamaan.length > 0 && (
        <ul aria-label="Kesamaan dengan Anda" className="mt-4 flex flex-wrap gap-2 border-t border-hub-line pt-4">
          {kesamaan.map((k) => (
            <li key={k} className="inline-flex items-center gap-1.5 rounded-full bg-hub-teal-dark/10 px-3 py-1.5 text-xs font-semibold text-hub-teal-dark">
              <Icon name="check" className="size-3.5" />
              {k}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function GrupRingkas({ grup, buka }: { grup: GrupAlumni[]; buka: () => void }) {
  if (grup.length === 0) return null;
  return (
    <section aria-labelledby="grup-ringkas" className={kotak}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="grup-ringkas" className="text-xl font-bold">Grup</h2>
        <button type="button" onClick={buka} className={`min-h-11 rounded-lg px-2 text-sm font-medium text-hub-teal-dark hover:underline ${focusRing}`}>Lihat semua</button>
      </div>
      <p className="-mt-1 text-sm text-hub-muted">{grup.length} grup</p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {grup.slice(0, 6).map((g) => (
          <li key={g.id}>
            <Link href={`/komunitas/${g.id}`} className={`flex flex-col gap-1.5 rounded-xl p-1 hover:bg-hub-canvas ${focusRing}`}>
              <LambangGrup nama={g.nama} className="aspect-square w-full text-xl" />
              <span className="line-clamp-2 text-xs font-medium [overflow-wrap:anywhere]">{g.nama}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Tentang({ d }: { d: DataTab }) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Intro d={d} />
      <section aria-labelledby="penghargaan" className={kotak}>
        <h2 id="penghargaan" className="text-xl font-bold">Penghargaan</h2>
        {d.penghargaan.length === 0 ? (
          <p className="mt-2 text-sm text-hub-muted">Belum ada penghargaan.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {d.penghargaan.map((p) => (
              <Baris key={`${p.jenis}${p.periode}`} ikon="award"><b>{p.jenis}</b> <span className="text-hub-muted">· {p.periode}</span></Baris>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function ProfilAlumniTabs({ data }: { data: DataTab }) {
  const [tab, setTab] = useState<Tab>("beranda");
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const info = [data.prodi, data.tahunLulus ? `Lulus ${data.tahunLulus}` : null].filter(Boolean).join(" · ");

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const n = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length : -1;
    if (n < 0) return;
    e.preventDefault();
    setTab(TABS[n]!.nilai);
    refs.current[n]?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="overflow-hidden rounded-2xl border border-hub-line bg-white shadow-sm">
        <div aria-hidden="true" className="h-40 bg-[radial-gradient(circle_at_85%_20%,rgba(38,166,154,0.55),transparent_55%),linear-gradient(135deg,#071952,#0b6b63)] sm:h-60" />
        <div className="px-4 pb-1 sm:px-8">
          <div className="-mt-14 flex flex-col gap-3 sm:-mt-10 sm:flex-row sm:items-end sm:gap-5">
            <Avatar nama={data.nama} className="size-28 shrink-0 text-4xl ring-4 ring-white sm:size-40 sm:text-6xl sm:ring-[5px]" />
            <div className="min-w-0 flex-1 sm:pb-3">
              <h1 className="text-2xl font-bold leading-tight [overflow-wrap:anywhere] sm:text-3xl">{data.nama}</h1>
              {info && <p className="mt-0.5 text-sm text-hub-muted">{info}</p>}
              <p className="mt-0.5 text-sm text-hub-muted">
                <span className="tabular-nums">{data.jumlahLogbook}</span> logbook · <span className="tabular-nums">{data.grup.length}</span> grup · <span className="tabular-nums">{data.jumlahPost}</span> postingan grup
              </p>
            </div>
            {data.milikSaya && (
              <Link href="/profil" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-hub-canvas px-4 text-sm font-semibold hover:bg-hub-line/60 sm:mb-3 ${focusRing}`}>
                <Icon name="user" className="size-4" />
                Profil saya
              </Link>
            )}
          </div>
          <div role="tablist" aria-label="Isi profil" className="mt-4 flex gap-1 border-t border-hub-line py-1">
            {TABS.map((t, i) => {
              const sel = t.nilai === tab;
              return (
                <button
                  key={t.nilai}
                  ref={(el) => { refs.current[i] = el; }}
                  role="tab"
                  type="button"
                  id={`${baseId}-${t.nilai}`}
                  aria-selected={sel}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={sel ? 0 : -1}
                  onClick={() => setTab(t.nilai)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`relative min-h-12 cursor-pointer rounded-lg px-4 text-[0.95rem] font-semibold transition-colors motion-reduce:transition-none ${focusRing} ${sel ? "text-hub-teal-dark" : "text-hub-muted hover:bg-hub-canvas"}`}
                >
                  {t.label}
                  {sel && <span aria-hidden="true" className="absolute inset-x-2 -bottom-1 h-[3px] rounded-full bg-hub-teal-dark" />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-${tab}`} className="hub-fade">
        {tab === "beranda" && (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <div className="flex flex-col gap-4 lg:sticky lg:top-20">
              <Intro d={data} />
              <GrupRingkas grup={data.grup} buka={() => setTab("grup")} />
            </div>
            <div>
              <h2 className="sr-only">Logbook {data.nama}</h2>
              <LogbookAlumni id={data.id} />
            </div>
          </div>
        )}
        {tab === "tentang" && <Tentang d={data} />}
        {tab === "grup" && <GrupAlumniDaftar grup={data.grup} />}
      </div>
    </div>
  );
}
