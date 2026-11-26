import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { COOKIE_NAME, decodeToken, isExpired, rejectReason } from "./token";

/**
 * Pengguna dari cookie sesi. Membaca cookie berarti harus dipanggil dari komponen di dalam
 * <Suspense> (Cache Components). proxy.ts sudah menolak sesi yang hilang atau kedaluwarsa.
 */
export async function currentUser() {
  // Pengecekan waktu kedaluwarsa harus menunggu request, termasuk saat prefetch.
  await connection();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const user = token ? decodeToken(token) : null;
  if (!user || isExpired(user) || rejectReason(user)) redirect("/login");
  return user;
}
