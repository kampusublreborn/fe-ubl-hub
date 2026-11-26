import { Suspense } from "react";
import { currentUser } from "@/features/auth";
import { AdminTracer } from "@/features/admin";

export const metadata = { title: "Respons Tracer | UBL Hub" };
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
async function Content({ searchParams }: Props) {
  const user = await currentUser();
  const query = await searchParams;
  const id = (value: string | string[] | undefined) =>
    typeof value === "string" &&
    /^[1-9]\d*$/.test(value) &&
    Number.isSafeInteger(Number(value))
      ? value
      : "";
  return (
    <AdminTracer
      canFilterProdi={user.role === "admin-biro-bpkha"}
      initialPeriode={id(query.periode_id)}
      initialProdi={id(query.prodi_id)}
    />
  );
}
export default function Page({ searchParams }: Props) {
  return (
    <Suspense fallback={<p role="status">Memuat respons tracer…</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
