import type { StatusRespons } from "@/features/tracer";
import { statuses } from "../lib/api";

export function StatusBadge({ status }: { status: StatusRespons }) {
  const colors =
    status === "DIVERIFIKASI" || status === "DILAPORKAN"
      ? "bg-hub-teal/10 text-hub-teal-dark"
      : status === "DIKIRIM"
        ? "bg-hub-navy/10 text-hub-navy"
        : status === "PERLU_REVISI"
          ? "bg-amber-50 text-amber-900"
          : "bg-hub-canvas text-hub-muted";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colors}`}
    >
      {statuses[status]}
    </span>
  );
}
