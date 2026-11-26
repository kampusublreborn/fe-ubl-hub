import { ambilDariApi } from "@/features/hub-api";
import type { HasilKecocokan } from "./types";

/** Kecocokan karier alumni. Panggil di dalam <Suspense>. */
export const getKecocokan = () => ambilDariApi<HasilKecocokan>("kecocokan/saya");
