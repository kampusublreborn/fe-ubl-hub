import type { Butir, Jawaban, Kondisi, RangeOpsi, StatusJawaban } from "./types";

/** Panggilan ke perantara /api/tracer dari browser. Melempar Error berisi pesan dari server. */
export async function panggil<T = unknown>(
  metode: "GET" | "POST" | "PUT",
  path: string,
  body?: unknown,
): Promise<T> {
  const r = await fetch(`/api/tracer/${path}`, {
    method: metode,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const json = await r.json().catch(() => null);
  if (!r.ok) {
    throw Object.assign(new Error(json?.message ?? "Permintaan gagal"), { status: r.status, data: json });
  }
  return json as T;
}

const sama = (a: unknown, b: unknown) =>
  Array.isArray(a) ? a.some((x) => String(x) === String(b)) : String(a) === String(b);

/** Sama dengan evaluasiKondisi di API. Dipakai hanya untuk memilih teks varian pertanyaan. */
export function cocok(k: Kondisi, nilai: Record<string, unknown>): boolean {
  if ("semua" in k) return k.semua.every((x) => cocok(x, nilai));
  if ("salah_satu" in k) return k.salah_satu.some((x) => cocok(x, nilai));
  const v = nilai[k.kode];
  const ada = v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
  switch (k.op) {
    case "ada":
      return ada;
    case "kosong":
      return !ada;
    case "eq":
      return ada && sama(v, k.nilai);
    case "ne":
      return !ada || !sama(v, k.nilai);
    case "in":
      return ada && Array.isArray(k.nilai) && k.nilai.some((x) => sama(v, x));
    case "nin":
      return !ada || !Array.isArray(k.nilai) || !k.nilai.some((x) => sama(v, x));
  }
}

/** Teks pertanyaan, memakai varian yang syaratnya terpenuhi (mis. F502 untuk bekerja atau wiraswasta). */
export function teksButir(b: Butir, nilai: Record<string, unknown>): string {
  return b.varian_teks?.find((v) => cocok(v.jika, nilai))?.teks ?? b.teks;
}

export const ratakan = (butir: Butir[]): Butir[] => butir.flatMap((b) => [b, ...ratakan(b.anak ?? [])]);

export const petaNilai = (jawaban: Jawaban[]): Record<string, unknown> =>
  Object.fromEntries(jawaban.map((j) => [j.kode, j.nilai]));

/** Tulisan yang dibaca manusia untuk satu jawaban, dipakai di ringkasan. */
export function labelNilai(b: Butir, nilai: unknown, range: RangeOpsi[] = []): string {
  if (b.tipe === "PILIHAN_TUNGGAL") return b.opsi?.find((o) => String(o.nilai) === String(nilai))?.label ?? String(nilai);
  if (b.tipe === "PILIHAN_GANDA" && Array.isArray(nilai)) {
    return nilai.map((n) => b.opsi?.find((o) => String(o.nilai) === String(n))?.label ?? String(n)).join(", ");
  }
  if (b.tipe === "RANGE") return range.find((r) => r.id === nilai)?.label ?? "Terpilih";
  if (b.tipe === "SKALA") return `${nilai} dari ${b.max ?? 5}`;
  return String(nilai);
}

export const labelSumber = (sumber: Jawaban["sumber"], status: StatusJawaban) => {
  if (status === "KONFIRMASI") return { teks: "Dikonfirmasi", warna: "teal" as const };
  if (status === "DIUBAH") return { teks: "Anda ubah", warna: "navy" as const };
  if (status === "USULAN") {
    const teks =
      sumber === "PASSPORT" ? "Dari passport" : sumber === "LMS" ? "Dari data Anda" : "Disarankan";
    return { teks, warna: "sand" as const };
  }
  return null;
};
