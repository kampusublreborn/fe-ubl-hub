export type Langkah = { id: number; teks: string; selesai: boolean };

export type Horizon = {
  posisi: string;
  deskripsi: string;
  keterampilan: Langkah[];
  sertifikasi: Langkah[];
  langkahSelesai: number;
  langkahTotal: number;
};

export type CareerPath = {
  destinasi: string;
  ringkasan: string;
  disusunPada: string;
  dariJumlahLogbook: number;
  status: "USULAN";
  tahun1: Horizon;
  tahun3: Horizon;
};

export type StatusCareerPath = {
  keadaan: "KOSONG" | "BELUM_DISUSUN" | "ADA";
  jumlahLogbook: number;
  bisaDisusun: boolean;
  alasanBelumBisa: string | null;
  careerPath: CareerPath | null;
};

/** Jumlah langkah (keterampilan dan sertifikasi) yang sudah dan seluruhnya, untuk kedua horizon. */
export function hitungLangkah(c: CareerPath | null) {
  if (!c) return { selesai: 0, total: 0 };
  return {
    selesai: c.tahun1.langkahSelesai + c.tahun3.langkahSelesai,
    total: c.tahun1.langkahTotal + c.tahun3.langkahTotal,
  };
}
