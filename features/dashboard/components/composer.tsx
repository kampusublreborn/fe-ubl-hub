import Link from "next/link";
import { currentUser, displayName } from "@/features/auth";
import { Avatar } from "@/shared/components/avatar";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";

/** Kotak "Apa kabar?" di puncak beranda. Membaca cookie sesi: bungkus dengan <Suspense>. */
export async function Composer() {
  const user = await currentUser();
  const nama = displayName(user);
  const depan = nama.split(/\s+/)[0];
  const info = [user.prodi?.nama, user.mahasiswa?.npm].filter(Boolean).join(" · ");

  return (
    <section aria-label="Tulis kabar" className="rounded-2xl border border-hub-line bg-white p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Avatar nama={nama} className="size-12 text-base" />
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">Halo, {nama}</h1>
          {info && <p className="truncate text-xs text-hub-muted">{info}</p>}
        </div>
      </div>
      <Link
        href="/logbook/baru"
        className={`mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-full bg-hub-canvas px-5 text-left text-sm text-hub-muted transition-colors hover:bg-hub-line/60 ${focusRing}`}
      >
        <span className="truncate">Apa kabar kariermu, {depan}?</span>
        <Icon name="plus" className="size-5 shrink-0 text-hub-navy" />
      </Link>
    </section>
  );
}

export function ComposerSkeleton() {
  return (
    <div aria-hidden="true" className="h-36 rounded-2xl border border-hub-line bg-white motion-safe:animate-pulse" />
  );
}
