"use client";

import { useEffect, useId, useState } from "react";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { labelSumber, panggil } from "../lib/helpers";
import type { Butir, Jawaban, OpsiMaster, RangeOpsi } from "../lib/types";

const WARNA = {
  teal: "bg-[#E3F4F1] text-[#0B5F57]",
  sand: "bg-[#FFF1CC] text-[#6B4A00]",
  navy: "bg-[#E1E6F8] text-hub-navy",
} as const;

export type FieldProps = {
  butir: Butir;
  teks: string;
  wajib: boolean;
  jawaban?: Jawaban;
  range?: RangeOpsi[];
  /** Tanpa bingkai kartu, untuk pertanyaan di dalam kelompok yang sudah berbingkai. */
  tanpaKartu?: boolean;
  /** Jawaban butir induk (kabupaten bergantung pada provinsi). */
  nilaiInduk?: unknown;
  disabled?: boolean;
  /** Menyimpan satu jawaban. Mengirim ulang nilai usulan yang sama berarti mengonfirmasinya. */
  onSimpan: (kode: string, nilai: unknown) => void;
};

export function Lencana({ jawaban }: { jawaban?: Jawaban }) {
  const l = jawaban ? labelSumber(jawaban.sumber, jawaban.status) : null;
  if (!l) return null;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${WARNA[l.warna]}`}>{l.teks}</span>;
}

/** Satu pertanyaan: label, lencana asal data, isian sesuai tipe, dan tombol "Sudah benar" untuk usulan. */
export function Field(props: FieldProps) {
  const { butir, teks, wajib, jawaban, onSimpan, disabled, tanpaKartu } = props;
  const id = useId();
  const usulan = jawaban?.status === "USULAN";

  return (
    <div
      id={`butir-${butir.kode}`}
      className={`scroll-mt-6 flex flex-col gap-3 ${
        tanpaKartu ? "" : "rounded-2xl border border-hub-line bg-white p-5 shadow-sm shadow-hub-navy/[0.03] sm:p-6"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <label
            id={`${id}-l`}
            htmlFor={id}
            className={tanpaKartu ? "text-sm font-semibold leading-snug" : "text-base font-semibold leading-snug text-hub-navy"}
          >
            {teks}
            {wajib && <span className="text-[#B42318]"> *</span>}
          </label>
          <Lencana jawaban={jawaban} />
        </div>
        {usulan && !disabled && (
          <button
            type="button"
            onClick={() => onSimpan(butir.kode, jawaban.nilai)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-hub-line bg-white px-3.5 text-sm font-medium text-hub-teal-dark hover:bg-hub-canvas ${focusRing}`}
          >
            <Icon name="check" className="size-4" />
            Sudah benar
          </button>
        )}
      </div>
      <Isian {...props} id={id} />
    </div>
  );
}

const kotak =
  "min-h-11 w-full rounded-xl border border-hub-line bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-navy disabled:bg-hub-canvas";

function Isian({ butir, jawaban, range, nilaiInduk, onSimpan, disabled, id }: FieldProps & { id: string }) {
  const nilai = jawaban?.nilai;

  switch (butir.tipe) {
    case "PILIHAN_TUNGGAL":
      return (
        <div id={id} role="radiogroup" aria-labelledby={`${id}-l`} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {butir.opsi?.map((o) => {
            const pilih = String(nilai) === String(o.nilai);
            return (
              <button
                key={o.nilai}
                type="button"
                role="radio"
                aria-checked={pilih}
                disabled={disabled}
                onClick={() => !pilih && onSimpan(butir.kode, o.nilai)}
                className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-2 text-left text-sm transition duration-200 hover:shadow-sm active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 ${focusRing} ${
                  pilih ? "border-hub-navy bg-[#EEF1FB] font-semibold shadow-sm" : "border-hub-line bg-white hover:border-hub-navy/40 hover:bg-hub-canvas"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    pilih ? "border-hub-navy" : "border-hub-muted"
                  }`}
                >
                  {pilih && <span className="size-2.5 rounded-full bg-hub-navy" />}
                </span>
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">{o.label}</span>
              </button>
            );
          })}
        </div>
      );

    case "PILIHAN_GANDA": {
      const dipilih = Array.isArray(nilai) ? nilai.map(String) : [];
      return (
        <div id={id} role="group" aria-labelledby={`${id}-l`} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {butir.opsi?.map((o) => {
            const pilih = dipilih.includes(String(o.nilai));
            return (
              <button
                key={o.nilai}
                type="button"
                role="checkbox"
                aria-checked={pilih}
                disabled={disabled}
                onClick={() => {
                  const baru = pilih ? dipilih.filter((x) => x !== String(o.nilai)) : [...dipilih, String(o.nilai)];
                  if (baru.length) onSimpan(butir.kode, baru);
                }}
                className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-2 text-left text-sm transition duration-200 hover:shadow-sm active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 ${focusRing} ${
                  pilih ? "border-hub-navy bg-[#EEF1FB] font-semibold shadow-sm" : "border-hub-line bg-white hover:border-hub-navy/40 hover:bg-hub-canvas"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 ${
                    pilih ? "border-hub-navy bg-hub-navy text-white" : "border-hub-muted"
                  }`}
                >
                  {pilih && <Icon name="check" className="size-3.5" />}
                </span>
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">{o.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    case "SKALA":
      return <Skala butir={butir} nilai={nilai} disabled={disabled} onSimpan={onSimpan} labelId={`${id}-l`} />;

    case "RANGE":
      return (
        <div id={id} role="radiogroup" aria-labelledby={`${id}-l`} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {range === undefined && <p className="col-span-full text-sm text-hub-muted">Memuat pilihan...</p>}
          {range?.map((r) => {
            const pilih = nilai === r.id;
            return (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={pilih}
                disabled={disabled}
                onClick={() => !pilih && onSimpan(butir.kode, r.id)}
                className={`flex min-h-12 items-center rounded-xl border px-4 py-2 text-left text-sm ${focusRing} ${
                  pilih ? "border-hub-navy bg-[#EEF1FB] font-semibold shadow-sm" : "border-hub-line bg-white hover:border-hub-navy/40 hover:bg-hub-canvas"
                }`}
              >
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">{r.label}</span>
              </button>
            );
          })}
        </div>
      );

    case "ANGKA":
      return (
        <Ketik
          id={id}
          jenis="number"
          nilai={nilai === undefined ? "" : String(nilai)}
          disabled={disabled}
          min={butir.min}
          max={butir.max}
          onSelesai={(v) => v.trim() !== "" && !Number.isNaN(Number(v)) && onSimpan(butir.kode, Number(v))}
        />
      );

    case "TANGGAL":
      return (
        <input
          id={id}
          type="date"
          disabled={disabled}
          defaultValue={typeof nilai === "string" ? nilai.slice(0, 10) : ""}
          onChange={(e) => e.target.value && onSimpan(butir.kode, e.target.value)}
          className={kotak}
        />
      );

    case "MASTER":
      // Wilayah, profesi, dan industri dari data LMS. Perguruan tinggi dan prodi tujuan studi lanjut belum
      // punya daftar master, jadi sementara isian teks.
      if (butir.master && ["provinsi", "kabupaten", "profesi", "industri"].includes(butir.master)) {
        return (
          <PilihMaster
            id={id}
            butir={butir}
            nilai={typeof nilai === "string" ? nilai : ""}
            induk={nilaiInduk}
            disabled={disabled}
            onPilih={(v) => onSimpan(butir.kode, v)}
          />
        );
      }
      return (
        <Ketik
          id={id}
          jenis="text"
          nilai={typeof nilai === "string" ? nilai : ""}
          disabled={disabled}
          onSelesai={(v) => v.trim() && onSimpan(butir.kode, v.trim())}
        />
      );

    case "TEKS":
    default:
      return (
        <Ketik
          id={id}
          jenis="text"
          nilai={typeof nilai === "string" ? nilai : ""}
          disabled={disabled}
          onSelesai={(v) => v.trim() && onSimpan(butir.kode, v.trim())}
        />
      );
  }
}

/** Pilihan dari data master di API (provinsi, kabupaten menurut provinsi, profesi prodi, industri). */
function PilihMaster({
  id,
  butir,
  nilai,
  induk,
  disabled,
  onPilih,
}: {
  id: string;
  butir: Butir;
  nilai: string;
  induk?: unknown;
  disabled?: boolean;
  onPilih: (v: string) => void;
}) {
  const jenis = butir.master!;
  const tanpaInduk = jenis === "kabupaten" && !induk;
  const [hasil, setHasil] = useState<{ kunci: string; opsi: OpsiMaster[] } | null>(null);
  const kunci = `${jenis}:${String(induk ?? "")}`;

  useEffect(() => {
    if (tanpaInduk) return;
    let batal = false;
    const q = jenis === "kabupaten" ? `?provinsi=${encodeURIComponent(String(induk))}` : "";
    panggil<OpsiMaster[]>("GET", `master/${jenis}${q}`)
      .then((opsi) => !batal && setHasil({ kunci, opsi }))
      .catch(() => !batal && setHasil({ kunci, opsi: [] }));
    return () => {
      batal = true;
    };
  }, [jenis, induk, kunci, tanpaInduk]);

  const opsi = hasil?.kunci === kunci ? hasil.opsi : null;
  return (
    <select
      id={id}
      value={nilai}
      disabled={disabled || tanpaInduk || opsi === null}
      onChange={(e) => e.target.value && onPilih(e.target.value)}
      className={kotak}
    >
      <option value="">
        {tanpaInduk ? "Pilih provinsi dulu" : opsi === null ? "Memuat pilihan..." : "Pilih salah satu"}
      </option>
      {(opsi ?? []).map((o) => (
        <option key={o.kode} value={o.kode}>
          {o.nama}
        </option>
      ))}
    </select>
  );
}

/** Isian ketik: disimpan saat fokus keluar, bukan tiap ketukan. */
function Ketik({
  id,
  jenis,
  nilai,
  disabled,
  min,
  max,
  onSelesai,
}: {
  id: string;
  jenis: "text" | "number";
  nilai: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  onSelesai: (v: string) => void;
}) {
  const [v, setV] = useState(nilai);
  return (
    <input
      id={id}
      type={jenis}
      inputMode={jenis === "number" ? "numeric" : undefined}
      min={min}
      max={max}
      disabled={disabled}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== nilai && onSelesai(v)}
      className={kotak}
    />
  );
}

export function Skala({
  butir,
  nilai,
  disabled,
  onSimpan,
  labelId,
  label,
}: {
  butir: Butir;
  nilai: unknown;
  disabled?: boolean;
  onSimpan: (kode: string, nilai: unknown) => void;
  labelId?: string;
  label?: string;
}) {
  const min = butir.min ?? 1;
  const max = butir.max ?? 5;
  const angka = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <div role="radiogroup" aria-labelledby={labelId} aria-label={label} className="grid grid-cols-5 gap-2">
        {angka.map((n) => {
          const pilih = nilai === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={pilih}
              disabled={disabled}
              onClick={() => !pilih && onSimpan(butir.kode, n)}
              className={`min-h-12 rounded-xl border text-base font-semibold transition-colors hover:border-hub-teal-dark ${focusRing} ${
                pilih ? "border-hub-navy bg-hub-navy text-white" : "border-hub-line bg-white hover:bg-hub-canvas"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-hub-muted">
        <span>{butir.label_min ?? "Sangat rendah"}</span>
        <span>{butir.label_maks ?? "Sangat tinggi"}</span>
      </div>
    </div>
  );
}
