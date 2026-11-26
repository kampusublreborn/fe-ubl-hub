import type { StatusRespons } from "@/features/tracer";
import type { AdminRow } from "./api";

export type DashboardData = {
  periode: {
    id: number;
    nama: string;
    aktif: boolean;
    tanggal_mulai: string;
    tanggal_selesai: string;
    tahun_lulus: number | null;
  } | null;
  total: number;
  status: Record<StatusRespons, number>;
  terbaru: AdminRow[];
};
