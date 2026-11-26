import { Suspense } from "react";
import { currentUser, displayName } from "@/features/auth";
import { Icon } from "@/shared/components/icons";
import { Shell } from "@/shared/components/layout/shell";
import { KARTU } from "../data";
import { appOrigin, getKartu } from "../lib/api";
import { AlumniCard } from "./alumni-card";

export function KartuPage() {
  return (
    <Shell active="/kartu">
      <header className="hub-rise">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Kartu alumni</h1>
        <p className="mt-1 max-w-prose text-sm text-hub-muted">
          Identitas digital Anda sebagai alumni UBL. Arahkan kursor atau sentuh kartu, lalu
          balik untuk melihat detail dan kode QR.
        </p>
      </header>

      {/* Membaca cookie sesi, jadi harus di dalam Suspense (Cache Components). */}
      <Suspense fallback={<KartuPageSkeleton />}>
        <Isi />
      </Suspense>
    </Shell>
  );
}

function KartuPageSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="aspect-[1.586] w-full max-w-2xl rounded-3xl bg-hub-line motion-safe:animate-pulse"
    />
  );
}

async function Isi() {
  const user = await currentUser();
  const kartu = await getKartu();
  if (!kartu) {
    return (
      <p role="alert" className="rounded-2xl border border-hub-line bg-white p-5 text-sm">
        Data kartu belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.
      </p>
    );
  }
  const { nomor } = kartu;
  const terbit = nomor !== null;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="hub-rise lg:col-span-2" style={{ "--i": 1 } as React.CSSProperties}>
        <div className="max-w-2xl">
          <AlumniCard
            data={{
              nama: kartu.nama || displayName(user),
              prodi: kartu.prodi ?? "Alumni UBL",
              npm: kartu.npm,
              nomor,
              tahunLulus: kartu.tahunLulus,
              profilUrl: `${await appOrigin()}/alumni/${kartu.profilToken}`,
            }}
          />
        </div>

        {terbit && <Anatomi nomor={nomor} />}
      </div>

      <div className="flex flex-col gap-5">
        <div className="hub-rise" style={{ "--i": 2 } as React.CSSProperties}>
          <StatusCard terbit={terbit} />
        </div>
        <div className="hub-rise" style={{ "--i": 3 } as React.CSSProperties}>
          <CaraPakai />
        </div>
      </div>
    </div>
  );
}

/** Menguraikan nomor: kode prodi, tahun lulus, periode wisuda, nomor urut. */
function Anatomi({ nomor }: { nomor: string }) {
  const bagian = [
    { nilai: nomor.slice(0, 2), label: "Program studi" },
    { nilai: nomor.slice(2, 4), label: "Tahun lulus" },
    {
      nilai: nomor.slice(4, 5),
      label: nomor[4] === "1" ? "Wisuda ganjil" : "Wisuda genap",
    },
    { nilai: nomor.slice(5), label: "Nomor urut" },
  ];
  return (
    <section aria-labelledby="anatomi" className="mt-5 max-w-2xl">
      <h2 id="anatomi" className="mb-3 text-base font-semibold">
        Arti nomor alumni
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {bagian.map((b) => (
          <li
            key={b.label}
            className="rounded-xl border border-hub-line bg-white px-3 py-3"
          >
            <p className="font-mono text-xl font-bold tabular-nums tracking-wider text-hub-navy">
              {b.nilai}
            </p>
            <p className="text-sm text-hub-muted">{b.label}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-hub-muted">
        Nomor dikunci setelah terbit dan tidak berubah walau data Anda dikoreksi.
      </p>
    </section>
  );
}

function StatusCard({ terbit }: { terbit: boolean }) {
  const syarat = [
    { ok: KARTU.syarat.passport, teks: "Memiliki Professional Passport" },
    { ok: KARTU.syarat.wisuda, teks: "Terdaftar di daftar wisuda" },
  ];
  return (
    <section
      aria-labelledby="status"
      className="rounded-2xl border border-hub-line bg-white p-5 sm:p-6"
    >
      <h2 id="status" className="text-base font-semibold">
        Status kartu
      </h2>
      <p
        className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
          terbit ? "bg-[#E3F4F1] text-[#0B5F57]" : "bg-[#FFF1CC] text-[#6B4A00]"
        }`}
      >
        <Icon name={terbit ? "check" : "clock"} className="size-4" />
        {terbit ? "Terbit dan terverifikasi" : "Belum terbit"}
      </p>
      <p className="mt-3 text-sm text-hub-muted">
        {terbit
          ? "Kartu Anda aktif dan bisa dipakai."
          : "Kartu terbit otomatis setelah kedua syarat di bawah terpenuhi."}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {syarat.map((s) => (
          <li key={s.teks} className="flex items-center gap-2 text-sm">
            <Icon
              name={s.ok ? "check" : "clock"}
              className={`size-4 ${s.ok ? "text-hub-teal-dark" : "text-hub-muted"}`}
            />
            <span>
              {s.teks}
              <span className="sr-only">{s.ok ? ", terpenuhi" : ", belum terpenuhi"}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CaraPakai() {
  const langkah = [
    "Pindai QR di acara alumni untuk membuka Tracer Study dengan data yang sudah terisi.",
    "Tunjukkan QR agar profil alumni Anda dapat dibuka sesuai izin yang Anda berikan.",
    "Pantau lowongan dan pelatihan dari UBL lewat aplikasi alumni.",
  ];
  return (
    <section
      aria-labelledby="cara"
      className="rounded-2xl border border-hub-line bg-white p-5 sm:p-6"
    >
      <h2 id="cara" className="text-base font-semibold">
        Cara memakai kartu
      </h2>
      <ol className="mt-3 flex flex-col gap-3">
        {langkah.map((t, i) => (
          <li key={t} className="flex gap-3 text-sm">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#E3F4F1] font-semibold text-[#0B5F57]"
            >
              {i + 1}
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-hub-line pt-3 text-sm text-hub-muted">
        Kartu hilang atau data salah? Hubungi PCC Office / CDC UBL.
      </p>
    </section>
  );
}
