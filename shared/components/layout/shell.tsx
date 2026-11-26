import Link from "next/link";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { BottomNav, Sidebar, TopBar } from "./nav";

/**
 * Kerangka halaman setelah login: sidebar, konten utama, dan bottom nav mobile.
 * Bila `rail` diisi, halaman memakai tata letak umpan ala media sosial: kolom tengah sempit
 * dan panel samping di kanan (di layar kecil panel itu mengalir setelah kolom tengah).
 */
export function Shell({
  active,
  rail,
  fab = true,
  children,
}: {
  active: string;
  rail?: React.ReactNode;
  /** Tombol "+" melayang di mobile untuk menulis logbook. */
  fab?: boolean;
  children: React.ReactNode;
}) {
  const umpan = rail !== undefined;
  return (
    <div className="min-h-dvh flex-1 bg-hub-canvas text-hub-ink lg:pl-64">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Lewati ke konten
      </a>
      <Sidebar active={active} />
      <TopBar />
      {umpan ? (
        <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-4 px-3 pb-28 pt-3 sm:px-6 sm:pt-5 lg:px-8 lg:pb-12 xl:grid xl:grid-cols-[minmax(0,40rem)_21rem] xl:items-start xl:justify-center xl:gap-6">
          <main id="konten" className="flex min-w-0 flex-col gap-3 sm:gap-4">
            {children}
          </main>
          <aside aria-label="Panel samping" className="flex min-w-0 flex-col gap-3 sm:gap-4 xl:sticky xl:top-5">
            {rail}
          </aside>
        </div>
      ) : (
        <main
          id="konten"
          className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-28 pt-6 sm:gap-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10"
        >
          {children}
        </main>
      )}
      {umpan && fab && (
        <Link
          href="/logbook/baru"
          aria-label="Tulis logbook"
          className={`fixed bottom-20 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-hub-navy text-white shadow-[0_8px_20px_-6px_rgba(7,25,82,0.6)] transition-transform active:scale-95 motion-reduce:transition-none lg:hidden ${focusRing}`}
        >
          <Icon name="plus" className="size-6" />
        </Link>
      )}
      <BottomNav active={active} />
    </div>
  );
}
