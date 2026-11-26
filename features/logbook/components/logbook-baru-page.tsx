import Link from "next/link";
import { Suspense } from "react";
import { currentUser, displayName } from "@/features/auth";
import { Icon } from "@/shared/components/icons";
import { Shell } from "@/shared/components/layout/shell";
import { focusRing } from "@/shared/lib/ui";
import { LogbookForm } from "./logbook-form";

const TIPS = [
  "Tulis hal yang nyata: jabatan baru, sertifikasi, proyek, atau usaha.",
  "Sebut hasilnya, misalnya angka atau dampak, supaya Career Path lebih tepat.",
  "Jangan menulis data pribadi seperti nomor telepon atau alamat.",
];

async function FormPenulis() {
  const nama = displayName(await currentUser());
  return <LogbookForm nama={nama} />;
}

export function LogbookBaruPage() {
  return (
    <Shell
      active="/"
      fab={false}
      rail={
        <section aria-labelledby="tips" className="rounded-2xl border border-hub-line bg-white p-5">
          <h2 id="tips" className="text-base font-semibold">
            Tips menulis
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {TIPS.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm text-hub-muted">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-hub-teal-dark" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-hub-canvas px-4 py-3 text-sm text-hub-muted">
            Logbook bisa disukai dan dikomentari sesama alumni, dan dibaca untuk menyusun Career Path
            Anda.
          </p>
        </section>
      }
    >
      <header className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Kembali ke beranda"
          className={`-ml-2 flex size-11 items-center justify-center rounded-full text-hub-ink transition-colors hover:bg-white ${focusRing}`}
        >
          <Icon name="arrow" className="size-5 rotate-180" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Tulis logbook</h1>
      </header>
      {/* Membaca cookie sesi, jadi harus di dalam Suspense (Cache Components). */}
      <Suspense
        fallback={<div aria-hidden="true" className="h-96 rounded-2xl border border-hub-line bg-white motion-safe:animate-pulse" />}
      >
        <FormPenulis />
      </Suspense>
    </Shell>
  );
}
