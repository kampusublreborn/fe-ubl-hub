import { ambilDariApi } from "@/features/hub-api";
import type { Halaman, Logbook } from "./types";

/** Umpan semua alumni. Panggil di dalam <Suspense>. */
export const getUmpan = (limit = 20) => ambilDariApi<Halaman<Logbook>>(`logbook?limit=${limit}`);

/** Logbook milik alumni yang sedang masuk. Panggil di dalam <Suspense>. */
export const getLogbookSaya = (limit = 20) =>
  ambilDariApi<Halaman<Logbook>>(`logbook/saya?limit=${limit}`);
