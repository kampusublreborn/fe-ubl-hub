"use client";

import { useId, useState } from "react";
import { Icon, type IconName } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import type { HasilKecocokan, Kecocokan } from "../lib/types";

const HASIL: Record<Kecocokan, { label: string; icon: IconName; cls: string }> = {
  SESUAI: { label: "Sesuai", icon: "check", cls: "bg-[#E3F4F1] text-[#0B5F57]" },
  SEBAGIAN: { label: "Sebagian", icon: "minus", cls: "bg-[#FFF1CC] text-[#6B4A00]" },
  TIDAK_SESUAI: { label: "Tidak sesuai", icon: "x", cls: "bg-[#FDE7E7] text-[#8F1D1D]" },
  BELUM_DINILAI: {
    label: "Belum dapat dinilai",
    icon: "clock",
    cls: "bg-hub-canvas text-hub-muted",
  },
};

function Hasil({ hasil }: { hasil: Kecocokan }) {
  const h = HASIL[hasil];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${h.cls}`}
    >
      <Icon name={h.icon} className="size-4" />
      {h.label}
    </span>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div
      role="img"
      aria-label={`Skor kecocokan ${value} dari 100`}
      className="relative size-28 shrink-0"
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E6EAF4" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#0B6B63"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="hub-ring"
          style={{ "--c": c } as React.CSSProperties}
        />
      </svg>
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        <span className="-mt-0.5 text-xs text-hub-muted">dari 100</span>
      </div>
    </div>
  );
}

function ringkasan(skor: number) {
  if (skor >= 75) return "Karier Anda sangat sejalan dengan aspirasi saat kuliah.";
  if (skor >= 40) return "Sebagian besar sejalan. Ada ruang untuk menyelaraskan lagi.";
  return "Karier Anda berbeda dari aspirasi awal. Itu wajar, dan bisa jadi pilihan Anda.";
}

export function KecocokanBody({ data }: { data: HasilKecocokan }) {
  const [open, setOpen] = useState<string | null>(null);
  const baseId = useId();
  const skor = data.skor;

  return (
    <>
      <div className="mb-5 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        {skor !== null ? (
          <>
            <Gauge value={skor} />
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold">Skor kecocokan</p>
              <p className="mt-1 max-w-sm text-sm text-hub-muted">{ringkasan(skor)}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-hub-muted">
            Belum dapat dinilai. Lengkapi tracer study dan Professional Passport Anda.
          </p>
        )}
      </div>

      <ul className="divide-y divide-hub-line border-t border-hub-line">
        {data.butir.map((k) => {
          const isOpen = open === k.tingkat;
          const panel = `${baseId}-${k.tingkat}`;
          return (
            <li key={k.tingkat}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => setOpen(isOpen ? null : k.tingkat)}
                  className={`group flex min-h-14 w-full cursor-pointer flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg px-1 py-3 text-left transition-colors hover:bg-hub-canvas ${focusRing}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{k.tingkat}</span>
                    <span className="block text-sm text-hub-muted [overflow-wrap:anywhere]">
                      {k.aspirasi ?? "belum ada"} <span aria-label="menjadi">→</span> {k.aktual ?? "belum diisi"}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Hasil hasil={k.hasil} />
                    <Icon
                      name="chevron"
                      className={`size-4 text-hub-muted transition-transform duration-200 motion-reduce:transition-none ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>
              </h3>
              <div
                id={panel}
                role="region"
                aria-label={`Penjelasan ${k.tingkat}`}
                hidden={!isOpen}
                className="hub-fade px-1 pb-3 text-sm text-hub-muted"
              >
                {k.catatan}
              </div>
            </li>
          );
        })}
      </ul>

    </>
  );
}
