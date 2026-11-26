import { Suspense } from "react";
import { currentUser, displayName } from "@/features/auth";
import { Shell } from "@/shared/components/layout/shell";
import { getDetailGrup, getPostGrup } from "../lib/api";
import { GrupDetail } from "./grup-detail";

function Skeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">Memuat grup</span>
      <div aria-hidden="true" className="h-48 rounded-2xl bg-hub-line/70 motion-safe:animate-pulse" />
      <div aria-hidden="true" className="h-32 rounded-2xl bg-hub-line/70 motion-safe:animate-pulse" />
    </div>
  );
}

async function Isi({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab } = await searchParams;
  if (!/^[1-9]\d*$/.test(id)) return <p role="alert" className="rounded-2xl border border-hub-line bg-white p-5 text-sm">Grup tidak ditemukan.</p>;

  const user = await currentUser();
  const grup = await getDetailGrup(Number(id));
  if (!grup) {
    return <p role="alert" className="rounded-2xl border border-hub-line bg-white p-5 text-sm">Grup tidak ditemukan, atau belum dapat dimuat. Coba muat ulang halaman.</p>;
  }
  const posts = grup.isiTerkunci ? null : await getPostGrup(grup.id);
  return <GrupDetail grup={grup} posts={posts} nama={displayName(user)} idSaya={user.mahasiswa?.id} tabAwal={tab} />;
}

/** Halaman satu grup. Dipakai juga sebagai tujuan notifikasi (`?tab=anggota`). */
export function GrupPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  return (
    <Shell active="/komunitas" fab={false}>
      {/* Membaca cookie sesi, jadi harus di dalam Suspense (Cache Components). */}
      <Suspense fallback={<Skeleton />}>
        <Isi params={params} searchParams={searchParams} />
      </Suspense>
    </Shell>
  );
}
