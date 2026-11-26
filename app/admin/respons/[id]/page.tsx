import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AdminRespons } from "@/features/admin";

export const metadata = { title: "Tinjau Respons | UBL Hub" };
async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  return <AdminRespons key={id} id={id} />;
}
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p role="status">Memuat respons…</p>}>
      <Detail params={params} />
    </Suspense>
  );
}
