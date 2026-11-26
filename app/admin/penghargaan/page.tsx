import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/features/auth";
import { PenghargaanAdmin } from "@/features/alumni-of-the-month";
export const metadata = { title: "Penghargaan Alumni | UBL Hub" };
async function Content() { const user = await currentUser(); if (user.role !== "admin-biro-bpkha") redirect("/admin"); return <PenghargaanAdmin />; }
export default function Page() { return <Suspense fallback={<p>Memuat...</p>}><Content /></Suspense>; }
