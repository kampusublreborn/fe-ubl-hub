"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { KomentarProvider } from "./komentar-panel";
import { Avatar } from "@/shared/components/avatar";
import { Icon } from "@/shared/components/icons";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { panggilLogbook } from "../lib/client";
import { FotoGaleri } from "./foto-galeri";
import { KomentarPanel } from "./komentar-panel";
import { labelKategori, tanggal, type Logbook } from "../lib/types";

const aksiBtn = `inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium text-hub-muted transition-colors hover:bg-hub-canvas hover:text-hub-ink ${focusRing}`;

function infoPenulis(p: Logbook["penulis"]) {
  return [p.prodi, p.tahunLulus ? `Lulus ${p.tahunLulus}` : null].filter(Boolean).join(" · ");
}

export function LogbookItem({ awal, onHapus, komentarTerbuka = false }: { awal: Logbook; onHapus: (id: number) => void; komentarTerbuka?: boolean }) {
  const [item, setItem] = useState(awal);
  const [galat, setGalat] = useState<string | null>(null);
  const [konfirmasi, setKonfirmasi] = useState<"hapus" | "lapor" | null>(null);
  const [dilaporkan, setDilaporkan] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [bukaKomentar, setBukaKomentar] = useState(komentarTerbuka);
  const panelId = useId();
  const profilHref = item.milikSaya ? "/profil" : `/profil/${item.penulis.id}`;

  async function ubahLike() {
    const sudah = item.sudahLike;
    setGalat(null);
    // Tampilkan hasilnya dulu, kembalikan bila gagal.
    setItem((i) => ({ ...i, sudahLike: !sudah, jumlahLike: i.jumlahLike + (sudah ? -1 : 1) }));
    try {
      const r = await panggilLogbook<{ sudahLike: boolean; jumlahLike: number }>(
        sudah ? "DELETE" : "PUT",
        `${item.id}/like`,
      );
      setItem((i) => ({ ...i, sudahLike: r.sudahLike, jumlahLike: r.jumlahLike }));
    } catch (e) {
      setItem((i) => ({ ...i, sudahLike: sudah, jumlahLike: i.jumlahLike + (sudah ? 1 : -1) }));
      setGalat(pesanGalat(e));
    }
  }

  const ubahJumlahKomentar = (delta: number) =>
    setItem((i) => ({ ...i, jumlahKomentar: Math.max(0, i.jumlahKomentar + delta) }));

  async function jalankan(aksi: "hapus" | "lapor") {
    setSibuk(true);
    setGalat(null);
    try {
      if (aksi === "hapus") {
        await panggilLogbook("DELETE", `${item.id}`);
        onHapus(item.id);
        return;
      }
      await panggilLogbook("POST", `${item.id}/laporan`, {});
      setDilaporkan(true);
      setKonfirmasi(null);
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <KomentarProvider><article
      aria-label={item.judul}
      className="rounded-2xl border border-hub-line bg-white p-4 transition-shadow duration-200 hover:shadow-[0_8px_24px_-14px_rgba(15,27,61,0.3)] sm:p-5"
    >
      <header className="flex items-start gap-3">
        <Link href={profilHref} tabIndex={-1} aria-hidden="true" className="shrink-0"><Avatar nama={item.penulis.nama} /></Link>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
            <Link href={profilHref} className={`font-semibold [overflow-wrap:anywhere] hover:underline ${focusRing}`}>
              {item.milikSaya ? "Anda" : item.penulis.nama}
            </Link>
            <span aria-hidden="true" className="text-hub-muted">·</span>
            <time dateTime={item.waktu} className="text-hub-muted">
              {tanggal(item.waktu)}
              {item.diubah ? " · diubah" : ""}
            </time>
          </p>
          <p className="truncate text-xs text-hub-muted">{infoPenulis(item.penulis)}</p>
        </div>
      </header>

      {item.disembunyikan && (
        <p className="mt-4 rounded-xl border border-hub-sand/60 bg-hub-sand/10 px-4 py-3 text-sm">
          <span className="font-medium">Disembunyikan admin.</span> Hanya Anda yang melihat tulisan
          ini.
          {item.alasanDisembunyikan ? ` Alasan: ${item.alasanDisembunyikan}` : ""}
        </p>
      )}

      <h3 className="mt-3 text-base font-semibold leading-snug [overflow-wrap:anywhere]">
        {item.judul}
      </h3>
      <p className="mt-1 whitespace-pre-line text-[0.95rem] leading-relaxed [overflow-wrap:anywhere]">
        {item.isi}
      </p>
      <p className="mt-2 text-sm font-medium text-hub-teal-dark">
        #{labelKategori(item.kategori).replace(/\s+/g, "")}
      </p>
      <FotoGaleri ids={item.gambar} judul={item.judul} detail={<>
        <div className="flex items-center gap-3">
          <Link href={profilHref} tabIndex={-1} aria-hidden="true" className="shrink-0"><Avatar nama={item.penulis.nama} /></Link>
          <div className="min-w-0"><p><Link href={profilHref} className={`font-semibold [overflow-wrap:anywhere] hover:underline ${focusRing}`}>{item.penulis.nama}</Link></p><time dateTime={item.waktu} className="text-xs text-hub-muted">{tanggal(item.waktu)}</time></div>
        </div>
        <h2 className="mt-4 font-semibold [overflow-wrap:anywhere]">{item.judul}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed [overflow-wrap:anywhere]">{item.isi}</p>
        <div className="mt-4 flex items-center justify-between border-y border-hub-line py-2 text-sm text-hub-muted">
          <button type="button" onClick={ubahLike} aria-pressed={item.sudahLike}  className={`${aksiBtn} ${item.sudahLike ? "text-red-700" : ""}`}><Icon name="heart" className={`size-5 ${item.sudahLike ? "fill-current" : ""}`} />{item.jumlahLike} suka</button>
          <span>{item.jumlahKomentar} komentar</span>
        </div>
        {galat && <p role="alert" className="mt-2 text-sm text-red-700">{galat}</p>}
        <KomentarPanel logbookId={item.id} pemilikLogbook={item.milikSaya} panelId={`${panelId}-foto`} onUbahJumlah={ubahJumlahKomentar}  />
      </>} />

      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-hub-line pt-2 -mx-1">
        <button
          type="button"
          onClick={ubahLike}
          aria-pressed={item.sudahLike}
          aria-label={`${item.sudahLike ? "Batal suka" : "Suka"}, ${item.jumlahLike} suka`}
          className={`${aksiBtn} ${item.sudahLike ? "text-red-700 hover:text-red-700" : ""}`}
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

        {konfirmasi ? (
          <span className="flex items-center gap-1" role="group" aria-label="Konfirmasi">
            <span className="px-2 text-sm">
              {konfirmasi === "hapus" ? "Hapus logbook ini?" : "Laporkan ke admin?"}
            </span>
            <button
              type="button"
              disabled={sibuk}
              onClick={() => jalankan(konfirmasi)}
              className={`min-h-11 rounded-lg bg-red-700 px-4 text-sm font-medium text-white disabled:opacity-60 ${focusRing}`}
            >
              {konfirmasi === "hapus" ? "Hapus" : "Laporkan"}
            </button>
            <button type="button" onClick={() => setKonfirmasi(null)} className={aksiBtn}>
              Batal
            </button>
          </span>
        ) : item.milikSaya ? (
          <button type="button" onClick={() => setKonfirmasi("hapus")} className={aksiBtn}>
            <Icon name="trash" className="size-5" />
            Hapus
          </button>
        ) : dilaporkan ? (
          <span role="status" className="px-3 text-sm text-hub-muted">
            Terima kasih, laporan terkirim.
          </span>
        ) : (
          <button type="button" onClick={() => setKonfirmasi("lapor")} className={aksiBtn}>
            <Icon name="flag" className="size-5" />
            Laporkan
          </button>
        )}
      </div>

      {galat && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {galat}
        </p>
      )}

      {bukaKomentar && (
        <KomentarPanel
          logbookId={item.id}
          pemilikLogbook={item.milikSaya}
          panelId={panelId}
          onUbahJumlah={ubahJumlahKomentar}
        />
      )}
    </article></KomentarProvider>
  );
}
