export type Kecocokan = "SESUAI" | "SEBAGIAN" | "TIDAK_SESUAI" | "BELUM_DINILAI";

export type ButirKecocokan = {
  tingkat: "Orientasi" | "Profesi" | "Industri";
  aspirasi: string | null;
  aktual: string | null;
  hasil: Kecocokan;
  catatan: string;
};

export type HasilKecocokan = { skor: number | null; butir: ButirKecocokan[] };
