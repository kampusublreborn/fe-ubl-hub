"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/shared/components/icons";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";

/** Menyusun atau memperbarui Career Path lewat AI. Prosesnya bisa memakan waktu sekitar satu menit. */
export function SusunButton({
  perbarui,
  bisa,
  alasan,
}: {
  perbarui: boolean;
  bisa: boolean;
  alasan: string | null;
}) {
  const router = useRouter();
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function susun() {
    setGalat(null);
    setProses(true);
    try {
      await panggilApi("career-path", "POST", "susun");
      router.refresh();
    } catch (e) {
      setGalat(pesanGalat(e, "Career Path belum berhasil disusun. Coba lagi."));
    } finally {
      setProses(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={susun}
        disabled={!bisa || proses}
        aria-describedby={!bisa && alasan ? "susun-alasan" : undefined}
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold transition active:scale-[0.98] motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-60 sm:self-start ${
          perbarui
            ? "border border-hub-line bg-white hover:bg-hub-canvas"
            : "bg-hub-navy text-white"
        } ${focusRing}`}
      >
        <Icon name="sparkle" className="size-5" />
        {proses ? "Menyusun, mohon tunggu..." : perbarui ? "Perbarui Career Path" : "Susun Career Path"}
      </button>
      {proses && (
        <p role="status" className="text-sm text-hub-muted">
          AI sedang membaca logbook Anda. Ini bisa memakan waktu sampai satu menit, jangan tutup halaman.
        </p>
      )}
      {!bisa && alasan && !proses && (
        <p id="susun-alasan" className="text-sm text-hub-muted">
          {alasan}
        </p>
      )}
      {galat && (
        <p role="alert" className="text-sm text-red-700">
          {galat}
        </p>
      )}
    </div>
  );
}
