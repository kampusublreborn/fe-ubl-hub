"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { labelNilai, panggil, ratakan, teksButir } from "../lib/helpers";
import type {
  AturanButir,
  Butir,
  Instrumen,
  Jawaban,
  OpsiMaster,
  RangeOpsi,
  Respons,
  StatusRespons,
} from "../lib/types";
import { Lencana } from "./field";

type Props = {
  status: StatusRespons;
  dikirimAt: string | null;
  instrumen: Instrumen;
  jawaban: Record<string, Jawaban>;
  aturan: Record<string, AturanButir>;
  range: Record<string, RangeOpsi[]>;
  identitas: Respons["identitas"];
};

const TAHAP: { status: StatusRespons[]; label: string }[] = [
  { status: ["DIKIRIM", "DIVERIFIKASI", "DILAPORKAN"], label: "Terkirim" },
  { status: ["DIVERIFIKASI", "DILAPORKAN"], label: "Diverifikasi" },
  { status: ["DILAPORKAN"], label: "Dilaporkan" },
];

const tanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

/** Ringkasan jawaban setelah tracer terkirim: status, angka kunci, kompetensi, dan seluruh jawaban. */
export function RingkasanTerkirim({ status, dikirimAt, instrumen, jawaban, aturan, range, identitas }: Props) {
  const semua = useMemo(() => ratakan(instrumen.butir), [instrumen.butir]);
  const daun = useMemo(() => semua.filter((b) => b.tipe !== "BAGIAN"), [semua]);
  const nilai = useMemo(() => Object.fromEntries(Object.entries(jawaban).map(([k, v]) => [k, v.nilai])), [jawaban]);
  const [nama, setNama] = useState<Record<string, string>>({});
  const [masterSiap, setMasterSiap] = useState(false);

  // Nama untuk pilihan master (provinsi, kabupaten, profesi, industri). Kode mentah tidak enak dibaca.
  useEffect(() => {
    let batal = false;
    const perlu = new Set<string>();
    for (const b of daun) {
      const v = jawaban[b.kode]?.nilai;
      if (b.tipe !== "MASTER" || typeof v !== "string") continue;
      if (b.master === "kabupaten") {
        const induk = jawaban[b.bergantung_pada ?? ""]?.nilai;
        if (typeof induk === "string") perlu.add(`kabupaten?provinsi=${encodeURIComponent(induk)}`);
      } else if (b.master === "provinsi" || b.master === "profesi" || b.master === "industri") {
        perlu.add(b.master);
      }
    }
    // Selama belum selesai, nilai master tampil "…" supaya tidak berkedip dari kode mentah ke nama.
    Promise.all(
      [...perlu].map((path) => {
        const jenis = path.split("?")[0];
        return panggil<OpsiMaster[]>("GET", `master/${path}`)
          .then((daftar) => {
            if (batal) return;
            setNama((s) => ({ ...s, ...Object.fromEntries(daftar.map((o) => [`${jenis}:${o.kode}`, o.nama])) }));
          })
          .catch(() => {});
      }),
    ).then(() => !batal && setMasterSiap(true));
    return () => {
      batal = true;
    };
  }, [daun, jawaban]);

  const teksNilai = (b: Butir): string => {
    const v = jawaban[b.kode]?.nilai;
    if (v === undefined || v === null) return "-";
    if (b.tipe === "MASTER" && typeof v === "string") {
      if (v === "LAINNYA") return "Lain-lain";
      const dikenal = b.master === "provinsi" || b.master === "kabupaten" || b.master === "profesi" || b.master === "industri";
      return nama[`${b.master}:${v}`] ?? (dikenal && !masterSiap ? "…" : v);
    }
    if (b.tipe === "TANGGAL" && typeof v === "string") return tanggal(v);
    if (b.tipe === "RANGE" && b.range_jenis && range[b.range_jenis] === undefined) return "…";
    return labelNilai(b, v, b.range_jenis ? range[b.range_jenis] : []);
  };

  const cari = (kode: string) => daun.find((b) => b.kode === kode);
  const ada = (kode: string) => jawaban[kode] !== undefined && aturan[kode]?.tampil !== false;

  // Angka kunci
  const masaTunggu = jawaban["F502"]?.nilai;
  const fakta: { label: string; nilai: string; sub?: string }[] = [];
  if (ada("F8") && cari("F8")) fakta.push({ label: "Status", nilai: teksNilai(cari("F8")!) });
  if (typeof masaTunggu === "number" && ada("F502")) {
    fakta.push(
      masaTunggu <= 0
        ? { label: "Masa tunggu", nilai: "Langsung bekerja" }
        : { label: "Masa tunggu", nilai: String(masaTunggu), sub: "bulan" },
    );
  }
  if (ada("F505") && cari("F505")) fakta.push({ label: "Penghasilan", nilai: teksNilai(cari("F505")!) });
  if (ada("UBL-ORIENTASI") && cari("UBL-ORIENTASI")) fakta.push({ label: "Orientasi", nilai: teksNilai(cari("UBL-ORIENTASI")!) });

  const kompA = instrumen.butir.find((b) => b.kode === "F17A");
  const kompB = instrumen.butir.find((b) => b.kode === "F17B");
  const punyaKompetensi = (kompA?.anak ?? []).some(
    (l, i) => typeof jawaban[l.kode]?.nilai === "number" || typeof jawaban[kompB?.anak?.[i]?.kode ?? ""]?.nilai === "number",
  );

  const posisiTahap = TAHAP.reduce((n, t, i) => (t.status.includes(status) ? i : n), 0);

  return (
    <div className="flex w-full flex-col gap-6 pb-8">
      <Hero nama={identitas.nama} npm={identitas.npm} tanggal={dikirimAt ? tanggal(dikirimAt) : null} posisi={posisiTahap} />

      {fakta.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Angka kunci">
          {fakta.map((f, i) => (
            <li
              key={f.label}
              style={{ "--i": i + 2 } as React.CSSProperties}
              className="hub-rise flex min-h-24 flex-col justify-between rounded-2xl border border-hub-line bg-white p-4"
            >
              <span className="text-xs font-medium text-hub-muted">{f.label}</span>
              <span className="mt-2 flex items-baseline gap-1.5">
                <span className={`font-semibold leading-tight text-hub-navy ${f.sub ? "text-3xl tabular-nums" : "text-sm"}`}>
                  {f.nilai}
                </span>
                {f.sub && <span className="text-sm text-hub-muted">{f.sub}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {punyaKompetensi && <Kompetensi instrumen={instrumen} jawaban={jawaban} />}

      <SemuaJawaban
        instrumen={instrumen}
        daun={daun}
        jawaban={jawaban}
        aturan={aturan}
        nilai={nilai}
        teksNilai={teksNilai}
      />

      <Link
        href="/"
        className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-hub-line bg-white px-6 font-semibold hover:bg-hub-canvas ${focusRing}`}
      >
        Ke beranda
      </Link>
    </div>
  );
}

function Hero({ nama, npm, tanggal, posisi }: { nama: string; npm: string; tanggal: string | null; posisi: number }) {
  return (
    <section aria-labelledby="judul-terkirim" className="hub-rise overflow-hidden rounded-3xl bg-hub-navy p-6 text-white sm:p-8">
      <div className="flex items-center gap-4">
        <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-hub-sand text-hub-ink">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-hub-sand/40 motion-safe:animate-[hub-ping_1.6s_ease-out_1]"
          />
          <Icon name="check" className="relative size-7" />
        </span>
        <div className="min-w-0">
          <h2 id="judul-terkirim" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Tracer study terkirim
          </h2>
          <p className="mt-1 truncate text-sm text-white/70">
            {nama} · {npm}
            {tanggal ? ` · ${tanggal}` : ""}
          </p>
        </div>
      </div>

      <ol className="mt-7 grid grid-cols-3 gap-2" aria-label="Tahap tracer study">
        {TAHAP.map((t, i) => {
          const selesai = i < posisi;
          const sekarang = i === posisi;
          return (
            <li key={t.label} aria-current={sekarang ? "step" : undefined} className="flex flex-col gap-2">
              <span
                className={`h-1.5 rounded-full ${selesai || sekarang ? "bg-hub-sand" : "bg-white/20"} ${
                  sekarang ? "hub-seg" : ""
                }`}
              />
              <span className={`flex items-center gap-1.5 text-xs font-medium ${selesai || sekarang ? "text-white" : "text-white/50"}`}>
                {selesai ? (
                  <Icon name="check" className="size-3.5" />
                ) : (
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${sekarang ? "bg-hub-sand" : "bg-white/30"}`}
                  />
                )}
                {t.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Kompetensi saat lulus dibanding kebutuhan pekerjaan. Selisih positif berarti perlu diperkuat. */
function Kompetensi({ instrumen, jawaban }: { instrumen: Instrumen; jawaban: Record<string, Jawaban> }) {
  const a = instrumen.butir.find((b) => b.kode === "F17A");
  const b = instrumen.butir.find((x) => x.kode === "F17B");
  const [urut, setUrut] = useState<"asli" | "selisih">("asli");
  const [lulus, setLulus] = useState(true);
  const [butuh, setButuh] = useState(true);
  const idUrut = useId();

  const baris = useMemo(() => {
    const daftar = (a?.anak ?? []).map((l, i) => {
      const n = b?.anak?.[i];
      const v1 = jawaban[l.kode]?.nilai;
      const v2 = n ? jawaban[n.kode]?.nilai : undefined;
      const x = typeof v1 === "number" ? v1 : null;
      const y = typeof v2 === "number" ? v2 : null;
      return { nama: l.teks, lulus: x, butuh: y, selisih: x !== null && y !== null ? y - x : 0 };
    });
    return urut === "selisih" ? daftar.slice().sort((p, q) => q.selisih - p.selisih) : daftar;
  }, [a, b, jawaban, urut]);

  if (!a || !baris.some((r) => r.lulus !== null || r.butuh !== null)) return null;
  const perlu = baris.filter((r) => r.selisih >= 1).sort((p, q) => q.selisih - p.selisih);

  const seri = (aktif: boolean, set: (v: boolean) => void, tunggal: boolean, warna: string, label: string) => (
    <button
      type="button"
      aria-pressed={aktif}
      onClick={() => (aktif && tunggal ? undefined : set(!aktif))}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${focusRing} ${
        aktif ? "border-hub-navy/30 bg-white" : "border-hub-line text-hub-muted"
      }`}
    >
      <span aria-hidden="true" className={`size-3 rounded-full ${warna} ${aktif ? "" : "opacity-30"}`} />
      {label}
    </button>
  );

  return (
    <section aria-labelledby="judul-kompetensi" className="hub-rise rounded-3xl border border-hub-line bg-white p-5 sm:p-6" style={{ "--i": 4 } as React.CSSProperties}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="judul-kompetensi" className="text-lg font-semibold">
          Kompetensi
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Seri yang ditampilkan">
            {seri(lulus, setLulus, !butuh, "bg-hub-teal", "Saat lulus")}
            {seri(butuh, setButuh, !lulus, "bg-hub-navy", "Dibutuhkan")}
          </div>
          <label htmlFor={idUrut} className="sr-only">
            Urutkan
          </label>
          <select
            id={idUrut}
            value={urut}
            onChange={(e) => setUrut(e.target.value as "asli" | "selisih")}
            className={`min-h-11 rounded-full border border-hub-line bg-white px-4 text-sm font-medium ${focusRing}`}
          >
            <option value="asli">Sesuai daftar</option>
            <option value="selisih">Selisih terbesar</option>
          </select>
        </div>
      </div>

      {perlu.length > 0 && (
        <p className={`mt-4 flex flex-wrap items-center gap-2 text-sm ${baris.length % 2 === 1 ? "lg:hidden" : ""}`}>
          <span className="text-hub-muted">Perlu diperkuat</span>
          {perlu.slice(0, 3).map((r) => (
            <span key={r.nama} className="rounded-full bg-[#FFF1CC] px-3 py-1 text-xs font-semibold text-[#6B4A00]">
              {r.nama}
            </span>
          ))}
        </p>
      )}

      <ul className="mt-5 grid grid-cols-1 gap-x-12 gap-y-5 lg:grid-cols-2">
        {baris.map((r, i) => (
          <li key={r.nama}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{r.nama}</span>
              {r.selisih >= 1 && (
                <span
                  aria-label={`Kebutuhan ${r.selisih} tingkat di atas kemampuan saat lulus`}
                  className="rounded-full bg-[#FFF1CC] px-2 py-0.5 text-xs font-semibold text-[#6B4A00]"
                >
                  +{r.selisih}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {lulus && <Batang nilai={r.lulus} warna="bg-hub-teal" label="Saat lulus" i={i} />}
              {butuh && <Batang nilai={r.butuh} warna="bg-hub-navy" label="Dibutuhkan" i={i} />}
            </div>
          </li>
        ))}
        {baris.length % 2 === 1 && (
          <li className="hidden flex-col justify-center gap-3 rounded-2xl bg-hub-canvas p-5 lg:flex">
            <span className="text-sm font-semibold">Perlu diperkuat</span>
            {perlu.length > 0 ? (
              <span className="flex flex-wrap gap-2">
                {perlu.slice(0, 4).map((r) => (
                  <span key={r.nama} className="rounded-full bg-[#FFF1CC] px-3 py-1 text-xs font-semibold text-[#6B4A00]">
                    {r.nama} +{r.selisih}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-sm text-hub-muted">Tidak ada</span>
            )}
          </li>
        )}
      </ul>
    </section>
  );
}

function Batang({ nilai, warna, label, i }: { nilai: number | null; warna: string; label: string; i: number }) {
  return (
    <div className="flex items-center gap-3" role="img" aria-label={`${label}: ${nilai ?? "belum diisi"} dari 5`}>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-hub-canvas">
        {nilai !== null && (
          <div
            className={`hub-seg h-full rounded-full ${warna}`}
            style={{ width: `${(nilai / 5) * 100}%`, "--i": i } as React.CSSProperties}
          />
        )}
      </div>
      <span className="w-4 text-right text-sm font-semibold tabular-nums">{nilai ?? "-"}</span>
    </div>
  );
}

/** Semua jawaban per langkah. Bisa dicari, dibuka, dan ditutup. */
function SemuaJawaban({
  instrumen,
  daun,
  jawaban,
  aturan,
  nilai,
  teksNilai,
}: {
  instrumen: Instrumen;
  daun: Butir[];
  jawaban: Record<string, Jawaban>;
  aturan: Record<string, AturanButir>;
  nilai: Record<string, unknown>;
  teksNilai: (b: Butir) => string;
}) {
  const langkah = useMemo(() => (instrumen.langkah ?? []).slice().sort((x, y) => x.nomor - y.nomor), [instrumen.langkah]);
  const idCari = useId();
  const [q, setQ] = useState("");
  // Semua bagian tertutup saat pertama dibuka supaya tampilan awal rapi.
  const [buka, setBuka] = useState<Record<number, boolean>>({});

  // Kompetensi sudah ada di grafik di atas.
  const kodeKompetensi = useMemo(() => {
    const kode = new Set<string>();
    for (const k of ["F17A", "F17B"]) instrumen.butir.find((b) => b.kode === k)?.anak?.forEach((x) => kode.add(x.kode));
    return kode;
  }, [instrumen.butir]);

  const kata = q.trim().toLowerCase();
  const kelompok = langkah
    .map((l) => {
      const baris = daun
        .filter((b) => b.langkah === l.nomor && jawaban[b.kode] && aturan[b.kode]?.tampil !== false && !kodeKompetensi.has(b.kode))
        .map((b) => ({ b, teks: teksButir(b, nilai), nilai: teksNilai(b) }))
        .filter((r) => !kata || `${r.teks} ${r.nilai}`.toLowerCase().includes(kata));
      return { l, baris };
    })
    .filter((k) => k.baris.length > 0);

  const total = kelompok.reduce((n, k) => n + k.baris.length, 0);
  const semuaTerbuka = kelompok.length > 0 && kelompok.every((k) => kata || buka[k.l.nomor]);

  return (
    <section aria-labelledby="judul-jawaban" className="hub-rise flex flex-col gap-4" style={{ "--i": 5 } as React.CSSProperties}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="judul-jawaban" className="text-lg font-semibold">
          Jawaban Anda
        </h3>
        {!kata && (
          <button
            type="button"
            onClick={() => setBuka(semuaTerbuka ? {} : Object.fromEntries(langkah.map((l) => [l.nomor, true])))}
            className={`min-h-11 rounded-lg px-3 text-sm font-medium text-hub-teal-dark hover:underline ${focusRing}`}
          >
            {semuaTerbuka ? "Tutup semua" : "Buka semua"}
          </button>
        )}
      </div>

      <div>
        <label htmlFor={idCari} className="sr-only">
          Cari jawaban
        </label>
        <input
          id={idCari}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari jawaban"
          className={`min-h-12 w-full rounded-xl border border-hub-line bg-white px-4 text-base ${focusRing}`}
        />
        <p role="status" aria-live="polite" className="mt-1.5 min-h-5 text-xs text-hub-muted">
          {kata ? `${total} hasil` : ""}
        </p>
      </div>

      {kelompok.length === 0 && kata ? (
        <p className="rounded-2xl border border-dashed border-hub-line p-6 text-center text-sm text-hub-muted">Tidak ada yang cocok.</p>
      ) : (
        <div className="lg:columns-2 lg:gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">{kelompok.map(({ l, baris }) => {
          const terbuka = !!kata || !!buka[l.nomor];
          const idPanel = `panel-${l.nomor}`;
          return (
            <div key={l.nomor} className="overflow-hidden rounded-2xl border border-hub-line bg-white">
              <h4>
                <button
                  type="button"
                  aria-expanded={terbuka}
                  aria-controls={idPanel}
                  onClick={() => !kata && setBuka((s) => ({ ...s, [l.nomor]: !s[l.nomor] }))}
                  className={`flex min-h-14 w-full items-center gap-3 px-4 text-left hover:bg-hub-canvas ${focusRing}`}
                >
                  <span className="flex-1 font-semibold">{l.judul}</span>
                  <span className="rounded-full bg-hub-canvas px-2.5 py-0.5 text-xs font-medium text-hub-muted">{baris.length}</span>
                  <Icon
                    name="chevron"
                    className={`size-5 shrink-0 text-hub-muted transition-transform duration-200 motion-reduce:transition-none ${terbuka ? "rotate-180" : ""}`}
                  />
                </button>
              </h4>
              {terbuka && (
                <dl id={idPanel} className="hub-fade divide-y divide-hub-line border-t border-hub-line">
                  {baris.map(({ b, teks, nilai: teksJawab }) => (
                    <div key={b.kode} className="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <dt className="text-sm text-hub-muted sm:max-w-[45%]">{teks}</dt>
                      <dd className="flex flex-wrap items-center gap-2 text-sm font-medium sm:justify-end sm:text-right">
                        {b.tipe === "SKALA" ? <Titik nilai={jawaban[b.kode]?.nilai} maks={b.max ?? 5} /> : <span className="break-words">{teksJawab}</span>}
                        <Lencana jawaban={jawaban[b.kode]} />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          );
        })}</div>
      )}
    </section>
  );
}

function Titik({ nilai, maks }: { nilai: unknown; maks: number }) {
  const n = typeof nilai === "number" ? nilai : 0;
  return (
    <span role="img" aria-label={`${n} dari ${maks}`} className="inline-flex items-center gap-1">
      {Array.from({ length: maks }, (_, i) => (
        <span key={i} aria-hidden="true" className={`size-2.5 rounded-full ${i < n ? "bg-hub-navy" : "bg-hub-line"}`} />
      ))}
    </span>
  );
}
