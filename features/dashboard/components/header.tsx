import { currentUser, displayName } from "@/features/auth";
import { getKartu } from "@/features/kartu";
import { Avatar } from "@/shared/components/avatar";

/* ---------------------------------------------------------------- Header profil */

export async function Header() {
  const user = await currentUser();
  const nama = displayName(user);
  const prodi = user.prodi?.nama;
  const npm = user.mahasiswa?.npm;
  const tahunLulus = (await getKartu())?.tahunLulus;

  return (
    <header className="overflow-hidden rounded-2xl border border-hub-line bg-white">
      {/* Sampul bermotif sama dengan halaman login dan sambutan. */}
      <div
        aria-hidden="true"
        className="h-28 bg-hub-navy sm:h-36"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.14) 1.4px, transparent 1.6px), linear-gradient(120deg, transparent 55%, rgba(224,161,0,0.9) 55% 70%, transparent 70%)",
          backgroundSize: "22px 22px, 100% 100%",
        }}
      />
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <Avatar nama={nama} className="-mt-10 size-20 text-2xl ring-4 ring-white sm:-mt-12 sm:size-24 sm:text-3xl" />
        <h1 className="mt-3 text-balance text-xl font-semibold tracking-tight sm:text-2xl">{nama}</h1>
        <p className="mt-1 text-sm text-hub-muted [overflow-wrap:anywhere]">
          {[prodi, npm, tahunLulus ? `Lulus ${tahunLulus}` : null].filter(Boolean).join(" · ")}
        </p>
      </div>
    </header>
  );
}

export function HeaderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-64 rounded-2xl border border-hub-line bg-white motion-safe:animate-pulse"
    />
  );
}
