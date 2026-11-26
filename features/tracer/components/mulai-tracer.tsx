"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { panggil } from "../lib/helpers";

const LANGKAH_AWAL = [
  { judul: "Cek data dari kampus", ket: "Tinggal konfirmasi, sudah terisi otomatis" },
  { judul: "Pertanyaan inti", ket: "Status, tempat kerja, dan penghasilan" },
  { judul: "Penilaian singkat", ket: "Boleh menyusul" },
  { judul: "Pencarian kerja", ket: "Boleh menyusul" },
];

/** Memulai pengisian: server menyalin data kampus dan passport menjadi jawaban usulan. */
export function MulaiTracer({ namaPeriode }: { namaPeriode: string }) {
  const router = useRouter();
  const [galat, setGalat] = useState<string | null>(null);
  const [mulai, jalankan] = useTransition();
  const [mengirim, setMengirim] = useState(false);

  async function klik() {
    setGalat(null);
    setMengirim(true);
    try {
      await panggil("POST", "mulai");
      jalankan(() => router.refresh());
    } catch (e) {
      setGalat(e instanceof Error ? e.message : "Gagal memulai");
      setMengirim(false);
    }
  }

  return (
    <section
      aria-labelledby="mulai"
      className="relative grid grid-cols-1 gap-8 overflow-hidden rounded-3xl bg-hub-navy p-6 text-white shadow-xl shadow-hub-navy/15 sm:p-10 lg:min-h-[min(32rem,calc(100dvh-13rem))] lg:grid-cols-[1.1fr_1fr] lg:content-center lg:gap-x-14 lg:gap-y-0 lg:p-14"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full border-[36px] border-white/5" />

      {/* Di layar lebar judul (baris 1, rata bawah) dan tombol (baris 2, rata atas) bertemu di tengah, sejajar dengan daftar langkah. */}
      <div className="relative order-1 flex flex-col gap-5 lg:col-start-1 lg:row-start-1 lg:self-end lg:pb-3">
        <p className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-hub-sand">{namaPeriode}</p>
        <h2 id="mulai" className="max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          Mulai pengisian tracer study
        </h2>
        <p className="flex items-center gap-2 text-sm text-white/80">
          <Icon name="clock" className="size-4 text-hub-sand" />
          Bagian inti sekitar 3 menit. Sisanya boleh menyusul.
        </p>
      </div>

      <div className="relative order-2 self-center rounded-2xl border border-white/10 bg-white/10 p-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:p-7">
        <ol className="flex flex-col gap-4 text-base text-white/90">
          {LANGKAH_AWAL.map((t, i) => (
            <li key={t.judul} className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  i < 2 ? "bg-hub-sand text-hub-ink" : "border border-white/30 text-white/80"
                }`}
              >
                {i + 1}
              </span>
              <span className="flex flex-col">
                <span className="font-semibold">{t.judul}</span>
                <span className="text-sm text-white/70">{t.ket}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative order-3 flex flex-col gap-4 lg:col-start-1 lg:row-start-2 lg:self-start lg:pt-3">
        {galat && (
          <p role="alert" className="rounded-xl bg-white/10 px-4 py-3 text-sm">
            {galat}
          </p>
        )}
        <button
          type="button"
          onClick={klik}
          disabled={mengirim || mulai}
          className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-hub-sand px-6 text-base font-semibold text-hub-ink transition hover:brightness-110 active:scale-[0.98] motion-reduce:transform-none disabled:opacity-60 sm:w-auto sm:self-start ${focusRing}`}
        >
          {mengirim || mulai ? "Menyiapkan data Anda..." : "Mulai"}
          {!(mengirim || mulai) && <Icon name="arrow" className="size-5" />}
        </button>
      </div>
    </section>
  );
}
