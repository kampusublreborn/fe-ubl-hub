import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  cookieOptions,
  decodeToken,
  displayName,
  homePath,
  rejectReason,
} from "@/features/auth";

const API_URL = process.env.HUB_API_URL;

export async function POST(request: Request) {
  if (!API_URL) {
    return Response.json(
      { message: "Alamat API belum diatur (HUB_API_URL)" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!username || !password) {
    return Response.json(
      { message: "Username dan password wajib diisi" },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return Response.json(
      { message: "Server tidak dapat dihubungi. Coba lagi sebentar." },
      { status: 502 },
    );
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    // Pesan galat 5xx dari API bisa memuat detail internal, jadi tidak diteruskan.
    if (res.status >= 500) {
      return Response.json(
        { message: "Terjadi gangguan pada server. Coba lagi sebentar." },
        { status: 502 },
      );
    }
    return Response.json(
      { message: json?.message ?? "Login gagal" },
      { status: res.status },
    );
  }

  const token: unknown = json?.data?.token;
  const user = typeof token === "string" ? decodeToken(token) : null;
  if (typeof token !== "string" || !user) {
    return Response.json(
      { message: "Respons server tidak sesuai" },
      { status: 502 },
    );
  }

  const reason = rejectReason(user);
  if (reason) {
    return Response.json({ message: reason }, { status: 403 });
  }

  (await cookies()).set(COOKIE_NAME, token, cookieOptions(user.exp));

  // Token tidak dikirim balik ke browser. Hanya cookie HttpOnly yang menyimpannya.
  return Response.json({
    data: { role: user.role, nama: displayName(user), redirectTo: homePath(user) },
  });
}
