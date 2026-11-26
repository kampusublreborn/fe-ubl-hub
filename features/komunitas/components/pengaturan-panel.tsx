"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { panggilKomunitas } from "../lib/client";
import { urlGambarGrup, type JenisGambar } from "../lib/gambar";
import type { DetailGrup } from "../lib/types";
import { GambarGrupField } from "./gambar-grup-field";
import { GrupForm } from "./grup-form";

/** Khusus admin grup: ubah informasi dan jenis grup, atau hapus grup. */
export function PengaturanPanel({ grup }: { grup: DetailGrup }) {
  const router = useRouter();
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [versi, setVersi] = useState(grup.gambar);
  const [sibukGambar, setSibukGambar] = useState<JenisGambar | null>(null);
  const [galatGambar, setGalatGambar] = useState<{ jenis: JenisGambar; teks: string } | null>(null);
  const [infoGambar, setInfoGambar] = useState<string | null>(null);

  async function unggah(jenis: JenisGambar, blob: Blob) {
    setSibukGambar(jenis);
    setGalatGambar(null);
    setInfoGambar(null);
    try {
      const r = await panggilKomunitas<{ versi: number }>("PUT", `${grup.id}/gambar/${jenis}`, blob, blob.type);
      setVersi((v) => ({ ...v, [jenis]: r.versi }));
      setInfoGambar(`${jenis === "logo" ? "Logo" : "Banner"} grup diperbarui.`);
      router.refresh();
    } catch (e) {
      setGalatGambar({ jenis, teks: pesanGalat(e, "Gambar belum terunggah. Coba lagi.") });
    } finally {
      setSibukGambar(null);
    }
  }

  async function hapusGambar(jenis: JenisGambar) {
    setSibukGambar(jenis);
    setGalatGambar(null);
    setInfoGambar(null);
    try {
      await panggilKomunitas("DELETE", `${grup.id}/gambar/${jenis}`);
      setVersi((v) => ({ ...v, [jenis]: null }));
      setInfoGambar(`${jenis === "logo" ? "Logo" : "Banner"} grup dihapus.`);
      router.refresh();
    } catch (e) {
      setGalatGambar({ jenis, teks: pesanGalat(e) });
    } finally {
      setSibukGambar(null);
    }
  }

  async function hapus() {
    setSibuk(true);
    setGalat(null);
    try {
      await panggilKomunitas("DELETE", `${grup.id}`);
      router.push("/komunitas");
      router.refresh();
    } catch (e) {
      setGalat(pesanGalat(e));
      setSibuk(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="tampilan-grup" className="flex flex-col gap-5 rounded-2xl border border-hub-line bg-white p-4 sm:p-6">
        <h2 id="tampilan-grup" className="text-base font-semibold">
          Tampilan grup
        </h2>
        <GambarGrupField
          jenis="banner"
          urlSekarang={urlGambarGrup(grup.id, "banner", versi.banner)}
          sibuk={sibukGambar !== null}
          galat={galatGambar?.jenis === "banner" ? galatGambar.teks : null}
          onSiap={(b) => unggah("banner", b)}
          onHapus={() => hapusGambar("banner")}
        />
        <GambarGrupField
          jenis="logo"
          urlSekarang={urlGambarGrup(grup.id, "logo", versi.logo)}
          sibuk={sibukGambar !== null}
          galat={galatGambar?.jenis === "logo" ? galatGambar.teks : null}
          onSiap={(b) => unggah("logo", b)}
          onHapus={() => hapusGambar("logo")}
        />
        <p role="status" className={infoGambar ? "text-sm text-hub-teal-dark" : "sr-only"}>
          {infoGambar}
        </p>
      </section>

      <GrupForm grupId={grup.id} awal={{ nama: grup.nama, deskripsi: grup.deskripsi, jenis: grup.jenis, orientasi: grup.orientasi }} />

      <section aria-labelledby="hapus-grup" className="rounded-2xl border border-red-200 bg-white p-4 sm:p-6">
        <h2 id="hapus-grup" className="text-base font-semibold text-red-800">
          Hapus grup
        </h2>
        <p className="mt-1 text-sm text-hub-muted">Semua postingan, komentar, dan keanggotaan di grup ini ikut terhapus dan tidak bisa dipulihkan.</p>
        {galat && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {galat}
          </p>
        )}
        {konfirmasi ? (
          <div role="group" aria-label="Konfirmasi hapus grup" className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Yakin hapus “{grup.nama}”?</span>
            <button type="button" disabled={sibuk} onClick={hapus} className={`min-h-11 cursor-pointer rounded-lg bg-red-700 px-4 text-sm font-medium text-white disabled:opacity-60 ${focusRing}`}>
              {sibuk ? "Menghapus..." : "Ya, hapus"}
            </button>
            <button type="button" onClick={() => setKonfirmasi(false)} className={`min-h-11 cursor-pointer rounded-lg px-4 text-sm font-medium hover:bg-hub-canvas ${focusRing}`}>
              Batal
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setKonfirmasi(true)} className={`mt-4 min-h-11 cursor-pointer rounded-full border border-red-300 px-5 text-sm font-medium text-red-800 hover:bg-red-50 ${focusRing}`}>
            Hapus grup
          </button>
        )}
      </section>
    </div>
  );
}
