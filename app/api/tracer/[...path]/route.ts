import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/features/auth";

// Perantara ke API ubl-hub. Token tersimpan di cookie HttpOnly, jadi browser tidak bisa memanggil
// API langsung. Hanya bagian /tracer milik alumni yang diteruskan, bukan /tracer-admin.
const API_URL = process.env.HUB_API_URL;
const BOLEH = new Set(["status", "mulai", "respons", "range", "master"]);

async function teruskan(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  if (!API_URL) {
    return Response.json({ message: "Alamat API belum diatur (HUB_API_URL)" }, { status: 500 });
  }
  if (!path.length || !BOLEH.has(path[0]!)) {
    return Response.json({ message: "Tidak ditemukan" }, { status: 404 });
  }

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const metode = request.method;
  const adaBody = metode === "POST" || metode === "PUT";
  let res: Response;
  try {
    // Query string ikut diteruskan (mis. /master/kabupaten?provinsi=11).
    const query = new URL(request.url).search;
    res = await fetch(`${API_URL}/tracer/${path.map(encodeURIComponent).join("/")}${query}`, {
      method: metode,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(adaBody ? { "Content-Type": "application/json" } : {}),
      },
      body: adaBody ? await request.text() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    return Response.json(
      { message: "Server tidak dapat dihubungi. Coba lagi sebentar." },
      { status: 502 },
    );
  }

  const json = await res.json().catch(() => null);
  // Pesan galat 5xx dari API bisa memuat detail internal, jadi tidak diteruskan.
  if (res.status >= 500) {
    return Response.json({ message: "Terjadi gangguan pada server. Coba lagi sebentar." }, { status: 502 });
  }
  return Response.json(json ?? {}, { status: res.status });
}

export const GET = teruskan;
export const POST = teruskan;
export const PUT = teruskan;
