export type Informasi = {
 gambar?: { id: number; updated_at: string } | null;
 id: number; judul: string; isi: string; kategori: "PELUANG_KARIER" | "INFORMASI";
 tautan: string | null; mulai_at: string; selesai_at: string | null; status: "DRAFT" | "TERBIT";
};
export type HalamanInformasi = { data: Informasi[]; cursorBerikutnya: number | null };
export const kategoriLabel = (v: string) => v === "PELUANG_KARIER" ? "Peluang karier" : "Informasi";
export const tanggalInformasi = (v: string) => new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
