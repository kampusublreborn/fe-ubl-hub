"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Icon } from "@/shared/components/icons";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";

export type BarisModerasi = {
  id: number;
  kategoriLabel: string;
  judul: string;
  isi: string;
  tanggal: string;
  disembunyikan: boolean;
  alasanDisembunyikan: string | null;
  jumlahLike: number;
  jumlahKomentar: number;
  jumlahLaporan: number;
  penulis: { nama: string; prodi: string | null; nomor: string | null };
};

type Laporan = { alasan: string | null; waktu: string; pelapor: { nama: string } };

const tombol = `inline-flex min-h-11 items-center gap-2 rounded-xl border border-hub-line bg-white px-4 text-sm font-medium transition-colors hover:bg-hub-canvas disabled:opacity-60 ${focusRing}`;

/** Satu tulisan di pantauan komunitas: lihat laporan, sembunyikan dengan alasan, atau pulihkan. */
export function ModerasiBaris({ baris, foto }: { baris: BarisModerasi; foto?: React.ReactNode }) {
  const router = useRouter();
  const id = useId();
  const [formAlasan, setFormAlasan] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [laporan, setLaporan] = useState<Laporan[] | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function atur(sembunyikan: boolean) {
    setSibuk(true);
    setGalat(null);
    try {
      await panggilApi("logbook-admin", "PATCH", `${baris.id}/sembunyikan`, {
        disembunyikan: sembunyikan,
        alasan: sembunyikan ? alasan.trim() || undefined : undefined,
      });
      setFormAlasan(false);
      setAlasan("");
      router.refresh();
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setSibuk(false);
    }
  }

  async function lihatLaporan() {
    if (laporan) return setLaporan(null);
    setGalat(null);
    try {
      setLaporan(await panggilApi<Laporan[]>("logbook-admin", "GET", `${baris.id}/laporan`));
    } catch (e) {
      setGalat(pesanGalat(e));
    }
  }

  return (
    <li className="rounded-2xl border border-hub-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{baris.penulis.nama}</p>
          <p className="text-xs text-hub-muted">
            {[baris.penulis.nomor, baris.penulis.prodi].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-hub-canvas px-3 py-1 font-medium">{baris.kategoriLabel}</span>
          {baris.jumlahLaporan > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-hub-sand/20 px-3 py-1 font-medium">
              <Icon name="flag" className="size-3.5" />
              {baris.jumlahLaporan} laporan
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 font-medium ${baris.disembunyikan ? "bg-hub-line" : "bg-hub-teal/15 text-hub-teal-dark"}`}
          >
            {baris.disembunyikan ? "Disembunyikan" : "Tampil"}
          </span>
        </div>
      </div>

      <h3 className="mt-3 font-semibold [overflow-wrap:anywhere]">{baris.judul}</h3>
      <p className="mt-1 whitespace-pre-line text-sm [overflow-wrap:anywhere]">{baris.isi}</p>
      {foto}
      <p className="mt-2 text-xs text-hub-muted">
        {baris.tanggal} · {baris.jumlahLike} suka · {baris.jumlahKomentar} komentar
      </p>
      {baris.disembunyikan && baris.alasanDisembunyikan && (
        <p className="mt-2 text-sm text-hub-muted">Alasan disembunyikan: {baris.alasanDisembunyikan}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {baris.jumlahLaporan > 0 && (
          <button type="button" onClick={lihatLaporan} aria-expanded={!!laporan} className={tombol}>
            {laporan ? "Tutup laporan" : "Lihat laporan"}
          </button>
        )}
        {baris.disembunyikan ? (
          <button type="button" disabled={sibuk} onClick={() => atur(false)} className={tombol}>
            {sibuk ? "Memulihkan..." : "Pulihkan"}
          </button>
        ) : (
          <button type="button" onClick={() => setFormAlasan((v) => !v)} aria-expanded={formAlasan} className={tombol}>
            Sembunyikan
          </button>
        )}
      </div>

      {formAlasan && !baris.disembunyikan && (
        <div className="hub-fade mt-3 flex flex-col gap-2">
          <label htmlFor={`${id}-alasan`} className="text-sm font-medium">
            Alasan (dilihat penulis)
          </label>
          <textarea
            id={`${id}-alasan`}
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Contoh: Memuat data pribadi"
            className={`rounded-xl border border-hub-line px-3.5 py-2.5 text-sm ${focusRing}`}
          />
          <button
            type="button"
            disabled={sibuk}
            onClick={() => atur(true)}
            className={`min-h-11 self-start rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-60 ${focusRing}`}
          >
            {sibuk ? "Menyembunyikan..." : "Sembunyikan tulisan"}
          </button>
        </div>
      )}

      {laporan && (
        <ul className="hub-fade mt-3 flex flex-col gap-2 rounded-xl bg-hub-canvas p-3 text-sm">
          {laporan.map((l, i) => (
            <li key={i}>
              <span className="font-medium">{l.pelapor.nama}</span>
              <span className="text-hub-muted">: {l.alasan || "Tanpa alasan"}</span>
            </li>
          ))}
        </ul>
      )}

      {galat && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {galat}
        </p>
      )}
    </li>
  );
}
