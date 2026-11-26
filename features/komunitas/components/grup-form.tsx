"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Icon } from "@/shared/components/icons";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { panggilKomunitas } from "../lib/client";
import type { JenisGambar } from "../lib/gambar";
import { ORIENTASI, adalahKodeOrientasi, type Jenis } from "../lib/types";
import { GambarGrupField } from "./gambar-grup-field";

const MAKS_NAMA = 80;
const MAKS_DESKRIPSI = 500;

export type DataGrup = { nama: string; deskripsi: string; jenis: Jenis; orientasi: string | null };

type Galat = { nama?: string; deskripsi?: string; orientasi?: string; umum?: string };

const LAINNYA = "__LAINNYA__";
const MAKS_ORIENTASI = 60;

const PILIHAN_JENIS: { nilai: Jenis; judul: string; keterangan: string; ikon: "users" | "lock" }[] = [
  { nilai: "PUBLIK", judul: "Publik", keterangan: "Semua alumni dapat membaca isinya dan bergabung langsung.", ikon: "users" },
  { nilai: "PRIVAT", judul: "Privat", keterangan: "Isi hanya untuk anggota. Yang ingin bergabung harus disetujui admin atau moderator grup.", ikon: "lock" },
];

/** Formulir membuat grup (tanpa `grupId`) atau mengubah pengaturan grup (dengan `grupId`). */
export function GrupForm({ grupId, awal, onTersimpan }: { grupId?: number; awal?: DataGrup; onTersimpan?: () => void }) {
  const router = useRouter();
  const id = useId();
  const [nama, setNama] = useState(awal?.nama ?? "");
  const [deskripsi, setDeskripsi] = useState(awal?.deskripsi ?? "");
  const [jenis, setJenis] = useState<Jenis>(awal?.jenis ?? "PUBLIK");
  // Nilai tersimpan yang bukan kode orientasi berasal dari pilihan "Lainnya".
  const [orientasi, setOrientasi] = useState(awal?.orientasi ? (adalahKodeOrientasi(awal.orientasi) ? awal.orientasi : LAINNYA) : "");
  const [orientasiLain, setOrientasiLain] = useState(awal?.orientasi && !adalahKodeOrientasi(awal.orientasi) ? awal.orientasi : "");
  const [galat, setGalat] = useState<Galat>({});
  const [mengirim, setMengirim] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);
  // Logo dan banner dipilih sebelum grup ada; diunggah setelah grup dibuat. Percobaan ulang tidak membuat grup ganda.
  const [gambar, setGambar] = useState<Partial<Record<JenisGambar, Blob>>>({});
  const [dibuatId, setDibuatId] = useState<number | null>(null);
  const [sudahUnggah, setSudahUnggah] = useState<Set<JenisGambar>>(new Set());

  function periksa() {
    const e: Galat = {};
    if (nama.trim().length < 3) e.nama = "Nama grup minimal 3 karakter.";
    if (deskripsi.trim().length < 10) e.deskripsi = "Jelaskan tujuan grup dalam minimal 10 karakter.";
    if (orientasi === LAINNYA && orientasiLain.trim().length < 2) e.orientasi = "Tulis orientasi karier minimal 2 karakter.";
    setGalat(e);
    return Object.keys(e).length === 0;
  }

  async function kirim(ev: React.FormEvent) {
    ev.preventDefault();
    if (mengirim || !periksa()) return;
    setMengirim(true);
    setTersimpan(false);
    const body = { nama: nama.trim(), deskripsi: deskripsi.trim(), jenis, orientasi: orientasi === LAINNYA ? orientasiLain.trim() : orientasi || null };
    try {
      if (grupId === undefined) {
        let id = dibuatId;
        if (id === null) {
          id = (await panggilKomunitas<{ id: number }>("POST", "", body)).id;
          setDibuatId(id);
        }
        for (const jenisGbr of ["logo", "banner"] as const) {
          const blob = gambar[jenisGbr];
          if (!blob || sudahUnggah.has(jenisGbr)) continue;
          try {
            await panggilKomunitas("PUT", `${id}/gambar/${jenisGbr}`, blob, blob.type);
            setSudahUnggah((s) => new Set(s).add(jenisGbr));
          } catch (e) {
            setGalat({ umum: `Grup sudah dibuat, tetapi ${jenisGbr} belum terunggah: ${pesanGalat(e)} Tekan tombol lagi untuk mencoba ulang, atau lewati dan atur gambar nanti di tab Pengaturan grup.` });
            return;
          }
        }
        router.push(`/komunitas/${id}`);
        router.refresh();
        return;
      }
      await panggilKomunitas("PATCH", `${grupId}`, body);
      setTersimpan(true);
      onTersimpan?.();
      router.refresh();
    } catch (e) {
      setGalat({ umum: pesanGalat(e, "Grup belum tersimpan. Coba lagi.") });
    } finally {
      setMengirim(false);
    }
  }

  const kolom = `min-h-12 w-full rounded-xl border border-hub-line bg-white px-4 py-3 text-base aria-[invalid=true]:border-red-700 ${focusRing}`;

  return (
    <form onSubmit={kirim} noValidate className="hub-rise flex flex-col gap-5 rounded-2xl border border-hub-line bg-white p-4 sm:p-6">
      {grupId === undefined && (
        <fieldset className="flex flex-col gap-5" disabled={dibuatId !== null && mengirim}>
          <legend className="sr-only">Tampilan grup (opsional)</legend>
          <GambarGrupField
            jenis="banner"
            urlSekarang={null}
            sibuk={mengirim}
            onSiap={(blob) => setGambar((g) => ({ ...g, banner: blob }))}
            onHapus={() => setGambar((g) => ({ ...g, banner: undefined }))}
          />
          <GambarGrupField
            jenis="logo"
            urlSekarang={null}
            sibuk={mengirim}
            onSiap={(blob) => setGambar((g) => ({ ...g, logo: blob }))}
            onHapus={() => setGambar((g) => ({ ...g, logo: undefined }))}
          />
        </fieldset>
      )}

      <div>
        <label htmlFor={`${id}-nama`} className="text-sm font-semibold">
          Nama grup
        </label>
        <input
          id={`${id}-nama`}
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          maxLength={MAKS_NAMA}
          placeholder="Misalnya: Alumni Data dan Analitik"
          aria-invalid={!!galat.nama}
          aria-describedby={galat.nama ? `${id}-nama-err` : undefined}
          className={`mt-1.5 ${kolom}`}
        />
        {galat.nama && (
          <p id={`${id}-nama-err`} role="alert" className="mt-1.5 text-sm text-red-700">
            {galat.nama}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-deskripsi`} className="text-sm font-semibold">
          Deskripsi
        </label>
        <textarea
          id={`${id}-deskripsi`}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          maxLength={MAKS_DESKRIPSI}
          rows={4}
          placeholder="Untuk siapa grup ini dan apa yang dibahas di dalamnya?"
          aria-invalid={!!galat.deskripsi}
          aria-describedby={`${id}-deskripsi-hint${galat.deskripsi ? ` ${id}-deskripsi-err` : ""}`}
          className={`mt-1.5 resize-y leading-relaxed ${kolom}`}
        />
        <div className="mt-1.5 flex items-start justify-between gap-3">
          {galat.deskripsi ? (
            <p id={`${id}-deskripsi-err`} role="alert" className="text-sm text-red-700">
              {galat.deskripsi}
            </p>
          ) : (
            <span />
          )}
          <span id={`${id}-deskripsi-hint`} className="ml-auto text-xs tabular-nums text-hub-muted">
            {deskripsi.length}/{MAKS_DESKRIPSI}
          </span>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Jenis grup</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {PILIHAN_JENIS.map((p) => (
            <label key={p.nilai} className="cursor-pointer rounded-xl has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hub-navy">
              <input type="radio" name={`${id}-jenis`} value={p.nilai} checked={jenis === p.nilai} onChange={() => setJenis(p.nilai)} className="peer sr-only" />
              <span className="flex h-full gap-3 rounded-xl border border-hub-line p-4 transition-colors hover:bg-hub-canvas peer-checked:border-hub-navy peer-checked:bg-hub-navy/5 peer-checked:ring-1 peer-checked:ring-hub-navy">
                <Icon name={p.ikon} className="mt-0.5 size-5 shrink-0 text-hub-navy" />
                <span>
                  <span className="block text-sm font-semibold">{p.judul}</span>
                  <span className="mt-0.5 block text-sm text-hub-muted">{p.keterangan}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${id}-orientasi`} className="text-sm font-semibold">
          Orientasi karier <span className="font-normal text-hub-muted">(opsional)</span>
        </label>
        <select id={`${id}-orientasi`} value={orientasi} onChange={(e) => setOrientasi(e.target.value)} aria-describedby={`${id}-orientasi-hint`} className={`mt-1.5 ${kolom}`}>
          <option value="">Tidak berbasis orientasi</option>
          {ORIENTASI.map((o) => (
            <option key={o.nilai} value={o.nilai}>
              {o.label}
            </option>
          ))}
          <option value={LAINNYA}>Lainnya (tulis sendiri)</option>
        </select>
        <p id={`${id}-orientasi-hint`} className="mt-1.5 text-sm text-hub-muted">
          Grup akan disarankan kepada alumni dengan orientasi ini. Mereka tetap memilih sendiri untuk bergabung. Orientasi yang Anda tulis sendiri hanya menjadi keterangan, tidak dipakai untuk saran.
        </p>
        {orientasi === LAINNYA && (
          <div className="mt-3">
            <label htmlFor={`${id}-orientasi-lain`} className="text-sm font-semibold">
              Tulis orientasi karier
            </label>
            <input
              id={`${id}-orientasi-lain`}
              value={orientasiLain}
              onChange={(e) => setOrientasiLain(e.target.value)}
              maxLength={MAKS_ORIENTASI}
              placeholder="Misalnya: Konsultan Pertanian"
              aria-invalid={!!galat.orientasi}
              aria-describedby={galat.orientasi ? `${id}-orientasi-err` : undefined}
              className={`mt-1.5 ${kolom}`}
            />
            {galat.orientasi && (
              <p id={`${id}-orientasi-err`} role="alert" className="mt-1.5 text-sm text-red-700">
                {galat.orientasi}
              </p>
            )}
          </div>
        )}
      </div>

      {galat.umum && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {galat.umum}
          {dibuatId !== null && (
            <>
              {" "}
              <Link href={`/komunitas/${dibuatId}`} className="font-semibold underline">
                Buka grup
              </Link>
            </>
          )}
        </p>
      )}
      {tersimpan && (
        <p role="status" className="rounded-xl border border-hub-teal-dark/30 bg-hub-teal-dark/5 px-4 py-3 text-sm text-hub-teal-dark">
          Pengaturan grup tersimpan.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mengirim}
          className={`min-h-12 cursor-pointer rounded-full bg-hub-navy px-8 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none ${focusRing}`}
        >
          {mengirim ? "Menyimpan..." : grupId === undefined ? (dibuatId !== null ? "Coba unggah lagi" : "Buat grup") : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
