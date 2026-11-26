import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/features/auth";
import { AdminPeriode } from "@/features/admin";

export const metadata = { title: "Periode Tracer | UBL Hub" };
async function Content() {
  const user = await currentUser();
  if (user.role !== "admin-biro-bpkha") redirect("/admin");
  return <AdminPeriode />;
}
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Memuat pengaturan periode…</p>}>
      <Content />
    </Suspense>
  );
}
