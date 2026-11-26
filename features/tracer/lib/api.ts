import { cookies } from "next/headers";
import { connection } from "next/server";
import { COOKIE_NAME } from "@/features/auth";
import type { Respons, StatusTracer } from "./types";

async function ambil<T>(path: string): Promise<T | null> {
  // Ringkasan beranda dan tracer memakai data sesi; tunggu request sebelum fetch.
  await connection();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const api = process.env.HUB_API_URL;
  if (!token || !api) return null;
  try {
    const r = await fetch(`${api}/tracer/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

/** Periode yang sedang dibuka dan keadaan respons alumni. Harus dipanggil di dalam <Suspense>. */
export const getStatusTracer = () => ambil<StatusTracer>("status");

/** Instrumen, jawaban (termasuk usulan sistem), dan progres. Null bila belum memulai. */
export const getResponsTracer = () => ambil<Respons>("respons");

export type RingkasTracer =
  | { keadaan: "TIDAK_ADA" }
  | { keadaan: "BELUM_MULAI"; periode: string }
  | {
      keadaan: "BERJALAN" | "INTI_TERKIRIM" | "SELESAI";
      total: number;
      selesai: number;
      berikutnya: { nomor: number; judul: string | null } | null;
    }
  | null;

/** Ringkasan untuk beranda. Null bila API tidak dapat dihubungi. Panggil di dalam <Suspense>. */
export async function getRingkasTracer(): Promise<RingkasTracer> {
  const status = await getStatusTracer();
  if (!status) return null;
  if (!status.periode) return { keadaan: "TIDAK_ADA" };
  if (!status.respons) return { keadaan: "BELUM_MULAI", periode: status.periode.nama };

  const r = await getResponsTracer();
  if (!r) return null;
  const langkah = r.langkah.filter((l) => l.total > 0);
  const terkirim = status.respons.status !== "DRAFT" && status.respons.status !== "PERLU_REVISI";
  const selesai = (l: (typeof langkah)[number]) =>
    terkirim || (l.terisi > 0 && l.wajibBelumDiisi.length === 0 && l.perluKonfirmasi.length === 0);
  const berikutnya = langkah.find((l) => !selesai(l)) ?? null;
  const intiTerkirim = !terkirim && !!status.respons.inti_dikirim_at;
  return {
    keadaan: terkirim ? "SELESAI" : intiTerkirim ? "INTI_TERKIRIM" : "BERJALAN",
    total: langkah.length,
    selesai: langkah.filter(selesai).length,
    berikutnya: berikutnya ? { nomor: berikutnya.nomor, judul: berikutnya.judul } : null,
  };
}
