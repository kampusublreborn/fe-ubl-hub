// DATA CONTOH. API ubl-hub baru punya /auth, jadi isi ini diganti pemanggilan API begitu
// endpoint-nya tersedia. Bentuknya mengikuti docs/tracer-study/ARSITEKTUR.md.

export const KARTU = {
  /** null berarti belum terbit. Kartu tampil "belum terbit", bukan error. */
  nomor: "IF2610001" as string | null,
  tahunLulus: 2026,
  /** Syarat terbit: punya Professional Passport dan ada di daftar wisuda. */
  syarat: { passport: true, wisuda: true },
};
