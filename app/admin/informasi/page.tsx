import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/features/auth";
import { InformasiAdmin } from "@/features/informasi";
export const metadata = { title: "Kelola Informasi | UBL Hub" };
async function Content() { const user = await currentUser(); if(user.role !== "admin-biro-bpkha") redirect("/admin"); return <InformasiAdmin />; }
export default function Page() { return <Suspense fallback={<p>Memuat?</p>}><Content /></Suspense>; }
