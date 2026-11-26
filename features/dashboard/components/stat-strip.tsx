import { Icon, type IconName } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";

export function StatStrip({
  tracer,
  langkah = "-",
  skor = null,
  grup = "-",
}: {
  tracer: string;
  langkah?: string;
  skor?: number | null;
  grup?: string;
}) {
  const stats: {
    href: string;
    icon: IconName;
    nilai: string;
    label: string;
  }[] = [
    {
      href: "#tracer",
      icon: "clipboard",
      nilai: tracer,
      label: "Langkah tracer",
    },
    {
      href: "#kecocokan",
      icon: "target",
      nilai: skor === null ? "-" : `${skor}`,
      label: "Skor kecocokan",
    },
    {
      href: "#career",
      icon: "award",
      nilai: langkah,
      label: "Langkah karier",
    },
    {
      href: "/komunitas",
      icon: "users",
      nilai: grup,
      label: "Group diikuti",
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((s, i) => (
        <li key={s.href} className="hub-rise" style={{ "--i": i + 1 } as React.CSSProperties}>
          <a
            href={s.href}
            className={`group flex min-h-20 items-center gap-3 rounded-2xl border border-hub-line bg-white p-4 transition-all duration-200 hover:border-hub-navy/40 hover:shadow-[0_8px_24px_-12px_rgba(15,27,61,0.3)] motion-safe:hover:-translate-y-0.5 active:bg-hub-canvas ${focusRing}`}
          >
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-hub-canvas text-hub-navy transition-colors group-hover:bg-hub-navy group-hover:text-white"
            >
              <Icon name={s.icon} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xl font-semibold tabular-nums leading-tight">
                {s.nilai}
              </span>
              <span className="block text-sm text-hub-muted">{s.label}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
