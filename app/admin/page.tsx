import type { Metadata } from "next";
import { Suspense } from "react";
import { currentUser, displayName } from "@/features/auth";
import { AdminDashboard } from "@/features/admin";

export const metadata: Metadata = { title: "Dashboard Admin | UBL Hub" };
async function Content() {
  const user = await currentUser();
  return (
    <AdminDashboard
      nama={displayName(user)}
      isBpkha={user.role === "admin-biro-bpkha"}
      prodi={user.prodi?.nama}
    />
  );
}
export default function AdminPage() {
  return (
    <Suspense fallback={<p role="status">Memuat dashboard admin…</p>}>
      <Content />
    </Suspense>
  );
}
