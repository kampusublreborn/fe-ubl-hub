import Link from "next/link";
import { Icon } from "@/shared/components/icons";
import { Shell } from "@/shared/components/layout/shell";
import { focusRing } from "@/shared/lib/ui";
import { GrupForm } from "./grup-form";

const TIPS = [
  "Pilih nama yang jelas, misalnya berdasarkan profesi atau bidang.",
  "Grup publik cocok untuk topik terbuka. Pilih privat bila ingin menyaring anggota.",
  "Anda otomatis menjadi admin. Anggota lain bisa dijadikan moderator.",
  "Maksimal 3 grup baru per hari.",
];

export function GrupBaruPage() {
  return (
    <Shell
      active="/komunitas"
      fab={false}
      rail={
        <section aria-labelledby="tips-grup" className="rounded-2xl border border-hub-line bg-white p-5">
          <h2 id="tips-grup" className="text-base font-semibold">
            Tips membuat grup
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {TIPS.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm text-hub-muted">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-hub-teal-dark" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      }
    >
      <header className="flex items-center gap-2">
        <Link
          href="/komunitas"
          aria-label="Kembali ke komunitas"
          className={`-ml-2 flex size-11 items-center justify-center rounded-full text-hub-ink transition-colors hover:bg-white ${focusRing}`}
        >
          <Icon name="arrow" className="size-5 rotate-180" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Buat grup</h1>
      </header>
      <GrupForm />
    </Shell>
  );
}
