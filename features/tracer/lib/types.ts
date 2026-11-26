// Bentuk data API ubl-hub (/tracer). Mengikuti apps/ubl-hub/src/controllers/tracer.controller.ts.

export type Kondisi =
  | { kode: string; op: "eq" | "ne" | "in" | "nin" | "ada" | "kosong"; nilai?: unknown }
  | { semua: Kondisi[] }
  | { salah_satu: Kondisi[] };

export type TipeButir =
  | "PILIHAN_TUNGGAL"
  | "PILIHAN_GANDA"
  | "ANGKA"
  | "TEKS"
  | "TANGGAL"
  | "SKALA"
  | "RANGE"
  | "MASTER"
  | "BAGIAN";

export type Butir = {
  kode: string;
  teks: string;
  tipe: TipeButir;
  opsi?: { nilai: string | number; label: string; kunci?: string }[];
  wajib?: boolean;
  langkah?: number;
  range_jenis?: "PENGHASILAN" | "PENGELUARAN" | "KENAIKAN_KARIER";
  master?: "provinsi" | "kabupaten" | "pt" | "prodi" | "profesi" | "industri";
  /** Kode butir induk pilihan ini (kabupaten bergantung pada provinsi). */
  bergantung_pada?: string;
  /** Dihitung sistem (mis. F502 dari tanggal mulai), tidak diisi alumni. */
  otomatis?: boolean;
  label_min?: string;
  label_maks?: string;
  min?: number;
  max?: number;
  varian_teks?: { jika: Kondisi; teks: string }[];
  anak?: Butir[];
};

export type Instrumen = {
  nama?: string;
  kode: string;
  versi: string;
  langkah?: { nomor: number; judul: string; inti?: boolean }[];
  butir: Butir[];
};

export type SumberJawaban = "LMS" | "PASSPORT" | "RUMUS" | "AI" | "ALUMNI";
export type StatusJawaban = "USULAN" | "KONFIRMASI" | "DIUBAH" | "DIISI";

export type Jawaban = {
  kode: string;
  nilai: unknown;
  sumber: SumberJawaban;
  status: StatusJawaban;
};

export type AturanButir = { tampil: boolean; wajib: boolean };

export type StatusRespons = "DRAFT" | "DIKIRIM" | "DIVERIFIKASI" | "PERLU_REVISI" | "DILAPORKAN";

export type JenisIzin = "DATA_AGREGAT" | "INFO_KARIER" | "HUBUNGI_ATASAN" | "KISAH_SUKSES";

export type Respons = {
  responsId: number;
  status: StatusRespons;
  identitas: {
    nama: string;
    npm: string;
    tahunLulus: number | null;
    prodi: string | null;
    waNumber: string | null;
    nik: string | null;
    punyaPassport: boolean;
  };
  instrumen: Instrumen;
  jawaban: Jawaban[];
  aturan: Record<string, AturanButir>;
  langkah: {
    nomor: number;
    judul: string | null;
    inti: boolean;
    total: number;
    terisi: number;
    perluKonfirmasi: string[];
    wajibBelumDiisi: string[];
  }[];
  /** Alasan usulan orientasi karier ("Status Anda: wiraswasta"), null bila belum bisa diusulkan. */
  arah: { nilai: string; alasan: string } | null;
  /** Langkah inti dan kapan bagian inti dikirim (status tetap DRAFT sampai kirim penuh). */
  inti: { langkah: number[]; dikirimAt: string | null };
  izin: { jenis: JenisIzin; diberikan: boolean }[];
};

export type StatusTracer = {
  periode: { id: number; nama: string; tanggalMulai: string; tanggalSelesai: string } | null;
  respons: {
    status: StatusRespons;
    dikirim_at: string | null;
    inti_dikirim_at: string | null;
    verifikasi: { status: string; catatan: string | null } | null;
  } | null;
};

export type RangeOpsi = { id: number; label: string; batasBawah: number; batasAtas: number };

export type OpsiMaster = { kode: string; nama: string };
