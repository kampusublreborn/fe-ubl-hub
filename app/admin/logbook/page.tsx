import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/features/auth";
import { AdminLogbook } from "@/features/admin";

export const metadata = { title: "Pantauan Komunitas | UBL Hub" };

async function Content({ searchParams }: { searchParams: Promise<{ dilaporkan?: string }> }) {
  const user = await currentUser();
  if (user.role !== "admin-biro-bpkha") redirect("/admin");
  const { dilaporkan } = await searchParams;
  return <AdminLogbook hanyaDilaporkan={dilaporkan === "1"} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ dilaporkan?: string }> }) {
  return (
    <Suspense fallback={<p role="status">Memuat pantauan komunitas…</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
