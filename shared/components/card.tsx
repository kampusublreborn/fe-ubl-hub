import Link from "next/link";
import { focusRing } from "@/shared/lib/ui";
import { Icon } from "./icons";

export function Card({
  id,
  title,
  action,
  children,
}: {
  id: string;
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="h-full rounded-2xl border border-hub-line bg-white p-5 transition-shadow duration-200 hover:shadow-[0_8px_24px_-12px_rgba(15,27,61,0.25)] sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={id} className="scroll-mt-6 text-base font-semibold">
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className={`group -my-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-hub-teal-dark hover:underline ${focusRing}`}
          >
            {action.label}
            <Icon
              name="arrow"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
