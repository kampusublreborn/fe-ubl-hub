import { Icon } from "@/shared/components/icons";

export function PoinKontribusi({ skor }: { skor: number }) {
  const poin = skor.toLocaleString("id-ID");
  return (
    <div className="mt-3 space-y-1">
      <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-hub-sand/15 px-3 py-1.5 text-base font-semibold text-hub-ink">
        <Icon name="star" className="size-5 shrink-0" />
        <span className="tabular-nums">{poin} poin</span>
      </span>
      <p className="text-sm text-hub-muted">{poin} hari aktif berkontribusi melalui logbook</p>
    </div>
  );
}
