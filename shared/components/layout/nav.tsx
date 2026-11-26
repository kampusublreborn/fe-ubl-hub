import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/shared/components/logout-button";
import { Icon, type IconName } from "@/shared/components/icons";
import { NotificationBell } from "@/shared/components/notification-bell";
import { GlobalSearch } from "@/shared/components/global-search";

type Item = { href: string; label: string; short?: string; icon: IconName };

// Rute selain "/" belum ada. Tautannya mengikuti rancangan di docs/tracer-study.
const ITEMS: Item[] = [
  { href: "/", label: "Beranda", icon: "home" },
  { href: "/profil", label: "Profil", icon: "user" },
  { href: "/tracer", label: "Tracer Study", short: "Tracer", icon: "clipboard" },
  { href: "/career-path", label: "Career Path", short: "Karier", icon: "route" },
  { href: "/kartu", label: "Kartu Alumni", icon: "idcard" },
  { href: "/komunitas", label: "Komunitas", icon: "users" },
  { href: "/informasi", label: "Informasi", icon: "megaphone" },
];

// Mobile menampilkan 5 tujuan utama. Sisanya tetap terjangkau lewat kartu di beranda dan sidebar.
const MOBILE = ["/", "/tracer", "/career-path", "/komunitas", "/profil"];

export function Sidebar({ active = "/" }: { active?: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-hub-line bg-white lg:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <Image src="/ubl-logo.png" alt="" width={36} height={36} className="size-9" />
        <div className="leading-tight">
          <p className="text-base font-semibold">UBL Hub</p>
          <p className="text-xs text-hub-muted">Alumni UBL</p>
        </div>
      </div>
      <nav aria-label="Menu utama" className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {ITEMS.map((it) => {
            const isActive = it.href === active;
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-full px-4 text-[0.95rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-navy ${
                    isActive
                      ? "bg-hub-navy/10 font-semibold text-hub-navy"
                      : "font-medium text-hub-ink hover:bg-hub-canvas"
                  }`}
                >
                  <Icon name={it.icon} />
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-col gap-3 px-4 pb-5">
        <LogoutButton />
        <p className="px-2 text-xs text-hub-muted">© Universitas Bandar Lampung</p>
      </div>
    </aside>
  );
}

export function BottomNav({ active = "/" }: { active?: string }) {
  const items = ITEMS.filter((i) => MOBILE.includes(i.href));
  return (
    <nav
      aria-label="Menu utama"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-hub-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((it) => {
          const isActive = it.href === active;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.75rem] font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-hub-navy ${
                  isActive ? "text-hub-navy" : "text-hub-muted"
                }`}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                    isActive ? "bg-hub-navy/10" : ""
                  }`}
                >
                  <Icon name={it.icon} className="size-5" />
                </span>
                {it.short ?? it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Bilah atas mobile: tetap terlihat saat menggulir, seperti aplikasi media sosial. */
export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b border-hub-line bg-white/90 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-2.5">
        <Image src="/ubl-logo.png" alt="" width={30} height={30} className="size-[30px]" />
        <span className="hidden text-base font-semibold tracking-tight sm:inline">UBL Hub</span>
      </div>
      <div className="flex items-center gap-2"><GlobalSearch /><NotificationBell /><span className="lg:hidden"><LogoutButton /></span></div>
    </header>
  );
}
