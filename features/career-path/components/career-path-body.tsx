"use client";

import { useId, useRef, useState } from "react";
import { Icon } from "@/shared/components/icons";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import type { CareerPath, Langkah } from "../lib/types";

type Kunci = "tahun1" | "tahun3";
const HORIZON: { kunci: Kunci; label: string; singkat: string }[] = [
  { kunci: "tahun1", label: "Dalam 1 tahun", singkat: "1 tahun" },
  { kunci: "tahun3", label: "Dalam 3 tahun", singkat: "3 tahun" },
];

function DaftarLangkah({
  judul,
  daftar,
  onUbah,
}: {
  judul: string;
  daftar: Langkah[];
  onUbah: (l: Langkah, selesai: boolean) => void;
}) {
  if (daftar.length === 0) return null;
  return (
    <fieldset className="mt-4">
      <legend className="text-xs font-medium text-hub-muted">{judul} (centang bila sudah selesai)</legend>
      <div className="mt-1.5 flex flex-col">
        {daftar.map((l) => (
          <label
            key={l.id}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 text-sm hover:bg-hub-canvas has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-hub-navy"
          >
            <input
              type="checkbox"
              checked={l.selesai}
              onChange={(e) => onUbah(l, e.target.checked)}
              className="size-5 shrink-0 cursor-pointer accent-hub-teal-dark"
            />
            <span className={l.selesai ? "text-hub-muted line-through" : ""}>{l.teks}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CareerPathBody({ data }: { data: CareerPath }) {
  const [path, setPath] = useState(data);
  const [aktif, setAktif] = useState<Kunci>("tahun1");
  const [galat, setGalat] = useState<string | null>(null);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const semua = [...path.tahun1.keterampilan, ...path.tahun1.sertifikasi, ...path.tahun3.keterampilan, ...path.tahun3.sertifikasi];
  const done = semua.filter((l) => l.selesai).length;
  const h = path[aktif];

  function setSelesai(id: number, selesai: boolean) {
    const ubah = (d: Langkah[]) => d.map((l) => (l.id === id ? { ...l, selesai } : l));
    setPath((p) => ({
      ...p,
      tahun1: { ...p.tahun1, keterampilan: ubah(p.tahun1.keterampilan), sertifikasi: ubah(p.tahun1.sertifikasi) },
      tahun3: { ...p.tahun3, keterampilan: ubah(p.tahun3.keterampilan), sertifikasi: ubah(p.tahun3.sertifikasi) },
    }));
  }

  async function ubah(l: Langkah, selesai: boolean) {
    setGalat(null);
    setSelesai(l.id, selesai);
    try {
      await panggilApi("career-path", "PATCH", `langkah/${l.id}`, { selesai });
    } catch (e) {
      setSelesai(l.id, !selesai);
      setGalat(pesanGalat(e, "Perubahan belum tersimpan. Coba lagi."));
    }
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % HORIZON.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + HORIZON.length) % HORIZON.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = HORIZON.length - 1;
    else return;
    e.preventDefault();
    setAktif(HORIZON[next]!.kunci);
    tabRefs.current[next]?.focus();
  }

  const titik = [
    { key: "now", label: "Sekarang", sub: `${path.dariJumlahLogbook} logbook` },
    ...HORIZON.map((x) => ({ key: x.kunci, label: x.singkat, sub: path[x.kunci].posisi })),
  ];

  return (
    <>
      <div className="mb-5">
        <p className="mb-3 flex items-center gap-2 text-sm text-hub-muted">
          <Icon name="target" className="size-4" />
          Destinasi karier:
          <span className="font-semibold text-hub-ink">{path.destinasi}</span>
        </p>
        <ol className="relative flex items-start justify-between" aria-label="Lintasan karier">
          <span aria-hidden="true" className="absolute left-4 right-4 top-4 h-0.5 bg-hub-line" />
          {titik.map((n, i) => {
            const isActive = n.key === aktif;
            const klik = n.key !== "now";
            const dot = (
              <span
                className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors duration-200 ${
                  isActive
                    ? "border-hub-navy bg-hub-navy text-white"
                    : i === 0
                      ? "border-hub-teal-dark bg-hub-teal-dark text-white"
                      : "border-hub-line bg-white text-hub-muted"
                }`}
              >
                {i === 0 ? <Icon name="check" className="size-4" /> : i}
              </span>
            );
            const teks = (
              <span className="mt-1.5 block max-w-28 text-center text-xs">
                <span className="block font-semibold">{n.label}</span>
                <span className="block text-hub-muted">{n.sub}</span>
              </span>
            );
            return (
              <li key={n.key} className="flex flex-1 flex-col items-center first:items-start last:items-end">
                {klik ? (
                  <button
                    type="button"
                    onClick={() => setAktif(n.key as Kunci)}
                    aria-label={`Lihat rencana ${n.label}: ${n.sub}`}
                    className={`flex cursor-pointer flex-col items-center rounded-lg p-1 ${focusRing}`}
                  >
                    {dot}
                    {teks}
                  </button>
                ) : (
                  <div className="flex flex-col items-center p-1">
                    {dot}
                    {teks}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div role="tablist" aria-label="Horizon rencana karier" className="mb-3 inline-flex rounded-xl bg-hub-canvas p-1">
        {HORIZON.map((x, i) => {
          const sel = x.kunci === aktif;
          return (
            <button
              key={x.kunci}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${i}`}
              aria-selected={sel}
              aria-controls={`${baseId}-panel`}
              tabIndex={sel ? 0 : -1}
              onClick={() => setAktif(x.kunci)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-11 cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors ${focusRing} ${
                sel ? "bg-white text-hub-ink shadow-sm" : "text-hub-muted hover:text-hub-ink"
              }`}
            >
              {x.label}
            </button>
          );
        })}
      </div>

      <div
        key={aktif}
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${HORIZON.findIndex((x) => x.kunci === aktif)}`}
        className="hub-fade rounded-xl border border-hub-line p-4"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-hub-teal-dark">Perkiraan posisi</p>
        <p className="text-lg font-semibold">{h.posisi}</p>
        <p className="mt-1 text-sm text-hub-muted">{h.deskripsi}</p>
        <DaftarLangkah judul="Keterampilan yang perlu dikuasai" daftar={h.keterampilan} onUbah={ubah} />
        <DaftarLangkah judul="Sertifikasi yang disarankan" daftar={h.sertifikasi} onUbah={ubah} />
      </div>

      {galat && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {galat}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <div
          role="progressbar"
          aria-label="Langkah selesai"
          aria-valuemin={0}
          aria-valuemax={semua.length}
          aria-valuenow={done}
          className="h-2 flex-1 overflow-hidden rounded-full bg-hub-canvas"
        >
          <div
            className="h-full origin-left rounded-full bg-hub-teal-dark transition-transform duration-500 motion-reduce:transition-none"
            style={{ transform: `scaleX(${semua.length ? done / semua.length : 0})` }}
          />
        </div>
        <p className="text-sm tabular-nums text-hub-muted" aria-live="polite">
          {done} dari {semua.length} langkah
        </p>
      </div>
    </>
  );
}
