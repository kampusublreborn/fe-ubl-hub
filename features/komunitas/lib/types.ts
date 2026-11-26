import type { Halaman, Penulis } from "@/features/logbook/client";

export type { Halaman };

export type Jenis = "PUBLIK" | "PRIVAT";
export type Peran = "ADMIN" | "MODERATOR" | "ANGGOTA";
export type StatusAnggota = "AKTIF" | "MENUNGGU" | "DIUNDANG";
export type Hubungan = { status: StatusAnggota; peran: Peran } | null;
export type AksiGabung = "SUDAH" | "LANGSUNG" | "MINTA" | "TERIMA_UNDANGAN" | "SUDAH_MINTA";

export const ORIENTASI = [
  { nilai: "CORPORATE_PROFESSIONAL", label: "Corporate Professional" },
  { nilai: "ENTREPRENEUR", label: "Entrepreneur / Pengusaha" },
  { nilai: "PUBLIC_LEADERS", label: "Public Leaders" },
  { nilai: "PROFESSIONAL_SPECIALIST", label: "Professional Specialist" },
  { nilai: "AKADEMISI", label: "Akademisi" },
] as const;

/** Kode orientasi diberi label; nilai lain adalah teks bebas dari pilihan "Lainnya" dan ditampilkan apa adanya. */
export const labelOrientasi = (k: string | null) => (k ? (ORIENTASI.find((o) => o.nilai === k)?.label ?? k) : null);

export const adalahKodeOrientasi = (k: string | null) => ORIENTASI.some((o) => o.nilai === k);

export type KartuGrup = {
  id: number;
  nama: string;
  deskripsi: string;
  jenis: Jenis;
  orientasi: string | null;
  jumlahAnggota: number;
  dibuat: string;
  /** Versi (ms) logo dan banner untuk URL gambar; null bila belum ada. */
  gambar: { logo: number | null; banner: number | null };
  saya: Hubungan;
};

export type DetailGrup = Omit<KartuGrup, "saya"> & {
  permintaanMenunggu: number;
  saya: Hubungan;
  isiTerkunci: boolean;
  aksiGabung: AksiGabung;
};

export type Post = {
  id: number;
  komunitasId: number;
  isi: string;
  pengumuman: boolean;
  disematkan: boolean;
  waktu: string;
  diubah: boolean;
  milikSaya: boolean;
  disembunyikan: boolean;
  alasanDisembunyikan?: string | null;
  jumlahLike: number;
  jumlahKomentar: number;
  sudahLike: boolean;
  gambar: number[];
  penulis: Penulis;
};

export type Anggota = Penulis & { id: number; peran: Peran; sejak: string };
export type CalonAnggota = Penulis & { id: number };

export const MAKS_FOTO = 4;
export const urlFotoPost = (grup: number, post: number) => (id: number) =>
  `/api/komunitas/${grup}/post/${post}/gambar/${id}`;

export const aktif = (h: Hubungan) => h?.status === "AKTIF";
export const bisaModerasi = (h: Hubungan) => aktif(h) && h!.peran !== "ANGGOTA";
export const adalahAdmin = (h: Hubungan) => aktif(h) && h!.peran === "ADMIN";

export const LABEL_PERAN: Record<Peran, string> = { ADMIN: "Admin", MODERATOR: "Moderator", ANGGOTA: "Anggota" };
