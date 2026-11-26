import type { Jawaban } from "./types";

export type JawabanTertunda = Record<string, { urutan: number; nilai: unknown }>;

/** Respons server dapat lebih lama dari ketukan berikutnya; pertahankan semua perubahan yang belum tersimpan. */
export function gabungkanJawaban(server: Jawaban[], lokal: Record<string, Jawaban>, tertunda: JawabanTertunda): Record<string, Jawaban> {
  const hasil = Object.fromEntries(server.map((j) => [j.kode, j]));
  for (const [kode, perubahan] of Object.entries(tertunda)) {
    const sebelumnya = lokal[kode] ?? hasil[kode];
    hasil[kode] = { kode, nilai: perubahan.nilai, sumber: sebelumnya?.sumber ?? "ALUMNI", status: sebelumnya?.status ?? "DIISI" };
  }
  return hasil;
}
