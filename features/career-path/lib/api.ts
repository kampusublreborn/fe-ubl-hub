import { ambilDariApi } from "@/features/hub-api";
import type { StatusCareerPath } from "./types";

/** Keadaan Career Path alumni. Panggil di dalam <Suspense>. */
export const getCareerPath = () => ambilDariApi<StatusCareerPath>("career-path/saya");
