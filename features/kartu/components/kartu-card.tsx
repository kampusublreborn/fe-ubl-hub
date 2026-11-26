import Link from "next/link";
import { currentUser, displayName } from "@/features/auth";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { appOrigin, getKartu } from "../lib/api";
import { AlumniCard } from "./alumni-card";

export async function KartuCard() {
  const user = await currentUser();
  const kartu = await getKartu();
  return (
    <section aria-labelledby="kartu" className="h-full">
      <h2 id="kartu" className="sr-only">
        Kartu alumni
      </h2>
      <AlumniCard
        data={{
          nama: kartu?.nama || displayName(user),
          prodi: kartu?.prodi ?? user.prodi?.nama ?? "Alumni UBL",
          npm: kartu?.npm ?? user.mahasiswa?.npm,
          nomor: kartu?.nomor ?? null,
          tahunLulus: kartu?.tahunLulus ?? null,
          profilUrl: kartu ? `${await appOrigin()}/alumni/${kartu.profilToken}` : undefined,
        }}
      >
        <Link
          href="/kartu"
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-hub-navy px-4 text-sm font-medium text-white transition-colors hover:bg-hub-ink active:bg-hub-ink ${focusRing}`}
        >
          Buka halaman kartu
          <Icon name="arrow" className="size-4" />
        </Link>
      </AlumniCard>
    </section>
  );
}

export function KartuCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-full min-h-52 rounded-2xl bg-hub-line motion-safe:animate-pulse"
    />
  );
}
