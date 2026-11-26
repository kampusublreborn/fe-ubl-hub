"use client";

import { useEffect, useId, useState } from "react";
import { Icon } from "@/shared/components/icons";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { UKURAN_GAMBAR, siapkanGambarGrup, type JenisGambar } from "../lib/gambar";

/**
 * Kolom memilih logo atau banner grup, lengkap dengan pratinjau. Pemilihan memotong dan mengecilkan gambar di browser,
 * lalu memanggil `onSiap`. Orang tua yang memutuskan kapan mengunggah (langsung, atau setelah grup dibuat).
 */
export function GambarGrupField({
  jenis,
  urlSekarang,
  onSiap,
  onHapus,
  sibuk = false,
  galat,
}: {
  jenis: JenisGambar;
  /** Gambar yang sudah tersimpan di server (bila ada). */
  urlSekarang: string | null;
  onSiap: (blob: Blob) => void;
  /** Dipanggil saat gambar dihapus. Untuk gambar yang baru dipilih (belum diunggah), cukup membuangnya. */
  onHapus: () => void;
  sibuk?: boolean;
  galat?: string | null;
}) {
  const id = useId();
  const { rasio, label, bantuan } = UKURAN_GAMBAR[jenis];
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);
  const [galatLokal, setGalatLokal] = useState<string | null>(null);

  useEffect(() => () => { if (pratinjau) URL.revokeObjectURL(pratinjau); }, [pratinjau]);

  async function pilih(e: React.ChangeEvent<HTMLInputElement>) {
    const berkas = e.target.files?.[0];
    e.target.value = "";
    if (!berkas) return;
    setGalatLokal(null);
    setMemproses(true);
    try {
      const blob = await siapkanGambarGrup(berkas, jenis);
      setPratinjau(URL.createObjectURL(blob));
      onSiap(blob);
    } catch (err) {
      setGalatLokal(pesanGalat(err, "Gambar tidak dapat diproses."));
    } finally {
      setMemproses(false);
    }
  }

  const tampil = pratinjau ?? urlSekarang;
  const pesan = galatLokal ?? galat;
  const bulat = jenis === "logo";

  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <div className={`mt-2 flex gap-4 ${bulat ? "items-center" : "flex-col"}`}>
        <div
          style={{ aspectRatio: rasio }}
          className={`relative shrink-0 overflow-hidden border border-hub-line bg-hub-canvas ${bulat ? "w-24 rounded-2xl" : "w-full rounded-xl"}`}
        >
          {tampil ? (
            // eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal atau gambar berotentikasi dari API
            <img src={tampil} alt={`Pratinjau ${label.toLowerCase()}`} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-xs text-hub-muted">Belum ada</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <label
              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-hub-line bg-white px-4 text-sm font-medium transition-colors hover:bg-hub-canvas has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hub-navy ${memproses || sibuk ? "opacity-60" : ""}`}
            >
              <Icon name="plus" className="size-4" />
              {memproses ? "Mengecilkan..." : tampil ? "Ganti" : "Pilih gambar"}
              <span className="sr-only"> {label.toLowerCase()}</span>
              <input type="file" accept="image/*" disabled={memproses || sibuk} onChange={pilih} className="sr-only" aria-describedby={`${id}-bantuan`} />
            </label>
            {tampil && (
              <button
                type="button"
                disabled={memproses || sibuk}
                onClick={() => {
                  setPratinjau(null);
                  onHapus();
                }}
                className={`min-h-11 cursor-pointer rounded-full px-4 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-60 ${focusRing}`}
              >
                Hapus<span className="sr-only"> {label.toLowerCase()}</span>
              </button>
            )}
          </div>
          <p id={`${id}-bantuan`} className="mt-1.5 text-sm text-hub-muted">
            {bantuan}
          </p>
          {pesan && (
            <p role="alert" className="mt-1.5 text-sm text-red-700">
              {pesan}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
