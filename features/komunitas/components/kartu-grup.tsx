import Link from "next/link";
import { inisial, warna } from "@/shared/components/avatar";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { urlGambarGrup } from "../lib/gambar";
import { aktif, labelOrientasi, type Hubungan, type Jenis } from "../lib/types";

/** Identitas visual grup: kotak berinisial dengan warna tetap dari nama. Dekoratif, nama grup selalu tertulis di sebelahnya. */
export function LambangGrup({
  nama,
  id,
  versi = null,
  className = "size-12 text-base",
}: {
  nama: string;
  /** Bila `id` dan `versi` ada, logo grup yang diunggah dipakai sebagai ganti inisial. */
  id?: number;
  versi?: number | null;
  className?: string;
}) {
  const src = id === undefined ? null : urlGambarGrup(id, "logo", versi);
  if (src) {
    return (
      <span aria-hidden="true" className={`flex shrink-0 overflow-hidden rounded-2xl bg-hub-canvas ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- logo dari API berotentikasi, sudah dikompres */}
        <img src={src} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={`flex shrink-0 select-none items-center justify-center rounded-2xl font-semibold text-white ${warna(nama)} ${className}`}>
      {inisial(nama)}
    </span>
  );
}

export function LencanaJenis({ jenis, gelap = false }: { jenis: Jenis; gelap?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        gelap ? "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur" : "bg-hub-canvas text-hub-muted"
      }`}
    >
      <Icon name={jenis === "PRIVAT" ? "lock" : "users"} className="size-3.5" />
      {jenis === "PRIVAT" ? "Privat" : "Publik"}
    </span>
  );
}

function Status({ saya }: { saya: Hubungan }) {
  if (!saya) return null;
  const teks = aktif(saya)
    ? saya.peran === "ANGGOTA" ? "Anggota" : saya.peran === "ADMIN" ? "Admin" : "Moderator"
    : saya.status === "MENUNGGU" ? "Menunggu persetujuan" : "Diundang";
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-hub-teal-dark/10 px-2.5 py-1 text-xs font-semibold text-hub-teal-dark">
      {aktif(saya) && <Icon name="check" className="size-3.5" />}
      {teks}
    </span>
  );
}

type Data = {
  id: number;
  nama: string;
  deskripsi: string;
  jenis: Jenis;
  orientasi: string | null;
  jumlahAnggota: number;
  gambar: { logo: number | null };
  saya: Hubungan;
};

/** Kartu grup di daftar jelajah. Seluruh kartu adalah satu tautan ke halaman grup. */
export function KartuGrup({ grup }: { grup: Data }) {
  const orientasi = labelOrientasi(grup.orientasi);
  return (
    <li>
      <Link
        href={`/komunitas/${grup.id}`}
        className={`flex h-full flex-col gap-2 rounded-2xl border border-hub-line bg-white p-4 transition-shadow duration-200 hover:shadow-[0_8px_24px_-14px_rgba(15,27,61,0.3)] sm:p-5 ${focusRing}`}
      >
        <div className="flex items-start gap-3">
          <LambangGrup nama={grup.nama} id={grup.id} versi={grup.gambar.logo} />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug [overflow-wrap:anywhere]">{grup.nama}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <LencanaJenis jenis={grup.jenis} />
              <Status saya={grup.saya} />
            </div>
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-hub-muted [overflow-wrap:anywhere]">{grup.deskripsi}</p>
        <p className="mt-auto pt-1 text-xs text-hub-muted">
          <span className="tabular-nums">{grup.jumlahAnggota}</span> anggota{orientasi ? ` · ${orientasi}` : ""}
        </p>
      </Link>
    </li>
  );
}
