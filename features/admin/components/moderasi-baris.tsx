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

const tombol = `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-hub-line bg-white px-3 text-sm font-medium transition-colors hover:bg-hub-canvas disabled:cursor-wait disabled:opacity-60 ${focusRing}`;

/** Satu tulisan di pantauan komunitas: lihat laporan, sembunyikan dengan alasan, atau pulihkan. */
export function ModerasiBaris({ baris, foto }: { baris: BarisModerasi; foto?: React.ReactNode }) {
  const router = useRouter();
  const id = useId();
  const [formAlasan, setFormAlasan] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [laporan, setLaporan] = useState<Laporan[] | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [memuatLaporan, setMemuatLaporan] = useState(false);
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
    setMemuatLaporan(true);
    try {
      setLaporan(await panggilApi<Laporan[]>("logbook-admin", "GET", `${baris.id}/laporan`));
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setMemuatLaporan(false);
    }
  }

  return (
    <li className="min-w-0 rounded-2xl border border-hub-line bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-hub-navy/5 text-hub-navy"><Icon name="user" className="size-5" /></span>
          <div className="min-w-0 [overflow-wrap:anywhere]">
          <p className="text-base font-semibold">{baris.penulis.nama}</p>
          <p className="text-xs text-hub-muted">
            {[baris.penulis.nomor, baris.penulis.prodi].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1 text-xs text-hub-muted">{baris.tanggal}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md bg-hub-canvas px-2.5 py-1 font-medium">{baris.kategoriLabel}</span>
          {baris.jumlahLaporan > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-hub-sand/20 px-2 py-0.5 font-medium">
              <Icon name="flag" className="size-3.5" />
              {baris.jumlahLaporan} laporan
            </span>
          )}
          <span
            className={`rounded-md px-2 py-0.5 font-medium ${baris.disembunyikan ? "bg-hub-line" : "bg-hub-teal/15 text-hub-teal-dark"}`}
          >
            {baris.disembunyikan ? "Disembunyikan" : "Tampil"}
          </span>
        </div>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug [overflow-wrap:anywhere]">{baris.judul}</h3>
      <details className="group mt-1">
        <summary className={`cursor-pointer list-none rounded-md [&::-webkit-details-marker]:hidden ${focusRing}`}>
          <span className="line-clamp-3 max-w-prose text-base leading-relaxed text-hub-muted [overflow-wrap:anywhere] group-open:hidden">{baris.isi}</span>
          <span className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-hub-navy">
            <span className="group-open:hidden">Baca selengkapnya</span>
            <span className="hidden group-open:inline">Ringkas tulisan</span>
            <Icon name="chevron" className="size-3.5 group-open:rotate-180" />
          </span>
        </summary>
        <p className="max-w-prose whitespace-pre-line pb-2 text-base leading-relaxed [overflow-wrap:anywhere]">{baris.isi}</p>
      </details>
      {foto}
      {baris.disembunyikan && baris.alasanDisembunyikan && (
        <p className="mt-4 rounded-xl border border-hub-line bg-hub-canvas p-3 text-sm leading-relaxed text-hub-muted [overflow-wrap:anywhere]"><span className="font-semibold text-hub-ink">Alasan disembunyikan:</span> {baris.alasanDisembunyikan}</p>
      )}

      <div className="mt-3 flex flex-col gap-3 border-t border-hub-line pt-3">
        <p className="flex items-center gap-3 text-xs text-hub-muted">
          <span className="inline-flex items-center gap-1"><Icon name="heart" className="size-3.5" />{baris.jumlahLike} suka</span>
          <span className="inline-flex items-center gap-1"><Icon name="msg" className="size-3.5" />{baris.jumlahKomentar} komentar</span>
        </p>
        <div className="flex flex-wrap gap-2">
        {baris.jumlahLaporan > 0 && (
          <button type="button" disabled={memuatLaporan} onClick={lihatLaporan} aria-expanded={!!laporan} aria-controls={`${id}-laporan`} className={tombol}>
            <Icon name="flag" className="size-4" />{memuatLaporan ? "Memuat laporan..." : laporan ? "Tutup laporan" : "Lihat laporan"}
          </button>
        )}
        {baris.disembunyikan ? (
          <button type="button" disabled={sibuk} onClick={() => atur(false)} className={tombol}>
            {sibuk ? "Memulihkan..." : "Pulihkan"}
          </button>
        ) : (
          <button type="button" disabled={sibuk} onClick={() => setFormAlasan((v) => !v)} aria-expanded={formAlasan} aria-controls={`${id}-form`} className={`${tombol} text-red-700`}>
            <Icon name="lock" className="size-4" />Sembunyikan
          </button>
        )}
        </div>
      </div>

      {formAlasan && !baris.disembunyikan && (
        <div id={`${id}-form`} className="mt-4 flex flex-col gap-3 rounded-xl border border-hub-line bg-hub-canvas p-4">
          <label htmlFor={`${id}-alasan`} className="text-sm font-medium">
            Alasan (dilihat penulis)
          </label>
          <textarea
            id={`${id}-alasan`}
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            maxLength={500}
            aria-describedby={`${id}-petunjuk`}
            rows={2}
            placeholder="Contoh: Memuat data pribadi"
            className={`w-full rounded-xl border border-hub-line bg-white px-3.5 py-2.5 text-base ${focusRing}`}
          />
          <p id={`${id}-petunjuk`} className="text-xs leading-relaxed text-hub-muted">Alasan opsional, maksimal 500 karakter. Tulisan tetap terlihat oleh penulisnya.</p>
          <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={sibuk}
            onClick={() => atur(true)}
            className={`min-h-11 self-start rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-60 ${focusRing}`}
          >
            {sibuk ? "Menyembunyikan..." : "Sembunyikan tulisan"}
          </button>
          <button type="button" disabled={sibuk} onClick={() => setFormAlasan(false)} className={tombol}>Batal</button>
          </div>
        </div>
      )}

      {laporan && (
        <ul id={`${id}-laporan`} aria-label="Daftar laporan" className="mt-4 flex flex-col gap-3 rounded-xl border border-hub-line bg-hub-canvas p-4 text-sm [overflow-wrap:anywhere]">
          {laporan.length === 0 && <li className="text-hub-muted">Tidak ada detail laporan yang tersedia.</li>}
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
