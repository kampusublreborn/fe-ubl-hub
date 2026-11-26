export type InstrumenOpsi = {
  id: number;
  kode: string;
  versi: string;
  terkunci: boolean;
};
export type PeriodeAdmin = {
  id: number;
  nama: string;
  aktif: boolean;
  tahun_lulus: number | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  instrumen_versi_id: number;
  instrumen_versi: { kode: string; versi: string };
  _count: { respons: number };
};
export type PeriodeInput = {
  nama: string;
  instrumen: string;
  mulai: string;
  selesai: string;
  tahun: string;
};
export type PeriodeErrors = Partial<Record<keyof PeriodeInput, string>>;

function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

export function validasiPeriode(input: PeriodeInput): PeriodeErrors {
  const errors: PeriodeErrors = {};
  if (!input.nama.trim()) errors.nama = "Nama periode wajib diisi.";
  if (
    !/^[1-9]\d*$/.test(input.instrumen) ||
    !Number.isSafeInteger(Number(input.instrumen))
  )
    errors.instrumen = "Pilih instrumen tracer.";
  if (!validDate(input.mulai)) errors.mulai = "Isi tanggal mulai yang valid.";
  if (!validDate(input.selesai))
    errors.selesai = "Isi tanggal selesai yang valid.";
  if (!errors.mulai && !errors.selesai && input.selesai < input.mulai)
    errors.selesai = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
  if (
    input.tahun &&
    (!/^\d{4}$/.test(input.tahun) || Number(input.tahun) < 1900)
  )
    errors.tahun =
      "Isi tahun lulusan dengan 4 digit (minimal 1900), atau kosongkan.";
  return errors;
}

/** Tanggal kampus memakai WIB; hari terakhir mencakup sampai akhir hari. */
export function payloadPeriode(input: PeriodeInput) {
  return {
    nama: input.nama.trim(),
    instrumen_versi_id: Number(input.instrumen),
    tanggal_mulai: new Date(`${input.mulai}T00:00:00+07:00`).toISOString(),
    tanggal_selesai: new Date(
      `${input.selesai}T23:59:59.999+07:00`,
    ).toISOString(),
    ...(input.tahun ? { tahun_lulus: Number(input.tahun) } : {}),
  };
}

export function tanggalPeriode(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}
