import { ambilDariApi } from "@/features/hub-api";
import type { DetailGrup, Halaman, KartuGrup, Post } from "./types";

/** Semua fungsi ini membaca cookie sesi: panggil di dalam <Suspense>. */
export const getGrupSaya = () => ambilDariApi<Halaman<KartuGrup>>("komunitas?saya=1&limit=50");
export const getGrupJelajah = () => ambilDariApi<Halaman<KartuGrup>>("komunitas?limit=20");
export const getSaran = () => ambilDariApi<{ orientasi: string | null; data: KartuGrup[] }>("komunitas/saran");
export const getUndangan = () => ambilDariApi<KartuGrup[]>("komunitas/undangan");
export const getDetailGrup = (id: number) => ambilDariApi<DetailGrup>(`komunitas/${id}`);
export const getPostGrup = (id: number) => ambilDariApi<Halaman<Post>>(`komunitas/${id}/post?limit=20`);
