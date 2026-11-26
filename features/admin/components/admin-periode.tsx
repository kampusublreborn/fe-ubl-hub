"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/shared/components/icons";
import { adminApi, buttonClass, fieldClass } from "../lib/api";
import {
  payloadPeriode,
  tanggalPeriode,
  validasiPeriode,
  type InstrumenOpsi,
  type PeriodeAdmin,
  type PeriodeErrors,
  type PeriodeInput,
} from "../lib/periode";

const PENJELASAN_VERSI: Record<string, string> = {
  "1.0":
    "Instrumen resmi Dikti apa adanya (kuesioner lengkap). Pilih jika UBL perlu mengikuti format baku Dikti tanpa penyesuaian.",
  "1.2":
    "Instrumen Dikti dengan mode Ringkas: 4 langkah (langkah 1 dan 2 inti, alumni bisa kirim inti dulu), arah karier bertingkat, dan masa tunggu kerja dihitung otomatis. Disarankan untuk periode baru.",
};

const initial: PeriodeInput = {
  nama: "",
  instrumen: "",
  mulai: "",
  selesai: "",
  tahun: "",
};
const primary =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-hub-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-hub-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-navy disabled:cursor-not-allowed disabled:opacity-50";

export function AdminPeriode() {
  const [data, setData] = useState<{
    periode: PeriodeAdmin[];
    instrumen: InstrumenOpsi[];
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [input, setInput] = useState(initial);
  const [errors, setErrors] = useState<PeriodeErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState<{
    periode: PeriodeAdmin;
    action: "aktifkan" | "nonaktifkan";
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const actionTrigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!confirm && !pending) {
      actionTrigger.current?.focus();
      actionTrigger.current = null;
    }
  }, [confirm, pending]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      adminApi<PeriodeAdmin[]>("master/periode", { signal: controller.signal }),
      adminApi<InstrumenOpsi[]>("master/instrumen", {
        signal: controller.signal,
      }),
    ])
      .then(([periode, instrumen]) => {
        if (!controller.signal.aborted) setData({ periode, instrumen });
      })
      .catch((e: Error) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reload]);

  function update(key: keyof PeriodeInput, value: string) {
    setInput((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !data) return;
    setNotice(null);
    setFormError(null);
    const nextErrors = validasiPeriode(input);
    const selected = data.instrumen.find(
      (i) => i.id === Number(input.instrumen),
    );
    if (!selected)
      nextErrors.instrumen = "Pilih instrumen tracer yang tersedia.";
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      (
        formRef.current?.elements.namedItem(first) as HTMLElement | null
      )?.focus();
      return;
    }
    setPending(true);
    try {
      const row = await adminApi<PeriodeAdmin>("master/periode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadPeriode(input)),
      });
      setData(
        (previous) =>
          previous && {
            ...previous,
            periode: [
              {
                ...row,
                instrumen_versi: {
                  kode: selected!.kode,
                  versi: selected!.versi,
                },
                _count: { respons: 0 },
              },
              ...previous.periode,
            ],
          },
      );
      setInput(initial);
      setErrors({});
      setNotice(
        `Periode “${row.nama}” berhasil dibuat dalam keadaan nonaktif. Aktifkan saat siap digunakan.`,
      );
    } catch (e) {
      setFormError(
        e instanceof Error
          ? e.message
          : "Periode gagal dibuat. Silakan coba lagi.",
      );
    } finally {
      setPending(false);
    }
  }

  async function changeStatus() {
    if (!confirm || pending) return;
    setPending(true);
    setActionError(null);
    setNotice(null);
    try {
      await adminApi(`master/periode/${confirm.periode.id}/${confirm.action}`, {
        method: "POST",
      });
      const activate = confirm.action === "aktifkan";
      setData(
        (previous) =>
          previous && {
            ...previous,
            periode: previous.periode.map((row) => ({
              ...row,
              aktif:
                row.id === confirm.periode.id
                  ? activate
                  : activate
                    ? false
                    : row.aktif,
            })),
          },
      );
      setNotice(
        `Periode “${confirm.periode.nama}” berhasil ${activate ? "diaktifkan" : "ditutup"}.`,
      );
      setConfirm(null);
    } catch (e) {
      setActionError(
        e instanceof Error
          ? e.message
          : "Status periode gagal diubah. Coba lagi.",
      );
    } finally {
      setPending(false);
    }
  }

  const active = data?.periode.find((row) => row.aktif);
  const field = (key: keyof PeriodeInput) => ({
    id: `periode-${key}`,
    name: key,
    value: input[key],
    disabled: pending,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => update(key, event.target.value),
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `error-${key}` : undefined,
    className: `${fieldClass} text-base sm:text-sm ${errors[key] ? "border-red-600" : ""}`,
  });
  const errorFor = (key: keyof PeriodeInput) =>
    errors[key] && (
      <p id={`error-${key}`} className="mt-2 text-xs text-red-800">
        {errors[key]}
      </p>
    );

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-hub-teal-dark">
            Pengaturan BPKHA
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Periode Tracer Study
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-hub-muted">
            Tentukan periode pengisian, sasaran lulusan, dan instrumen yang
            digunakan alumni.
          </p>
        </div>
        <button
          type="button"
          className={primary}
          disabled={loading || !!loadError || pending}
          onClick={() => {
            (
              formRef.current?.elements.namedItem("nama") as HTMLElement | null
            )?.focus();
          }}
        >
          <Icon name="plus" className="size-4" />
          Buat periode
        </button>
      </header>
      {notice && (
        <p
          role="status"
          className="flex items-start gap-3 rounded-xl border border-hub-teal/30 bg-hub-teal/10 p-4 text-sm leading-relaxed text-hub-teal-dark"
        >
          <Icon name="check" />
          {notice}
        </p>
      )}
      {loadError ? (
        <section
          role="alert"
          className="rounded-2xl border border-hub-line bg-white p-8 text-center"
        >
          <h2 className="text-lg font-semibold">
            Pengaturan belum dapat dimuat
          </h2>
          <p className="mt-2 text-sm text-red-800">{loadError}</p>
          <button
            className={`${buttonClass} mt-5`}
            onClick={() => {
              setLoadError(null);
              setLoading(true);
              setReload((n) => n + 1);
            }}
          >
            Coba lagi
          </button>
        </section>
      ) : loading || !data ? (
        <div role="status" className="space-y-5">
          <span className="sr-only">Memuat periode tracer…</span>
          <div className="h-40 rounded-2xl bg-white motion-safe:animate-pulse" />
          <div className="h-96 rounded-2xl bg-white motion-safe:animate-pulse" />
        </div>
      ) : (
        <>
          <section
            aria-labelledby="periode-aktif-title"
            className="overflow-hidden rounded-2xl bg-hub-navy text-white"
          >
            <div className="flex flex-col justify-between gap-5 p-5 sm:p-7 md:flex-row md:items-center">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
                  <Icon name="calendar" className="size-4" />
                  Periode aktif
                </p>
                <h2
                  id="periode-aktif-title"
                  className="mt-3 text-balance text-xl font-semibold [overflow-wrap:anywhere] sm:text-2xl"
                >
                  {active?.nama ?? "Belum ada periode aktif"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {active
                    ? `${tanggalPeriode(active.tanggal_mulai)} – ${tanggalPeriode(active.tanggal_selesai)} · WIB`
                    : "Buat atau aktifkan periode untuk membuka pengisian tracer bagi alumni."}
                </p>
              </div>
              {active && (
                <div className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-5 py-4">
                  <p className="text-2xl font-semibold tabular-nums">
                    {active._count.respons}
                  </p>
                  <p className="mt-1 text-xs text-white/80">
                    Respons tersimpan
                  </p>
                </div>
              )}
            </div>
            <p className="border-t border-white/15 px-5 py-3 text-xs leading-relaxed text-white/80 sm:px-7">
              Hanya satu periode dapat aktif. Pengisian alumni tersedia selama
              periode aktif dan berada dalam rentang tanggal yang ditentukan.
            </p>
          </section>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section
              aria-labelledby="daftar-periode-title"
              className="min-w-0 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="daftar-periode-title" className="text-lg font-semibold">
                  Daftar periode
                </h2>
                <span className="text-sm text-hub-muted">
                  {data.periode.length} periode
                </span>
              </div>
              {!data.periode.length ? (
                <div className="rounded-2xl border border-dashed border-hub-line bg-white p-10 text-center">
                  <Icon
                    name="calendar"
                    className="mx-auto size-9 text-hub-muted"
                  />
                  <h3 className="mt-4 font-semibold">
                    Periode pertama belum dibuat
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-hub-muted">
                    Isi formulir periode baru, lalu aktifkan ketika siap
                    menerima respons alumni.
                  </p>
                </div>
              ) : (
                data.periode.map((row) => (
                  <article
                    key={row.id}
                    className={`overflow-hidden rounded-2xl border bg-white ${row.aktif ? "border-hub-teal/50" : "border-hub-line"}`}
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold [overflow-wrap:anywhere]">
                            {row.nama}
                          </h3>
                          <p className="mt-1 text-xs text-hub-muted">
                            {row.instrumen_versi.kode} · Versi{" "}
                            {row.instrumen_versi.versi}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${row.aktif ? "bg-hub-teal/10 text-hub-teal-dark" : "bg-hub-canvas text-hub-muted"}`}
                        >
                          <Icon
                            name={row.aktif ? "check" : "minus"}
                            className="size-3"
                          />
                          {row.aktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-hub-muted">
                            Jadwal pengisian · WIB
                          </dt>
                          <dd className="mt-1 font-medium">
                            {tanggalPeriode(row.tanggal_mulai)} –{" "}
                            {tanggalPeriode(row.tanggal_selesai)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-hub-muted">
                            Sasaran lulusan
                          </dt>
                          <dd className="mt-1 font-medium">
                            {row.tahun_lulus
                              ? `Lulusan ${row.tahun_lulus}`
                              : "Semua tahun lulusan"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hub-line px-5 py-4 sm:px-6">
                      <p className="text-sm text-hub-muted">
                        <span className="font-semibold tabular-nums text-hub-ink">
                          {row._count.respons}
                        </span>{" "}
                        respons tersimpan
                      </p>
                      <button
                        type="button"
                        className={buttonClass}
                        disabled={pending || !!confirm}
                        onClick={(event) => {
                          actionTrigger.current = event.currentTarget;
                          setConfirm({
                            periode: row,
                            action: row.aktif ? "nonaktifkan" : "aktifkan",
                          });
                          setActionError(null);
                        }}
                      >
                        <Icon
                          name={row.aktif ? "lock" : "check"}
                          className="size-4"
                        />
                        {row.aktif ? "Tutup periode" : "Aktifkan"}
                      </button>
                    </div>
                    {confirm?.periode.id === row.id && (
                      <div className="border-t border-amber-200 bg-amber-50 p-5 sm:p-6">
                        <h4
                          tabIndex={-1}
                          ref={(element) => {
                            element?.focus();
                          }}
                          className="font-semibold text-amber-950 focus:outline-none"
                        >
                          {confirm.action === "aktifkan"
                            ? `Aktifkan “${row.nama}”?`
                            : `Tutup “${row.nama}”?`}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-amber-900">
                          {confirm.action === "aktifkan"
                            ? `${active && active.id !== row.id ? `Periode “${active.nama}” akan dinonaktifkan. ` : ""}Instrumen periode ini akan dikunci. Alumni dapat mengisi sesuai jadwal dan sasaran lulusan periode ini.`
                            : "Pengisian pada periode ini akan ditutup. Respons yang sudah tersimpan tetap tersedia bagi admin."}
                        </p>
                        {actionError && (
                          <p role="alert" className="mt-3 text-sm text-red-800">
                            {actionError}
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={primary}
                            disabled={pending}
                            onClick={changeStatus}
                          >
                            {pending
                              ? "Menyimpan…"
                              : confirm.action === "aktifkan"
                                ? "Ya, aktifkan"
                                : "Ya, tutup periode"}
                          </button>
                          <button
                            type="button"
                            className={buttonClass}
                            disabled={pending}
                            onClick={() => {
                              setConfirm(null);
                              setActionError(null);
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              )}
            </section>

            <section
              aria-labelledby="periode-baru-title"
              className="min-w-0 overflow-hidden rounded-2xl border border-hub-line bg-white"
            >
              <div className="border-b border-hub-line p-5">
                <h2
                  id="periode-baru-title"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Icon name="plus" className="size-5 text-hub-navy" />
                  Buat periode baru
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-hub-muted">
                  Periode disimpan sebagai nonaktif agar dapat diperiksa sebelum
                  dibuka.
                </p>
              </div>
              <form
                ref={formRef}
                onSubmit={create}
                noValidate
                className="space-y-5 p-5"
                aria-busy={pending}
              >
                <div>
                  <label
                    htmlFor="periode-nama"
                    className="mb-2 block text-sm font-medium"
                  >
                    Nama periode <span className="text-hub-muted">(wajib)</span>
                  </label>
                  <input
                    {...field("nama")}
                    required
                    placeholder="Contoh: Tracer Study 2027"
                  />
                  {errorFor("nama")}
                </div>
                <div>
                  <label
                    htmlFor="periode-instrumen"
                    className="mb-2 block text-sm font-medium"
                  >
                    Instrumen tracer{" "}
                    <span className="text-hub-muted">(wajib)</span>
                  </label>
                  <select {...field("instrumen")} required>
                    <option value="">Pilih instrumen</option>
                    {data.instrumen.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.kode} · {i.versi}
                        {i.terkunci ? " · Terkunci" : ""}
                      </option>
                    ))}
                  </select>
                  {errorFor("instrumen")}
                  {(() => {
                    const versi = data.instrumen.find(
                      (i) => i.id === Number(input.instrumen),
                    )?.versi;
                    const info = versi && PENJELASAN_VERSI[versi];
                    return info ? (
                      <p className="mt-2 rounded-lg bg-hub-surface p-3 text-xs leading-relaxed">
                        <strong>Versi {versi}:</strong> {info}
                      </p>
                    ) : null;
                  })()}
                  <p className="mt-2 text-xs leading-relaxed text-hub-muted">
                    {data.instrumen.length
                      ? "Instrumen yang sudah dikunci tetap dapat digunakan untuk periode baru."
                      : "Belum ada instrumen. Siapkan instrumen tracer terlebih dahulu."}
                  </p>
                </div>
                <fieldset className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <legend className="mb-3 text-sm font-medium">
                    Jadwal pengisian{" "}
                    <span className="text-hub-muted">(WIB)</span>
                  </legend>
                  <div>
                    <label
                      htmlFor="periode-mulai"
                      className="mb-2 block text-xs text-hub-muted"
                    >
                      Tanggal mulai (wajib)
                    </label>
                    <input {...field("mulai")} type="date" required />
                    {errorFor("mulai")}
                  </div>
                  <div>
                    <label
                      htmlFor="periode-selesai"
                      className="mb-2 block text-xs text-hub-muted"
                    >
                      Tanggal selesai (wajib)
                    </label>
                    <input
                      {...field("selesai")}
                      type="date"
                      required
                      min={input.mulai || undefined}
                    />
                    {errorFor("selesai")}
                  </div>
                </fieldset>
                <p className="text-xs leading-relaxed text-hub-muted">
                  Mulai pukul 00.00 pada tanggal awal, berakhir pukul 23.59 pada
                  tanggal akhir.
                </p>
                <div>
                  <label
                    htmlFor="periode-tahun"
                    className="mb-2 block text-sm font-medium"
                  >
                    Tahun lulusan{" "}
                    <span className="text-hub-muted">(opsional)</span>
                  </label>
                  <input
                    {...field("tahun")}
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Contoh: 2025"
                  />
                  {errorFor("tahun")}
                  <p className="mt-2 text-xs leading-relaxed text-hub-muted">
                    Kosongkan untuk menerima alumni dari semua tahun lulusan.
                  </p>
                </div>
                {formError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
                  >
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  className={`${primary} w-full`}
                  disabled={pending || !data.instrumen.length || !!confirm}
                >
                  <Icon name={pending ? "clock" : "plus"} className="size-4" />
                  {pending ? "Menyimpan…" : "Simpan periode baru"}
                </button>
              </form>
            </section>
          </div>
        </>
      )}
    </>
  );
}
