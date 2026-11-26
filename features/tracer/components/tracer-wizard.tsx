"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { labelNilai, panggil, ratakan, teksButir } from "../lib/helpers";
import type { AturanButir, Butir, Jawaban, RangeOpsi, Respons, StatusRespons } from "../lib/types";
import { gabungkanJawaban, type JawabanTertunda } from "../lib/pending";
import { Field, Lencana, Skala } from "./field";
import { RingkasanTerkirim } from "./ringkasan-terkirim";

type Peta = Record<string, Jawaban>;

/** Nama bagian wajib Dikti yang menyusul, untuk daftar "tinggal N bagian lagi". */
const NAMA_BAGIAN: Record<string, string> = { F17A: "Penilaian kompetensi", F2: "Metode pembelajaran" };

/** Kelompok pertanyaan di langkah inti, berdasarkan kode butir induk. */
const GRUP_PERTANYAAN: Record<string, string> = {
  F5C: "kerja", F1101: "kerja", F5D: "kerja", F510: "kerja",
  "UBL-PERTAMA": "awal", "UBL-MULAI": "awal", F502: "awal", F505: "awal",
  F14: "sesuai", F15: "sesuai", F16: "sesuai",
};
const JUDUL_GRUP: Record<string, string> = {
  kerja: "Tempat Anda bekerja",
  awal: "Awal bekerja dan penghasilan",
  sesuai: "Kesesuaian dengan studi",
};

const KODE_ARAH = [
  "UBL-ORIENTASI",
  "UBL-ORIENTASI_LAIN",
  "UBL-PROFESI",
  "UBL-PROFESI_LAIN",
  "UBL-INDUSTRI",
  "UBL-INDUSTRI_LAIN",
];

const daftarPeta = (j: Jawaban[]): Peta => Object.fromEntries(j.map((x) => [x.kode, x]));
const pesan = (e: unknown) => (e instanceof Error ? e.message : "Terjadi kesalahan");

type Kekurangan = { belumDiisi?: string[]; belumDikonfirmasi?: string[]; izinKurang?: string[] };

/**
 * Tracer mode Ringkas (rancangan "Rumah Alumni UBL"): Cek cepat dikonfirmasi dengan satu ketukan,
 * lalu pertanyaan inti. Bagian inti boleh dikirim lebih dulu, sisanya (penilaian dan pencarian kerja)
 * menyusul. Jawaban tersimpan otomatis.
 */
export function TracerWizard({
  awal,
  catatanRevisi,
  dikirimAwal = null,
}: {
  awal: Respons;
  catatanRevisi: string | null;
  dikirimAwal?: string | null;
}) {
  const { instrumen } = awal;
  const [jawaban, setJawaban] = useState<Peta>(() => daftarPeta(awal.jawaban));
  const [aturan, setAturan] = useState<Record<string, AturanButir>>(awal.aturan);
  const [status, setStatus] = useState<StatusRespons>(awal.status);
  const [intiDikirim, setIntiDikirim] = useState<string | null>(awal.inti.dikirimAt);
  const [dikirimAt, setDikirimAt] = useState<string | null>(dikirimAwal);
  const [arah, setArah] = useState(awal.arah);
  const [layarInti, setLayarInti] = useState(false);
  const [setuju, setSetuju] = useState(awal.izin.some((i) => i.jenis === "DATA_AGREGAT" && i.diberikan));
  const [range, setRange] = useState<Record<string, RangeOpsi[]>>({});
  const [ubah, setUbah] = useState<Record<string, boolean>>({});
  const [galat, setGalat] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(0);
  const [mengirim, setMengirim] = useState(false);
  const [pernahSimpan, setPernahSimpan] = useState(false);
  const [gagalSimpan, setGagalSimpan] = useState<Record<string, unknown>>({});
  const gagalRef = useRef<Record<string, unknown>>({});
  const [masalah, setMasalah] = useState<string[]>([]);
  const ringkasan = useRef<HTMLDivElement>(null);
  const antrean = useRef<Promise<unknown>>(Promise.resolve());
  const tertunda = useRef<JawabanTertunda>({});
  const urutan = useRef(0);

  const langkah = useMemo(() => (instrumen.langkah ?? []).slice().sort((a, b) => a.nomor - b.nomor), [instrumen.langkah]);
  const inti = useMemo(() => new Set(awal.inti.langkah), [awal.inti.langkah]);
  const semuaButir = useMemo(() => ratakan(instrumen.butir), [instrumen.butir]);
  const nilai = useMemo(() => Object.fromEntries(Object.entries(jawaban).map(([k, v]) => [k, v.nilai])), [jawaban]);

  const topLangkah = (n: number) => instrumen.butir.filter((b) => b.langkah === n);
  /** Butir (tanpa judul bagian) yang tampil pada satu langkah. */
  const daun = (n: number) => semuaButir.filter((b) => b.tipe !== "BAGIAN" && b.langkah === n && aturan[b.kode]?.tampil !== false);

  const nomorTampil = langkah.map((l) => l.nomor).filter((n) => daun(n).length > 0);
  const terakhir = nomorTampil[nomorTampil.length - 1] ?? 1;
  const terakhirInti = [...nomorTampil].reverse().find((n) => inti.has(n));

  const perluKonfirmasi = (n: number) => daun(n).filter((b) => jawaban[b.kode]?.status === "USULAN");
  const wajibKosong = (n: number) => daun(n).filter((b) => aturan[b.kode]?.wajib && !jawaban[b.kode]);
  const lengkap = (n: number) => perluKonfirmasi(n).length === 0 && wajibKosong(n).length === 0;

  const [nomor, setNomor] = useState(() => {
    const target = nomorTampil.find((n) => (!!awal.inti.dikirimAt ? !inti.has(n) : true) && !lengkapAwal(n));
    return target ?? nomorTampil[0] ?? 1;

    function lengkapAwal(n: number) {
      const ada = new Set(awal.jawaban.map((j) => j.kode));
      return semuaButir
        .filter((b) => b.tipe !== "BAGIAN" && b.langkah === n && awal.aturan[b.kode]?.tampil !== false)
        .every((b) => ada.has(b.kode) && awal.jawaban.find((j) => j.kode === b.kode)?.status !== "USULAN");
    }
  });

  // Pilihan range yang dipakai instrumen (mis. penghasilan), dimuat sekali.
  useEffect(() => {
    const jenis = [...new Set(semuaButir.filter((b) => b.tipe === "RANGE" && b.range_jenis).map((b) => b.range_jenis!))];
    jenis.forEach((j) => {
      panggil<RangeOpsi[]>("GET", `range/${j}`)
        .then((r) => setRange((s) => ({ ...s, [j]: r })))
        .catch(() => setRange((s) => ({ ...s, [j]: [] })));
    });
  }, [semuaButir]);

  const bisaUbah = status === "DRAFT" || status === "PERLU_REVISI";

  useEffect(() => {
    const peringatkan = (event: BeforeUnloadEvent) => {
      if (Object.keys(tertunda.current).length) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", peringatkan);
    return () => window.removeEventListener("beforeunload", peringatkan);
  }, []);

  function simpan(kode: string, nilaiBaru: unknown) {
    setGalat(null);
    const versi = ++urutan.current;
    tertunda.current[kode] = { urutan: versi, nilai: nilaiBaru };
    setMasalah((lama) => lama.filter((k) => k !== kode));
    // Tampilan langsung berubah, lalu disamakan dengan jawaban dari server.
    setJawaban((s) => {
      const lama = s[kode];
      const sama = lama && JSON.stringify(lama.nilai) === JSON.stringify(nilaiBaru);
      const statusBaru = lama?.status === "USULAN" ? (sama ? "KONFIRMASI" : "DIUBAH") : (lama?.status ?? "DIISI");
      return { ...s, [kode]: { kode, nilai: nilaiBaru, sumber: lama?.sumber ?? "ALUMNI", status: statusBaru } };
    });
    setMenyimpan((n) => n + 1);
    // Antre supaya urutan penyimpanan sama dengan urutan ketukan.
    antrean.current = antrean.current
      .then(() =>
        panggil<{ jawaban: Jawaban[]; aturan: Record<string, AturanButir>; arah: Respons["arah"] }>("PUT", "respons/jawaban", {
          jawaban: [{ kode, nilai: nilaiBaru }],
        }),
      )
      .then((r) => {
        if (tertunda.current[kode]?.urutan === versi) {
          delete tertunda.current[kode];
          delete gagalRef.current[kode];
          setGagalSimpan({ ...gagalRef.current });
        }
        const sisa = { ...tertunda.current };
        setJawaban((sekarang) => gabungkanJawaban(r.jawaban, sekarang, sisa));
        setAturan(r.aturan);
        setArah(r.arah);
        setPernahSimpan(true);
      })
      .catch((e) => {
        if (tertunda.current[kode]?.urutan !== versi) return;
        gagalRef.current[kode] = nilaiBaru;
        setGagalSimpan({ ...gagalRef.current });
        setGalat(`Jawaban belum tersimpan: ${pesan(e)}. Coba simpan lagi.`);
      })
      .finally(() => setMenyimpan((n) => n - 1));
  }

  /** Mengonfirmasi semua usulan pada satu langkah. Mengembalikan false bila gagal. */
  async function konfirmasiLangkah(n: number) {
    try {
      await antrean.current;
      if (Object.keys(gagalRef.current).length) throw new Error("Ada jawaban yang belum tersimpan. Coba simpan lagi.");
      await panggil("POST", "respons/konfirmasi", { langkah: n });
      const kode = new Set(daun(n).map((b) => b.kode));
      setJawaban((s) =>
        Object.fromEntries(
          Object.entries(s).map(([k, v]) => [k, kode.has(k) && v.status === "USULAN" ? { ...v, status: "KONFIRMASI" as const } : v]),
        ),
      );
      return true;
    } catch (e) {
      setGalat(pesan(e));
      return false;
    }
  }

  function tunjukkanMasalah(butir: Butir[], pesanGalat: string) {
    setMasalah(butir.map((b) => b.kode));
    setGalat(pesanGalat);
    requestAnimationFrame(() => ringkasan.current?.focus());
  }

  function siapPindah() {
    if (Object.keys(gagalRef.current).length) {
      setGalat("Ada jawaban yang belum tersimpan. Coba simpan lagi sebelum berpindah.");
      return false;
    }
    if (Object.keys(tertunda.current).length) {
      setGalat("Tunggu sebentar, jawaban sedang disimpan.");
      return false;
    }
    return true;
  }

  function pindah(arah: 1 | -1, lewatiPemeriksaan = false) {
    if (!siapPindah()) return;
    if (arah === 1 && !lewatiPemeriksaan) {
      const kosong = wajibKosong(nomor);
      if (kosong.length) return tunjukkanMasalah(kosong, `Lengkapi dulu ${kosong.length} pertanyaan wajib yang bertanda *.`);
      if (perluKonfirmasi(nomor).length) return tunjukkanMasalah(perluKonfirmasi(nomor), "Konfirmasi atau ubah jawaban yang disarankan sebelum lanjut.");
    }
    setGalat(null);
    setMasalah([]);
    const berikut = nomorTampil[nomorTampil.indexOf(nomor) + arah];
    if (berikut !== undefined) {
      setNomor(berikut);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /** "Semua benar, lanjut" di Cek cepat: konfirmasi semua usulan, lalu ke langkah berikutnya. */
  async function semuaBenar() {
    setGalat(null);
    if (Object.keys(gagalRef.current).length) return setGalat("Ada jawaban yang belum tersimpan. Coba simpan lagi sebelum melanjutkan.");
    const kosong = wajibKosong(nomor);
    if (kosong.length) return tunjukkanMasalah(kosong, `Lengkapi dulu ${kosong.length} pertanyaan wajib yang bertanda *.`);
    if (perluKonfirmasi(nomor).length && !(await konfirmasiLangkah(nomor))) return;
    pindah(1, true);
  }

  function tanganiKekurangan(e: unknown, awalan: string) {
    const data = (e as { data?: Kekurangan }).data;
    const bermasalah = [...(data?.belumDiisi ?? []), ...(data?.belumDikonfirmasi ?? [])];
    if (bermasalah.length) {
      const butir = semuaButir.find((b) => b.kode === bermasalah[0]);
      if (butir?.langkah) setNomor(butir.langkah);
      setMasalah(bermasalah);
      setGalat(`${awalan}: ${bermasalah.length} pertanyaan perlu diisi atau dikonfirmasi.`);
      requestAnimationFrame(() => ringkasan.current?.focus());
    } else if (data?.izinKurang?.length) {
      setGalat("Persetujuan penggunaan data untuk pelaporan agregat wajib diberikan.");
    } else {
      setGalat(pesan(e));
    }
  }

  async function kirim(bagian: "inti" | "penuh") {
    setGalat(null);
    setMengirim(true);
    try {
      await antrean.current;
      if (Object.keys(gagalRef.current).length) throw new Error("Ada jawaban yang belum tersimpan. Coba simpan lagi sebelum mengirim.");
      await panggil("PUT", "respons/izin", { izin: [{ jenis: "DATA_AGREGAT", diberikan: true }] });
      if (bagian === "inti") {
        const r = await panggil<{ inti_dikirim_at: string }>("POST", "respons/kirim-inti");
        setIntiDikirim(r.inti_dikirim_at);
        setLayarInti(true);
      } else {
        const r = await panggil<{ dikirim_at?: string }>("POST", "respons/kirim");
        setDikirimAt(r.dikirim_at ?? new Date().toISOString());
        setStatus("DIKIRIM");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      tanganiKekurangan(e, bagian === "inti" ? "Bagian inti belum lengkap" : "Pengisian belum lengkap");
    } finally {
      setMengirim(false);
    }
  }

  if (!bisaUbah) {
    return (
      <RingkasanTerkirim
        status={status}
        dikirimAt={dikirimAt}
        instrumen={instrumen}
        jawaban={jawaban}
        aturan={aturan}
        range={range}
        identitas={awal.identitas}
      />
    );
  }

  const sisaLangkah = nomorTampil.filter((n) => !inti.has(n) && !lengkap(n)).length;
  const bagianSisa = nomorTampil
    .filter((n) => !inti.has(n))
    .flatMap((n) => {
      const top = topLangkah(n).filter((b) => aturan[b.kode]?.tampil !== false);
      const bagian = top
        .filter((b) => b.tipe === "BAGIAN" && NAMA_BAGIAN[b.kode])
        .map((b) => `${NAMA_BAGIAN[b.kode]} (${b.anak?.length ?? 0} butir)`);
      const lain = top.some((b) => b.tipe !== "BAGIAN") ? [langkah.find((l) => l.nomor === n)?.judul ?? `Langkah ${n}`] : [];
      return [...bagian, ...lain];
    });
  if (layarInti) {
    return (
      <IntiTerkirim
        sisa={bagianSisa.length}
        bagian={bagianSisa}
        lanjut={() => {
          setLayarInti(false);
          const berikut = nomorTampil.find((n) => !inti.has(n));
          if (berikut !== undefined) setNomor(berikut);
        }}
      />
    );
  }

  const judul = langkah.find((l) => l.nomor === nomor)?.judul ?? "";
  const posisi = nomorTampil.indexOf(nomor);
  const pertama = posisi <= 0;
  const final = nomor === terakhir;
  const cepat = posisi === 0;
  const adaUsulan = perluKonfirmasi(nomor).length;
  const intiLengkap = nomorTampil.filter((n) => inti.has(n)).every(lengkap);

  const kontekstual = (b: Butir) => ({
    butir: b,
    teks: teksButir(b, nilai),
    wajib: aturan[b.kode]?.wajib ?? false,
    jawaban: jawaban[b.kode],
    range: b.range_jenis ? range[b.range_jenis] : undefined,
    nilaiInduk: b.bergantung_pada ? nilai[b.bergantung_pada] : undefined,
    onSimpan: simpan,
  });

  const pohon = (daftar: Butir[], polos = false): React.ReactNode =>
    daftar.map((b) => {
      if (aturan[b.kode]?.tampil === false) return null;
      // Orientasi, profesi, dan industri satu kartu "Arah karier" (butir lainnya ikut di dalamnya).
      if (b.kode === "UBL-ORIENTASI") {
        return (
          <ArahKarier
            key="arah"
            alasan={arah?.alasan ?? null}
            usulan={jawaban["UBL-ORIENTASI"]?.status === "USULAN"}
          >
            {daftar
              .filter((x) => KODE_ARAH.includes(x.kode) && aturan[x.kode]?.tampil !== false)
              .map((x) => (
                <Field key={x.kode} {...kontekstual(x)} tanpaKartu />
              ))}
          </ArahKarier>
        );
      }
      if (KODE_ARAH.includes(b.kode)) return null;
      // F502 dihitung sistem dari tanggal mulai, alumni tidak mengisinya.
      if (b.otomatis) return <MasaTunggu key={b.kode} bulan={jawaban[b.kode]?.nilai} />;
      if (b.tipe === "BAGIAN") {
        return (
          <fieldset key={b.kode} className="flex flex-col gap-4 rounded-2xl border border-hub-line bg-white p-4 sm:p-5">
            <legend className="px-1 text-base font-semibold">{b.teks}</legend>
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2">
              {pohon(b.anak ?? [], true)}
            </div>
          </fieldset>
        );
      }
      return <Field key={b.kode} {...kontekstual(b)} tanpaKartu={polos} />;
    });

  /**
   * Pertanyaan inti cukup panjang, jadi diberi judul kelompok supaya mudah dipindai. Judul tampil sebelum
   * butir pertama yang terlihat dari kelompoknya, dan tidak tampil bila seluruh kelompok tersembunyi.
   */
  const pohonBerkelompok = (daftar: Butir[]): React.ReactNode => {
    let terakhir = "";
    return daftar.map((b) => {
      if (KODE_ARAH.includes(b.kode) && b.kode !== "UBL-ORIENTASI") return null;
      const grup = GRUP_PERTANYAAN[b.kode];
      let kepala: React.ReactNode = null;
      if (grup && aturan[b.kode]?.tampil !== false && grup !== terakhir) {
        terakhir = grup;
        kepala = (
          <h3 className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-hub-teal-dark">
            {JUDUL_GRUP[grup]}
            <span aria-hidden="true" className="h-px flex-1 bg-hub-line" />
          </h3>
        );
      }
      const isi = b.kode === "UBL-ORIENTASI" ? pohon(daftar.filter((x) => KODE_ARAH.includes(x.kode))) : pohon([b]);
      return (
        <Fragment key={b.kode}>
          {kepala}
          {isi}
        </Fragment>
      );
    });
  };

  /** Cek cepat: jawaban yang sudah ada tampil sebagai baris ringkas dengan tombol Ubah. */
  const barisCepat = (daftar: Butir[]): React.ReactNode =>
    daftar.map((b) => {
      if (aturan[b.kode]?.tampil === false) return null;
      const j = jawaban[b.kode];
      const sedangUbah = ubah[b.kode];
      const anak = b.anak?.length ? barisCepat(b.anak) : null;
      if (!j || sedangUbah) {
        return (
          <div key={b.kode} className="flex flex-col gap-3">
            <div className="rounded-2xl border border-hub-line bg-white p-4">
              <Field {...kontekstual(b)} />
              {sedangUbah && (
                <button
                  type="button"
                  onClick={() => setUbah((s) => ({ ...s, [b.kode]: false }))}
                  className={`mt-3 min-h-11 rounded-lg px-3 text-sm font-medium text-hub-teal-dark hover:underline ${focusRing}`}
                >
                  Selesai
                </button>
              )}
            </div>
            {anak}
          </div>
        );
      }
      return (
        <div key={b.kode} className="flex flex-col gap-3">
          <div id={`butir-${b.kode}`} className="scroll-mt-6 flex items-start gap-3 rounded-2xl border border-hub-line bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-hub-muted">{teksButir(b, nilai)}</p>
              <p className="mt-0.5 break-words font-semibold">{labelNilai(b, j.nilai, b.range_jenis ? range[b.range_jenis] : [])}</p>
              <div className="mt-1.5">
                <Lencana jawaban={j} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUbah((s) => ({ ...s, [b.kode]: true }))}
              className={`min-h-11 shrink-0 rounded-lg px-3 text-sm font-medium text-hub-teal-dark hover:underline ${focusRing}`}
            >
              Ubah
            </button>
          </div>
          {anak}
        </div>
      );
    });

  const adaKompetensi = topLangkah(nomor).some((b) => b.kode === "F17A") && topLangkah(nomor).some((b) => b.kode === "F17B");
  const sisaTop = topLangkah(nomor).filter((b) => !(adaKompetensi && (b.kode === "F17A" || b.kode === "F17B")));

  return (
    <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-6 pb-8 xl:grid-cols-[224px_minmax(0,1fr)] xl:gap-8">
      <aside className="min-w-0 xl:sticky xl:top-8 xl:self-start">
        {/* Ponsel dan tablet: penunjuk ringkas supaya pertanyaan langsung terlihat. Daftar tahap penuh di layar lebar. */}
        <div
          role="progressbar"
          aria-label="Kemajuan pengisian"
          aria-valuemin={1}
          aria-valuemax={nomorTampil.length}
          aria-valuenow={posisi + 1}
          aria-valuetext={`Langkah ${posisi + 1} dari ${nomorTampil.length}: ${judul}`}
          className="flex gap-1.5 xl:hidden"
        >
          {nomorTampil.map((n, i) => (
            <span
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
                i < posisi ? "bg-hub-teal-dark" : i === posisi ? "bg-hub-navy" : "bg-hub-line"
              }`}
            />
          ))}
        </div>
        <nav aria-label="Tahapan pengisian" className="hidden gap-2 xl:grid xl:grid-cols-1">
          {nomorTampil.map((n, i) => {
            const aktif = n === nomor;
            const bolehKembali = i < posisi;
            const selesai = lengkap(n);
            return (
              <button key={n} type="button" disabled={!bolehKembali} aria-current={aktif ? "step" : undefined}
                onClick={() => { if (!siapPindah()) return; setNomor(n); setGalat(null); setMasalah([]); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`flex min-h-14 items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${focusRing} ${aktif ? "border-hub-teal-dark/30 bg-white shadow-sm" : bolehKembali ? "cursor-pointer border-transparent hover:border-hub-line hover:bg-white" : "border-transparent"}`}>
                <span aria-hidden="true" className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${aktif ? "bg-hub-navy text-white" : selesai ? "bg-hub-teal-dark text-white" : "border border-hub-line text-hub-muted"}`}>{selesai && !aktif ? <Icon name="check" className="size-4" /> : String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 self-center text-sm font-semibold leading-snug">{langkah.find((l) => l.nomor === n)?.judul ?? `Langkah ${i + 1}`}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col gap-5">
      <header className="border-b border-hub-line pb-4">
        <p className="text-sm text-hub-muted">Langkah {posisi + 1} dari {nomorTampil.length}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-hub-navy sm:text-3xl">{judul}</h2>
      </header>

      {(galat || Object.keys(gagalSimpan).length > 0) && (
        <div ref={ringkasan} tabIndex={-1} role="alert" className="rounded-2xl border border-[#efb8b2] bg-[#FDE7E4] p-4 text-sm text-[#8b2118] focus:outline-2 focus:outline-offset-2 focus:outline-[#8b2118]">
          <p className="font-semibold">Perlu perhatian</p><p className="mt-1">{galat ?? "Ada jawaban yang belum tersimpan. Coba simpan lagi."}</p>
          {Object.keys(gagalSimpan).length > 0 && <button type="button" disabled={menyimpan > 0} onClick={() => Object.entries(gagalSimpan).forEach(([kode, nilai]) => simpan(kode, nilai))} className={`mt-3 min-h-11 rounded-xl border border-current px-4 font-semibold disabled:opacity-50 ${focusRing}`}>Coba simpan lagi</button>}
          {masalah.length > 0 && <ul className="mt-2 list-inside list-disc space-y-1">{masalah.map((kode) => {
            const butir = semuaButir.find((b) => b.kode === kode);
            return butir ? <li key={kode}><a href={`#butir-${kode}`} className="underline underline-offset-2">{teksButir(butir, nilai)}</a></li> : null;
          })}</ul>}
        </div>
      )}

      {status === "PERLU_REVISI" && (
        <p role="status" className="rounded-2xl bg-[#FFF1CC] p-4 text-sm text-[#6B4A00]">
          Perlu perbaikan{catatanRevisi ? `: ${catatanRevisi}` : "."}
        </p>
      )}

      {intiDikirim && (
        <p role="status" className="rounded-2xl bg-[#E3F4F1] p-4 text-sm text-[#0B5F57]">
          Bagian inti terkirim. Tinggal {sisaLangkah} bagian lagi.
        </p>
      )}

      {!cepat && adaUsulan > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl bg-[#E3F4F1] p-4 text-sm text-[#0B5F57] sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong>{adaUsulan} jawaban</strong> terisi otomatis.
          </p>
          <button
            type="button"
            onClick={() => konfirmasiLangkah(nomor)}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-hub-teal-dark px-4 font-semibold text-white ${focusRing}`}
          >
            <Icon name="check" className="size-4" />
            Semua benar
          </button>
        </div>
      )}

      <section key={nomor} aria-label={judul} className="flex flex-col gap-4 motion-safe:animate-[hub-rise_0.25s_ease-out]">
        {cepat ? (
          <>
            <Identitas data={awal.identitas} />
            <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">{barisCepat(topLangkah(nomor))}</div>
          </>
        ) : (
          <>
            {adaKompetensi && (
              <Kompetensi
                a={topLangkah(nomor).find((b) => b.kode === "F17A")!}
                b={topLangkah(nomor).find((b) => b.kode === "F17B")!}
                jawaban={jawaban}
                simpan={simpan}
              />
            )}
            {pohonBerkelompok(sisaTop)}
          </>
        )}
      </section>

      {nomor === terakhirInti && !intiDikirim && !final && (
        <PanelInti
          lengkap={intiLengkap}
          setuju={setuju}
          setSetuju={setSetuju}
          mengirim={mengirim}
          kirim={() => kirim("inti")}
        />
      )}

      {final && !setuju && (
        <Persetujuan setuju={setuju} setSetuju={setSetuju} />
      )}

      <div role="status" aria-live="polite" className="-my-1 min-h-4 text-sm text-hub-muted">
        {menyimpan > 0 ? "Menyimpan..." : Object.keys(gagalSimpan).length ? "Ada jawaban yang belum tersimpan." : pernahSimpan && !galat ? "Tersimpan" : ""}
      </div>

      <div className="flex gap-3 rounded-2xl border border-hub-line bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => pindah(-1)}
          disabled={pertama}
          className={`min-h-12 rounded-xl border border-hub-line bg-white px-5 font-semibold disabled:opacity-40 ${focusRing}`}
        >
          Kembali
        </button>
        {final ? (
          <button
            type="button"
            onClick={() => kirim("penuh")}
            disabled={mengirim || menyimpan > 0 || !setuju}
            className={`min-h-12 flex-1 rounded-xl bg-hub-navy px-6 font-semibold text-white disabled:opacity-50 ${focusRing}`}
          >
            {mengirim ? "Mengirim..." : "Kirim Tracer Study"}
          </button>
        ) : cepat ? (
          <button
            type="button"
            onClick={semuaBenar}
            disabled={menyimpan > 0}
            className={`min-h-12 flex-1 rounded-xl bg-hub-teal-dark px-6 font-semibold text-white disabled:opacity-60 ${focusRing}`}
          >
            {adaUsulan > 0 ? "Semua benar, lanjut" : "Lanjut"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => pindah(1)}
            className={`min-h-12 flex-1 rounded-xl bg-hub-navy px-6 font-semibold text-white ${focusRing}`}
          >
            Lanjut
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

/** Orientasi, profesi, dan industri: usulan dari jawaban Anda, alumni mengonfirmasi atau mengubahnya. */
function ArahKarier({
  alasan,
  usulan,
  children,
}: {
  alasan: string | null;
  usulan: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl border border-hub-line bg-white p-4 sm:p-5">
      <legend className="px-1 text-sm font-semibold">Arah karier Anda</legend>
      {alasan && usulan ? (
        <p className="rounded-xl bg-[#E3F4F1] px-3 py-2 text-sm text-[#0B5F57]">
          <strong>Usulan:</strong> {alasan}
        </p>
      ) : null}
      {children}
    </fieldset>
  );
}

/** Masa tunggu (F502) dihitung dari tanggal lulus dan tanggal mulai kerja. */
function MasaTunggu({ bulan }: { bulan: unknown }) {
  if (typeof bulan !== "number") return null;
  return (
    <p className="flex items-center gap-3 rounded-2xl border border-dashed border-hub-line bg-white px-4 py-3 text-sm">
      <Icon name="clock" className="size-5 shrink-0 text-hub-teal-dark" />
      <span>
        <span className="font-medium">Masa tunggu:</span>{" "}
        {bulan <= 0 ? "langsung bekerja" : `${bulan} bulan setelah lulus`}
      </span>
    </p>
  );
}

function Identitas({ data }: { data: Respons["identitas"] }) {
  const ringkas = [data.nama, data.npm, data.prodi, data.tahunLulus ? `lulus ${data.tahunLulus}` : null].filter(Boolean).join(" · ");
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-hub-line bg-white p-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-hub-muted">Data diri</p>
        <p className="mt-0.5 break-words text-sm font-semibold">{ringkas}</p>
        <p className="mt-1 text-xs text-hub-muted">
          {data.waNumber ? `WhatsApp ${data.waNumber}` : "WhatsApp belum ada"}
          {data.nik ? ` · NIK ${data.nik}` : ""}
        </p>
        {!data.punyaPassport && (
          <p className="mt-2 rounded-lg bg-[#FFF1CC] px-3 py-2 text-xs text-[#6B4A00]">
            Belum ada Professional Passport. Kompetensi diisi manual.
          </p>
        )}
      </div>
      <span className="shrink-0 rounded-full bg-[#E3F4F1] px-2.5 py-0.5 text-xs font-medium text-[#0B5F57]">Diisi sistem</span>
    </div>
  );
}

function Persetujuan({ setuju, setSetuju }: { setuju: boolean; setSetuju: (v: boolean) => void }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border border-hub-line bg-white p-4">
      <input
        type="checkbox"
        checked={setuju}
        onChange={(e) => setSetuju(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-hub-navy"
      />
      <span className="text-sm">
        <span className="flex flex-wrap items-center gap-2 font-medium">
          Saya setuju data dipakai untuk pelaporan agregat
          <span className="rounded-full bg-hub-canvas px-2 py-0.5 text-xs font-medium text-hub-muted">Wajib</span>
        </span>
        <span className="mt-0.5 block text-hub-muted">Hanya ditampilkan secara agregat. Tidak memengaruhi ijazah.</span>
      </span>
    </label>
  );
}

/** Di akhir langkah inti: kirim inti sekarang (sisanya menyusul) atau lanjut mengisi semua. */
function PanelInti({
  lengkap,
  setuju,
  setSetuju,
  mengirim,
  kirim,
}: {
  lengkap: boolean;
  setuju: boolean;
  setSetuju: (v: boolean) => void;
  mengirim: boolean;
  kirim: () => void;
}) {
  return (
    <section aria-label="Kirim bagian inti" className="flex flex-col gap-3 rounded-2xl border border-hub-line bg-white p-4 sm:p-5">
      <h3 className="text-base font-semibold">Kirim bagian inti sekarang?</h3>
      <p className="text-sm text-hub-muted">Cukup untuk laporan status, masa tunggu, dan pendapatan. Sisanya boleh menyusul.</p>
      {!lengkap && (
        <p role="status" className="rounded-xl bg-[#FFF1CC] px-3 py-2 text-sm text-[#6B4A00]">
          Lengkapi langkah 1 dan 2 dulu.
        </p>
      )}
      <Persetujuan setuju={setuju} setSetuju={setSetuju} />
      <button
        type="button"
        onClick={kirim}
        disabled={!lengkap || !setuju || mengirim}
        className={`min-h-12 rounded-xl border border-hub-navy bg-white px-5 font-semibold text-hub-navy hover:bg-hub-canvas disabled:opacity-50 ${focusRing}`}
      >
        {mengirim ? "Mengirim..." : "Kirim bagian inti"}
      </button>
    </section>
  );
}

function IntiTerkirim({ sisa, bagian, lanjut }: { sisa: number; bagian: string[]; lanjut: () => void }) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-hub-line bg-white p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-[#E3F4F1] text-[#0B5F57]">
          <Icon name="check" className="size-7" />
        </span>
        <h2 className="text-xl font-semibold">Bagian inti terkirim</h2>
      </div>
      <div className="rounded-2xl border border-hub-line bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-semibold">Tinggal {sisa} bagian lagi</p>
          <span className="rounded-full bg-[#FFF1CC] px-2.5 py-0.5 text-xs font-medium text-[#6B4A00]">Draf</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {bagian.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm">
              <span aria-hidden="true" className="size-4 shrink-0 rounded-full border-2 border-hub-muted" />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={lanjut}
            className={`min-h-12 rounded-xl bg-hub-teal-dark px-6 font-semibold text-white ${focusRing}`}
          >
            Lengkapi sekarang
          </button>
          <Link
            href="/"
            className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-hub-line px-6 font-semibold ${focusRing}`}
          >
            Nanti saja
          </Link>
        </div>
      </div>
    </div>
  );
}

/** F17A dan F17B dipasangkan per kompetensi: kemampuan saat lulus dan kebutuhan pekerjaan sekarang. */
function Kompetensi({
  a,
  b,
  jawaban,
  simpan,
}: {
  a: Butir;
  b: Butir;
  jawaban: Peta;
  simpan: (kode: string, nilai: unknown) => void;
}) {
  return (
    <>
      {(a.anak ?? []).map((lulus, i) => {
        const butuh = b.anak?.[i];
        return (
          <fieldset id={`butir-${lulus.kode}`} key={lulus.kode} className="scroll-mt-6 flex flex-col gap-4 rounded-2xl border border-hub-line bg-white p-4 sm:p-5">
            <legend className="px-1 text-base font-semibold">{lulus.teks}</legend>
            <div className="rounded-xl bg-hub-canvas p-3 sm:p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                Saat lulus
                <Lencana jawaban={jawaban[lulus.kode]} />
              </div>
              <Skala butir={lulus} nilai={jawaban[lulus.kode]?.nilai} onSimpan={simpan} label={`${lulus.teks}, saat lulus`} />
            </div>
            {butuh && (
              <div id={`butir-${butuh.kode}`} className="scroll-mt-6">
                <div className="mb-2 text-sm font-medium">Dibutuhkan dalam pekerjaan sekarang</div>
                <Skala butir={butuh} nilai={jawaban[butuh.kode]?.nilai} onSimpan={simpan} label={`${lulus.teks}, dibutuhkan sekarang`} />
              </div>
            )}
          </fieldset>
        );
      })}
    </>
  );
}
