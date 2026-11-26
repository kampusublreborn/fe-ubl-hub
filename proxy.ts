import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_NAME,
  cookieOptions,
  decodeToken,
  isExpired,
  isAdmin,
  homePath,
  rejectReason,
} from "./features/auth";
import { WELCOME_COOKIE } from "./features/welcome";

// Perpanjang sesi bila sisa masa berlakunya kurang dari 7 hari.
const REFRESH_BELOW_SECONDS = 7 * 24 * 60 * 60;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = token ? decodeToken(token) : null;
  const valid = !!token && !!user && !isExpired(user) && !rejectReason(user);
  const isLoginPage = pathname === "/login";

  // Profil alumni dari QR dibuka publik, tanpa login dan tanpa layar sambutan.
  if (pathname.startsWith("/alumni/")) return NextResponse.next();

  if (!valid && !isLoginPage) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    if (token) res.cookies.delete(COOKIE_NAME);
    return res;
  }

  if (valid && isLoginPage) {
    return NextResponse.redirect(new URL(homePath(user!), request.url));
  }

  const admin = !!user && isAdmin(user);
  const onAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (valid && ((admin && !onAdmin) || (!admin && onAdmin))) {
    return NextResponse.redirect(new URL(homePath(user!), request.url));
  }

  // Layar sambutan tampil sekali per pengguna per browser.
  if (valid && user && !admin) {
    const seen = request.cookies.get(WELCOME_COOKIE)?.value === String(user.id);
    const onWelcome = pathname === "/welcome";
    if (!seen && !onWelcome) {
      return NextResponse.redirect(new URL("/welcome", request.url));
    }
    if (seen && onWelcome) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const res = NextResponse.next();

  if (valid && user && token && process.env.HUB_API_URL) {
    const remaining = user.exp - Math.floor(Date.now() / 1000);
    if (remaining < REFRESH_BELOW_SECONDS) {
      try {
        const r = await fetch(`${process.env.HUB_API_URL}/auth/verify`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: AbortSignal.timeout(3000),
        });
        if (r.ok) {
          const json = await r.json();
          const fresh: unknown = json?.data?.token;
          const freshUser = typeof fresh === "string" ? decodeToken(fresh) : null;
          if (typeof fresh === "string" && freshUser) {
            res.cookies.set(COOKIE_NAME, fresh, cookieOptions(freshUser.exp));
          }
        }
      } catch {
        // Gagal memperpanjang tidak boleh menghalangi halaman. Coba lagi di permintaan berikutnya.
      }
    }
  }

  return res;
}

export const config = {
  // Jalankan di semua halaman, kecuali route handler, aset Next.js, dan berkas statis.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
