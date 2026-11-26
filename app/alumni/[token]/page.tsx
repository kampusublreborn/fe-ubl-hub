import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfilCard, getProfilPublik } from "@/features/alumni-profile";

export const metadata: Metadata = {
  title: "Profil Alumni | UBL Hub",
  // Halaman ini tidak untuk diindeks mesin pencari.
  robots: { index: false, follow: false },
};

export default function ProfilAlumniPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <div className="min-h-dvh bg-hub-canvas text-hub-ink">
      <Suspense
        fallback={
          <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
            <div
              aria-hidden="true"
              className="h-80 w-full rounded-3xl bg-hub-line motion-safe:animate-pulse"
            />
          </div>
        }
      >
        <Isi params={params} />
      </Suspense>
    </div>
  );
}

async function Isi({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const p = await getProfilPublik(token);

  if (!p) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
      <section
        role="alert"
        className="w-full rounded-3xl border border-hub-line bg-white p-6 text-center"
      >
        <h1 className="text-lg font-semibold">Profil tidak ditemukan</h1>
        <p className="mt-2 text-sm text-hub-muted">
          Kode QR ini tidak valid atau alumni belum terdaftar. Minta alumni menunjukkan
          kartu terbarunya.
        </p>
      </section>
      </main>
    );
  }

  return <ProfilCard p={p} />;
}
