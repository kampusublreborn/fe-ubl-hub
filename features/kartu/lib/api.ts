import { cookies, headers } from "next/headers";
import { COOKIE_NAME } from "@/features/auth";

export type KartuAlumni = {
  /** null berarti belum terbit (data kelulusan belum lengkap atau prodi belum punya kode). */
  nomor: string | null;
  nama: string;
  npm: string;
  profilToken: string;
  prodi: string | null;
  tahunLulus: number | null;
  periodeWisuda: "GANJIL" | "GENAP" | null;
};

/** Data kartu dari API. Harus dipanggil di dalam <Suspense> karena membaca cookie. */
export async function getKartu(): Promise<KartuAlumni | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const api = process.env.HUB_API_URL;
  if (!token || !api) return null;
  try {
    const r = await fetch(`${api}/kartu/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!r.ok) return null;
    return (await r.json()) as KartuAlumni;
  } catch {
    return null;
  }
}

/** Alamat dasar aplikasi untuk tautan di QR. Utamakan HUB_APP_URL, cadangannya host permintaan. */
export async function appOrigin(): Promise<string> {
  const env = process.env.HUB_APP_URL;
  if (env) return env.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
