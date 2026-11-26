"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/shared/components/icons";

export function AdminNav({
  isBpkha,
  className = "",
}: {
  isBpkha: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: "Dashboard", icon: "home" as const },
    {
      href: "/admin/respons",
      label: "Respons Tracer",
      icon: "clipboard" as const,
    },
    ...(isBpkha
      ? [
          {
            href: "/admin/periode",
            label: "Periode Tracer",
            icon: "calendar" as const,
          },
          {
            href: "/admin/penghargaan",
            label: "Penghargaan Alumni",
            icon: "star" as const,
          },
          {
            href: "/admin/informasi",
            label: "Informasi UBL",
            icon: "clipboard" as const,
          },
          {
            href: "/admin/logbook",
            label: "Pantauan Komunitas",
            icon: "msg" as const,
          },
        ]
      : []),
  ];
  return (
    <nav aria-label="Menu admin" className={className}>
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-navy ${active ? "bg-hub-navy text-white" : "text-hub-ink hover:bg-hub-canvas"}`}
              >
                <Icon name={item.icon} className="size-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
