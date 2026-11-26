// Penanda "layar sambutan sudah dilihat". Disimpan per browser, bernilai id pengguna
// supaya akun lain di browser yang sama tetap melihatnya sekali. Tidak dihapus saat logout.

export const WELCOME_COOKIE = "hub_welcome";

export function welcomeCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}
