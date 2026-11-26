// Dipakai di route handler, proxy, dan server component. Tidak boleh memakai API browser.

export const COOKIE_NAME = "hub_token";

/** Isi token yang diterbitkan engine login lms-server (sebagian). */
export type HubUser = {
  id: number;
  username: string;
  role: string;
  exp: number;
  mahasiswa?: { id: number; nama: string; npm: string; status: string };
  dosen?: { nama: string };
  karyawan?: { nama: string };
  admin_prodi?: { nama: string };
  admin_tlc?: { nama: string };
  admin_biro?: { nama: string; biro: string };
  prodi?: { id: number; nama: string };
};

/**
 * Membaca isi token TANPA memverifikasi tanda tangan. Hanya untuk menampilkan
 * UI dan mengecek masa berlaku. Keabsahan token dipastikan oleh API ubl-hub.
 */
export function decodeToken(token: string): HubUser | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    if (!payload || typeof payload.exp !== "number" || !payload.role) {
      return null;
    }
    return payload as HubUser;
  } catch {
    return null;
  }
}

export function isExpired(user: HubUser): boolean {
  return user.exp * 1000 <= Date.now();
}

export function displayName(user: HubUser): string {
  return (
    user.mahasiswa?.nama ??
    user.dosen?.nama ??
    user.karyawan?.nama ??
    user.admin_prodi?.nama ??
    user.admin_tlc?.nama ??
    user.admin_biro?.nama ??
    user.username
  );
}

/**
 * Aturan masuk ke ubl-hub di sisi tampilan. Mengembalikan pesan penolakan,
 * atau null bila boleh masuk. Penegakan akses yang sebenarnya ada di API.
 */
export function rejectReason(user: HubUser): string | null {
  if (user.role === "mahasiswa" && user.mahasiswa?.status !== "LULUS") {
    return "Akun ini belum berstatus lulus. UBL Hub hanya untuk alumni.";
  }
  if (user.role !== "mahasiswa" && !isAdmin(user)) {
    return "Role akun ini belum memiliki akses ke UBL Hub.";
  }
  return null;
}

export function isAdmin(user: Pick<HubUser, "role">): boolean {
  return user.role === "admin-prodi" || user.role === "admin-biro-bpkha";
}

export function homePath(user: Pick<HubUser, "role">): string {
  return isAdmin(user) ? "/admin" : "/";
}

export function cookieOptions(exp: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(exp * 1000),
  };
}
