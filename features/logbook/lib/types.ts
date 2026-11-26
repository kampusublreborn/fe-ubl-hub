export const KATEGORI = [
  { nilai: "PEKERJAAN", label: "Pekerjaan" },
  { nilai: "SERTIFIKASI", label: "Sertifikasi" },
  { nilai: "PROYEK", label: "Proyek" },
  { nilai: "USAHA", label: "Usaha" },
  { nilai: "STUDI_LANJUT", label: "Studi lanjut" },
  { nilai: "JEJARING", label: "Jejaring" },
] as const;

export type Kategori = (typeof KATEGORI)[number]["nilai"];

export const labelKategori = (k: string) => KATEGORI.find((x) => x.nilai === k)?.label ?? k;

export type Penulis = {
  id: number;
  nama: string;
  prodi: string | null;
  tahunLulus: number | null;
  nomor: string | null;
};

export type Logbook = {
  id: number;
  kategori: Kategori;
  judul: string;
  isi: string;
  waktu: string;
  diubah: boolean;
  milikSaya: boolean;
  disembunyikan: boolean;
  alasanDisembunyikan?: string | null;
  jumlahLike: number;
  jumlahKomentar: number;
  sudahLike: boolean;
  /** Id foto lampiran; gambarnya di /api/logbook/gambar/<id>. */
  gambar: number[];
  penulis: Penulis;
};

export type Komentar = {
  id: number;
  /** Null untuk komentar tingkat atas; id komentar induk untuk balasan. */
  indukId: number | null;
  isi: string;
  waktu: string;
  milikSaya: boolean;
  /** Nama orang yang dibalas, bila ini balasan atas sebuah balasan. */
  balasKe: string | null;
  penulis: Penulis;
  /** Hanya ada pada komentar tingkat atas. */
  balasan?: Komentar[];
};

export type Halaman<T> = { data: T[]; cursorBerikutnya: number | null };

const format = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

/** Tanggal tetap (bukan "x jam lalu") supaya hasil server dan browser selalu sama. */
export const tanggal = (iso: string) => format.format(new Date(iso));

export const MAKS_FOTO = 4;
export const urlFoto = (id: number) => `/api/logbook/gambar/${id}`;
