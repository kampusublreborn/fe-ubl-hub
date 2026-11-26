import { cookies } from "next/headers";
import { COOKIE_NAME, decodeToken } from "@/features/auth";
import { WELCOME_COOKIE, welcomeCookieOptions } from "@/features/welcome";

// Menandai layar sambutan sudah dilihat (selesai atau dilewati).
export async function POST() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const user = token ? decodeToken(token) : null;
  if (!user) {
    return Response.json({ message: "Sesi tidak valid" }, { status: 401 });
  }
  store.set(WELCOME_COOKIE, String(user.id), welcomeCookieOptions());
  return Response.json({ data: { ok: true } });
}
