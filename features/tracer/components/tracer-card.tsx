import Link from "next/link";
import { Icon } from "@/shared/components/icons";
import { getRingkasTracer } from "../lib/api";

const tombol =
  "group relative inline-flex min-h-12 w-full items-center justify-center gap-2 self-start rounded-xl bg-hub-sand px-6 text-base font-semibold text-hub-ink transition-all duration-200 hover:bg-[#f0b520] hover:shadow-lg active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:active:scale-100 sm:w-auto";

export function TracerCardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex h-full min-h-64 flex-col justify-between gap-6 rounded-2xl bg-hub-navy p-5 sm:p-6 motion-safe:animate-pulse"
    >
      <span className="sr-only">Memuat tracer study</span>
      <div aria-hidden="true" className="flex flex-col gap-3">
        <div className="h-4 w-24 rounded bg-white/15" />
        <div className="h-7 w-3/4 rounded-lg bg-white/15" />
        <div className="h-4 w-full max-w-md rounded bg-white/10" />
      </div>
      <div aria-hidden="true" className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-2 flex-1 rounded-full bg-white/15" />
        ))}
      </div>
      <div aria-hidden="true" className="h-12 w-full rounded-xl bg-white/20 sm:w-36" />
    </div>
  );
}

/** Kartu tracer di beranda, dari status asli di API. Harus dipanggil di dalam <Suspense>. */
export async function TracerCard() {
  const r = await getRingkasTracer();

  let judul = "Tracer study belum dapat dimuat";
  let isi = "Coba muat ulang.";
  let aksi: string | null = null;
  if (r?.keadaan === "TIDAK_ADA") {
    judul = "Belum ada periode tracer study";
    isi = "Menunggu periode berikutnya.";
  } else if (r?.keadaan === "BELUM_MULAI") {
    judul = "Mulai pengisian tracer study";
    isi = `${r.periode}. Data kampus sudah terisi, tinggal konfirmasi.`;
    aksi = "Mulai";
  } else if (r?.keadaan === "BERJALAN") {
    judul = "Lanjutkan pengisian tracer study";
    isi = "Lengkapi bagian yang belum terisi.";
    aksi = "Lanjutkan";
  } else if (r?.keadaan === "INTI_TERKIRIM") {
    judul = "Bagian inti sudah terkirim";
    isi = "Tinggal penilaian dan pencarian kerja.";
    aksi = "Lengkapi";
  } else if (r?.keadaan === "SELESAI") {
    judul = "Tracer study Anda sudah terkirim";
    isi = "Terima kasih.";
    aksi = "Lihat";
  }
  const progres = r?.keadaan === "BERJALAN" || r?.keadaan === "INTI_TERKIRIM" || r?.keadaan === "SELESAI" ? r : null;

  return (
    <section
      aria-labelledby="tracer"
      className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-hub-navy p-5 text-white sm:p-6"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 160 160"
        className="pointer-events-none absolute -bottom-10 -right-10 size-52 text-white/[0.06]"
        fill="currentColor"
      >
        <circle cx="80" cy="80" r="78" />
        <circle cx="80" cy="80" r="52" fill="#071952" />
        <circle cx="80" cy="80" r="26" />
      </svg>

      <div className="relative">
        <p className="text-sm font-medium text-hub-sand">Tracer Study</p>
        <h2 id="tracer" className="mt-1 scroll-mt-6 text-xl font-semibold sm:text-2xl">
          {judul}
        </h2>
        <p className="mt-2 max-w-prose text-sm text-white/80">{isi}</p>
      </div>

      {progres && (
        <div className="relative">
          <div
            role="progressbar"
            aria-label="Kemajuan tracer study"
            aria-valuemin={0}
            aria-valuemax={progres.total}
            aria-valuenow={progres.selesai}
            aria-valuetext={`${progres.selesai} dari ${progres.total} langkah selesai`}
            className="flex gap-1.5"
          >
            {Array.from({ length: progres.total }, (_, i) => (
              <span
                key={i}
                style={{ "--i": i } as React.CSSProperties}
                className={`hub-seg h-2 flex-1 rounded-full ${
                  i < progres.selesai ? "bg-hub-sand" : i === progres.selesai ? "bg-white/70" : "bg-white/20"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-white/80">
            {progres.selesai} dari {progres.total} langkah selesai.
            {progres.berikutnya && ` Berikutnya: ${progres.berikutnya.judul ?? `Langkah ${progres.berikutnya.nomor}`}.`}
          </p>
        </div>
      )}

      {aksi && (
        <Link href="/tracer" className={tombol}>
          {aksi}
          <Icon
            name="arrow"
            className="size-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </Link>
      )}
    </section>
  );
}
