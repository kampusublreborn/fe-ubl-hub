import { Suspense } from "react";
import { ambilDariApi } from "@/features/hub-api";
import { Shell } from "@/shared/components/layout/shell";
import { ProfilAlumniTabs, type DataTab } from "./profil-alumni-tabs";

const kosong = (teks: string) => (
  <p role="status" className="rounded-2xl border border-hub-line bg-white p-6 text-sm text-hub-muted">
    {teks}
  </p>
);

async function Isi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) return kosong("Profil alumni tidak ditemukan.");
  const p = await ambilDariApi<DataTab>(`alumni/${id}`);
  if (!p) return kosong("Profil alumni tidak ditemukan atau belum dapat dimuat.");
  return <ProfilAlumniTabs key={p.id} data={p} />;
}

export function ProfilAlumniPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Shell active="/profil" fab={false}>
      <Suspense fallback={<div role="status" aria-label="Memuat profil" className="h-96 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
        <Isi params={params} />
      </Suspense>
    </Shell>
  );
}
