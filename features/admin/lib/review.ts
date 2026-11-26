import type { Butir } from "@/features/tracer";
import type { AdminDetail } from "./api";

export function kosong(nilai: unknown): boolean {
  return (
    nilai === undefined ||
    nilai === null ||
    nilai === "" ||
    (Array.isArray(nilai) && nilai.length === 0)
  );
}

/** Anak mewarisi langkah induk, dan pertanyaan tersembunyi tidak ikut ringkasan. */
export function bagianRespons(data: AdminDetail) {
  const groups = new Map<
    number,
    { nomor: number; judul: string; butir: Butir[] }
  >();
  function visit(items: Butir[], inherited = 0, parentVisible = true) {
    for (const b of items) {
      const step = b.langkah ?? inherited;
      const visible = parentVisible && data.aturan?.[b.kode]?.tampil !== false;
      if (visible && b.tipe !== "BAGIAN") {
        if (!groups.has(step))
          groups.set(step, {
            nomor: step,
            judul:
              data.instrumen?.langkah?.find((s) => s.nomor === step)?.judul ??
              (step ? `Bagian ${step}` : "Informasi tambahan"),
            butir: [],
          });
        groups.get(step)!.butir.push(b);
      }
      visit(b.anak ?? [], step, visible);
    }
  }
  visit(data.instrumen?.butir ?? []);
  return [...groups.values()].sort((a, b) => a.nomor - b.nomor);
}
