import { cookies } from "next/headers";
import { connection } from "next/server";
import { COOKIE_NAME } from "@/features/auth";

/** GET ke API ubl-hub dari server component. Null bila tidak ada sesi atau API tidak dapat dihubungi. */
export async function ambilDariApi<T>(path: string): Promise<T | null> {
  await connection();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const api = process.env.HUB_API_URL;
  if (!token || !api) return null;
  try {
    const r = await fetch(`${api}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}
