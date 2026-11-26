"use client";

import { useId, useState } from "react";
import { Avatar } from "@/shared/components/avatar";
import { Icon } from "@/shared/components/icons";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { FotoGaleri, KomentarPanel, tanggal } from "@/features/logbook/client";
import { panggilKomunitas } from "../lib/client";
import { urlFotoPost, type Post } from "../lib/types";

const aksiBtn = `inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium text-hub-muted transition-colors hover:bg-hub-canvas hover:text-hub-ink ${focusRing}`;

type Konfirmasi = "hapus" | "lapor" | "sembunyikan" | null;

export function PostItem({
  awal,
  moderasi,
  bolehTulis,
  onHapus,
  onUbah,
}: {
  awal: Post;
  /** Saya admin atau moderator grup ini. */
  moderasi: boolean;
  /** Saya anggota aktif grup ini. */
  bolehTulis: boolean;
  onHapus: (id: number) => void;
  /** Dipanggil saat sematan berubah, supaya daftar bisa mengurutkan ulang. */
  onUbah: (p: Post) => void;
}) {
  const [item, setItem] = useState(awal);
  const [galat, setGalat] = useState<string | null>(null);
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi>(null);
  const [alasan, setAlasan] = useState("");
  const [dilaporkan, setDilaporkan] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [bukaKomentar, setBukaKomentar] = useState(false);
  const [bukaKelola, setBukaKelola] = useState(false);
  const kelolaId = useId();
  const panelId = useId();
  const alasanId = useId();
  const jalur = `${item.komunitasId}/post/${item.id}`;

  async function ubahLike() {
    if (!bolehTulis) return;
    const sudah = item.sudahLike;
    setGalat(null);
    setItem((i) => ({ ...i, sudahLike: !sudah, jumlahLike: i.jumlahLike + (sudah ? -1 : 1) }));
    try {
      const r = await panggilKomunitas<{ sudahLike: boolean; jumlahLike: number }>(sudah ? "DELETE" : "PUT", `${jalur}/like`);
      setItem((i) => ({ ...i, sudahLike: r.sudahLike, jumlahLike: r.jumlahLike }));
    } catch (e) {
      setItem((i) => ({ ...i, sudahLike: sudah, jumlahLike: i.jumlahLike + (sudah ? 1 : -1) }));
      setGalat(pesanGalat(e));
    }
  }

  const ubahJumlahKomentar = (delta: number) => setItem((i) => ({ ...i, jumlahKomentar: Math.max(0, i.jumlahKomentar + delta) }));

  async function jalankan(aksi: Exclude<Konfirmasi, null>) {
    setSibuk(true);
    setGalat(null);
    try {
      if (aksi === "hapus") {
        await panggilKomunitas("DELETE", jalur);
        onHapus(item.id);
        return;
      }
      if (aksi === "lapor") {
        await panggilKomunitas("POST", `${jalur}/laporan`, {});
        setDilaporkan(true);
      } else {
        const hasil = await panggilKomunitas<{ disembunyikan: boolean }>("PATCH", `${jalur}/sembunyikan`, { disembunyikan: true, alasan: alasan.trim() || undefined });
        const baru = { ...item, disembunyikan: hasil.disembunyikan, disematkan: false };
        setItem(baru);
        onUbah(baru);
      }
      setKonfirmasi(null);
      setAlasan("");
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setSibuk(false);
    }
  }

  async function pulihkan() {
    setSibuk(true);
    setGalat(null);
    try {
      await panggilKomunitas("PATCH", `${jalur}/sembunyikan`, { disembunyikan: false });
      const baru = { ...item, disembunyikan: false };
      setItem(baru);
      onUbah(baru);
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setSibuk(false);
    }
  }

  async function ubahSematan() {
    setSibuk(true);
    setGalat(null);
    try {
      await panggilKomunitas(item.disematkan ? "DELETE" : "PUT", `${jalur}/sematan`);
      const baru = { ...item, disematkan: !item.disematkan };
      setItem(baru);
      onUbah(baru);
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setSibuk(false);
    }
  }

  const info = [item.penulis.prodi, item.penulis.tahunLulus ? `Lulus ${item.penulis.tahunLulus}` : null].filter(Boolean).join(" · ");
  const lencana = (teks: string, ikon: "megaphone" | "flag", kelas: string) => (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${kelas}`}>
      <Icon name={ikon} className="size-3.5" />
      {teks}
    </span>
  );

  return (
    <article
      aria-label={`Postingan ${item.milikSaya ? "Anda" : item.penulis.nama}`}
      className={`rounded-2xl border bg-white p-4 transition-shadow duration-200 hover:shadow-[0_8px_24px_-14px_rgba(15,27,61,0.3)] sm:p-5 ${
        item.pengumuman ? "border-hub-sand/70" : "border-hub-line"
      }`}
    >
      {(item.pengumuman || item.disematkan) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {item.pengumuman && lencana("Pengumuman", "megaphone", "bg-hub-sand/20 text-[#7a5600]")}
          {item.disematkan && lencana("Disematkan", "flag", "bg-hub-navy/10 text-hub-navy")}
        </div>
      )}

      <header className="flex items-start gap-3">
        <Avatar nama={item.penulis.nama} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
            <span className="font-semibold [overflow-wrap:anywhere]">{item.milikSaya ? "Anda" : item.penulis.nama}</span>
            <span aria-hidden="true" className="text-hub-muted">
              ·
            </span>
            <time dateTime={item.waktu} className="text-hub-muted">
              {tanggal(item.waktu)}
              {item.diubah ? " · diubah" : ""}
            </time>
          </p>
          {info && <p className="truncate text-xs text-hub-muted">{info}</p>}
        </div>
      </header>

      {item.disembunyikan && (
        <p className="mt-4 rounded-xl border border-hub-sand/60 bg-hub-sand/10 px-4 py-3 text-sm">
          <span className="font-medium">Disembunyikan.</span> Hanya penulis dan pengelola grup yang melihat postingan ini.
          {item.alasanDisembunyikan ? ` Alasan: ${item.alasanDisembunyikan}` : ""}
        </p>
      )}

      <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed [overflow-wrap:anywhere]">{item.isi}</p>
      <FotoGaleri ids={item.gambar} judul={`postingan ${item.penulis.nama}`} src={urlFotoPost(item.komunitasId, item.id)} />

      <div className="-mx-1 mt-4 flex flex-wrap items-center gap-1 border-t border-hub-line pt-2">
        <button
          type="button"
          onClick={ubahLike}
          disabled={!bolehTulis}
          aria-pressed={item.sudahLike}
          aria-label={`${item.sudahLike ? "Batal suka" : "Suka"}, ${item.jumlahLike} suka`}
          className={`${aksiBtn} disabled:cursor-default disabled:opacity-60 ${item.sudahLike ? "text-red-700 hover:text-red-700" : ""}`}
        >
          <Icon name="heart" className={`size-5 ${item.sudahLike ? "hub-like fill-current" : ""}`} />
          <span className="tabular-nums">{item.jumlahLike}</span>
        </button>
        <button
          type="button"
          onClick={() => setBukaKomentar((v) => !v)}
          aria-expanded={bukaKomentar}
          aria-controls={panelId}
          aria-label={`Komentar, ${item.jumlahKomentar} komentar`}
          className={aksiBtn}
        >
          <Icon name="msg" className="size-5" />
          <span className="tabular-nums">{item.jumlahKomentar}</span>
        </button>

        <span className="flex-1" />

        {item.milikSaya ? (
          <button type="button" onClick={() => setKonfirmasi("hapus")} className={aksiBtn}>
            <Icon name="trash" className="size-5" />
            Hapus
          </button>
        ) : dilaporkan ? (
          <span role="status" className="px-3 text-sm text-hub-muted">
            Terima kasih, laporan terkirim.
          </span>
        ) : (
          bolehTulis && (
            <button type="button" onClick={() => setKonfirmasi("lapor")} className={aksiBtn}>
              <Icon name="flag" className="size-5" />
              Laporkan
            </button>
          )
        )}
      </div>

      {moderasi && (
        <div className="mt-1">
          <button
            type="button"
            onClick={() => setBukaKelola((v) => !v)}
            aria-expanded={bukaKelola}
            aria-controls={kelolaId}
            className={`${aksiBtn} -ml-1 text-xs`}
          >
            <Icon name="chevron" className={`size-4 transition-transform motion-reduce:transition-none ${bukaKelola ? "rotate-180" : ""}`} />
            Kelola postingan
          </button>
          {bukaKelola && (
            <div id={kelolaId} role="group" aria-label="Aksi pengelola grup" className="hub-fade mt-1 flex flex-wrap items-center gap-1 rounded-xl bg-hub-canvas p-1">
              <button type="button" disabled={sibuk || item.disembunyikan} onClick={ubahSematan} className={`${aksiBtn} disabled:opacity-50`}>
                {item.disematkan ? "Lepas sematan" : "Sematkan"}
              </button>
              {item.disembunyikan ? (
                <button type="button" disabled={sibuk} onClick={pulihkan} className={aksiBtn}>
                  Pulihkan
                </button>
              ) : (
                !item.milikSaya && (
                  <button type="button" onClick={() => setKonfirmasi("sembunyikan")} className={aksiBtn}>
                    Sembunyikan
                  </button>
                )
              )}
              {!item.milikSaya && (
                <button type="button" onClick={() => setKonfirmasi("hapus")} className={`${aksiBtn} hover:!text-red-700`}>
                  Hapus
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {konfirmasi && (
        <div role="group" aria-label="Konfirmasi" className="hub-fade mt-2 flex flex-col gap-2 rounded-xl border border-hub-line p-3">
          <p className="text-sm font-medium">
            {konfirmasi === "hapus" ? "Hapus postingan ini? Komentarnya ikut terhapus." : konfirmasi === "lapor" ? "Laporkan postingan ini ke pengelola grup dan admin?" : "Sembunyikan postingan ini dari anggota?"}
          </p>
          {konfirmasi === "sembunyikan" && (
            <>
              <label htmlFor={alasanId} className="text-xs text-hub-muted">
                Alasan (opsional, terlihat oleh penulis)
              </label>
              <input id={alasanId} value={alasan} onChange={(e) => setAlasan(e.target.value)} maxLength={500} className={`min-h-11 rounded-lg border border-hub-line px-3 text-sm ${focusRing}`} />
            </>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={sibuk}
              onClick={() => jalankan(konfirmasi)}
              className={`min-h-11 cursor-pointer rounded-lg bg-red-700 px-4 text-sm font-medium text-white disabled:opacity-60 ${focusRing}`}
            >
              {konfirmasi === "hapus" ? "Hapus" : konfirmasi === "lapor" ? "Laporkan" : "Sembunyikan"}
            </button>
            <button type="button" onClick={() => setKonfirmasi(null)} className={aksiBtn}>
              Batal
            </button>
          </div>
        </div>
      )}

      {galat && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {galat}
        </p>
      )}

      {bukaKomentar && (
        <KomentarPanel
          logbookId={item.id}
          pemilikLogbook={item.milikSaya || moderasi}
          panelId={panelId}
          onUbahJumlah={ubahJumlahKomentar}
          basis="komunitas"
          jalur={jalur}
          bolehTulis={bolehTulis}
        />
      )}
    </article>
  );
}
