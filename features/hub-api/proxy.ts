import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/features/auth";

type Aturan = Partial<Record<string, RegExp>>;

/**
 * Perantara ke API ubl-hub. Token ada di cookie HttpOnly, jadi browser tidak bisa memanggil API langsung.
 * Hanya metode dan path yang cocok dengan `boleh` yang diteruskan. Permintaan yang mengubah data wajib
 * berasal dari asal yang sama.
 */
export async function teruskanKeApi(
  request: Request,
  path: string[],
  opsi: { prefix: string; boleh: Aturan; timeoutMs?: number; imageCacheControl?: string },
): Promise<Response> {
  const api = process.env.HUB_API_URL;
  if (!api) return Response.json({ message: "Alamat API belum diatur (HUB_API_URL)" }, { status: 500 });

  const metode = request.method;
  const rute = path.join("/");
  if (!opsi.boleh[metode]?.test(rute)) {
    return Response.json({ message: "Tidak ditemukan" }, { status: 404 });
  }
  if (metode !== "GET" && request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ message: "Asal permintaan tidak diizinkan." }, { status: 403 });
  }

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return Response.json({ message: "Sesi berakhir. Silakan masuk kembali." }, { status: 401 });

  const adaBody = metode === "POST" || metode === "PUT" || metode === "PATCH";
  // Unggahan foto berupa byte mentah, bukan JSON.
  const jenisBody = request.headers.get("content-type") ?? "";
  const biner = adaBody && jenisBody.startsWith("image/");
  let res: Response;
  try {
    res = await fetch(`${api}/${opsi.prefix}${rute ? `/${rute}` : ""}${new URL(request.url).search}`, {
      method: metode,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(adaBody ? { "Content-Type": biner ? jenisBody : "application/json" } : {}),
      },
      body: adaBody ? (biner ? await request.arrayBuffer() : await request.text()) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(opsi.timeoutMs ?? 20000),
    });
  } catch {
    return Response.json({ message: "Server tidak dapat dihubungi. Coba lagi sebentar." }, { status: 502 });
  }

  // Foto dari API diteruskan apa adanya (hanya bila berhasil dan benar-benar gambar).
  const jenisRespons = res.headers.get("content-type") ?? "";
  if (res.ok && /^image\/(webp|jpeg|png)$/.test(jenisRespons)) {
    return new Response(res.body, {
      headers: {
        "Content-Type": jenisRespons,
        "Cache-Control": opsi.imageCacheControl ?? "private, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const json = await res.json().catch(() => null);
  // Galat 5xx dari API bisa memuat detail internal, jadi tidak diteruskan.
  if (res.status >= 500) {
    return Response.json({ message: "Terjadi gangguan pada server. Coba lagi sebentar." }, { status: 502 });
  }
  return Response.json(json ?? {}, { status: res.status });
}
