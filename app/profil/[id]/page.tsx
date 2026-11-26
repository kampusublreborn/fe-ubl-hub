import type { Metadata } from "next";
import { ProfilAlumniPage } from "@/features/alumni-profile";

export const metadata: Metadata = { title: "Profil alumni | UBL Hub" };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ProfilAlumniPage params={params} />;
}
