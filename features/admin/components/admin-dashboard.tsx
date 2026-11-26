"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/shared/components/icons";
import {
  adminApi,
  buttonClass,
  fieldClass,
  statuses,
  tanggal,
  type Periode,
  type Prodi,
} from "../lib/api";
import type { DashboardData } from "../lib/dashboard";
import { tanggalPeriode } from "../lib/periode";
import { StatusBadge } from "./status-badge";

const statusColors = {
  DRAFT: "bg-slate-400",
  DIKIRIM: "bg-hub-navy",
  DIVERIFIKASI: "bg-hub-teal-dark",
  PERLU_REVISI: "bg-amber-600",
  DILAPORKAN: "bg-sky-600",
} as const;

export function AdminDashboard({
  nama,
  isBpkha,
  prodi,
}: {
  nama: string;
  isBpkha: boolean;
  prodi?: string;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [periodeId, setPeriodeId] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [meta, setMeta] = useState<{ periode: Periode[]; prodi: Prodi[] }>({
    periode: [],
    prodi: [],
  });
  const [metaError, setMetaError] = useState(false);
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      adminApi<Periode[]>("periode", { signal: controller.signal }),
      isBpkha
        ? adminApi<Prodi[]>("prodi", { signal: controller.signal })
        : Promise.resolve([] as Prodi[]),
    ])
      .then(([periode, programs]) => {
        if (!controller.signal.aborted) {
          setMeta({ periode, prodi: programs });
          setMetaLoaded(true);
          setMetaError(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setMetaError(true);
      });
    return () => controller.abort();
  }, [isBpkha, reload]);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams();
    if (periodeId) query.set("periode_id", periodeId);
    if (isBpkha && prodiId) query.set("prodi_id", prodiId);
    adminApi<DashboardData>(`dashboard?${query}`, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [periodeId, prodiId, isBpkha, reload]);

  function refresh() {
    setError(null);
    setLoading(true);
    setReload((value) => value + 1);
  }
  function filter(kind: "periode" | "prodi", value: string) {
    if ((kind === "periode" ? periodeId : prodiId) === value) return;
    setError(null);
    setLoading(true);
    if (kind === "periode") setPeriodeId(value);
    else setProdiId(value);
  }
  const scope = isBpkha
    ? (meta.prodi.find((row) => String(row.id) === prodiId)?.nama ??
      "Seluruh universitas")
    : (prodi ?? "Program studi Anda");
  const active =
    meta.periode.find((row) => row.aktif) ??
    (data?.periode?.aktif ? data.periode : null);
  const verified = data ? data.status.DIVERIFIKASI + data.status.DILAPORKAN : 0;
  const listQuery = new URLSearchParams();
  if (data?.periode) listQuery.set("periode_id", String(data.periode.id));
  if (isBpkha && prodiId) listQuery.set("prodi_id", prodiId);
  const listHref = `/admin/respons${listQuery.size ? `?${listQuery}` : ""}`;

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-hub-teal-dark">
            Ruang {isBpkha ? "BPKHA" : "Program Studi"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard Tracer Study
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-hub-muted">
            Halo, {nama}. Pantau pengisian dan tindak lanjut respons alumni dari
            sini.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className={buttonClass}
        >
          <Icon name="flip" className="size-4" />
          Muat ulang
        </button>
      </header>

      <section
        aria-label="Filter dashboard"
        className="rounded-2xl border border-hub-line bg-white p-5"
      >
        <div className={`grid gap-4 ${isBpkha ? "sm:grid-cols-2" : ""}`}>
          <div>
            <label
              htmlFor="dashboard-periode"
              className="mb-2 block text-sm font-medium"
            >
              Periode pelaporan
            </label>
            <select
              id="dashboard-periode"
              value={periodeId}
              onChange={(e) => filter("periode", e.target.value)}
              className={fieldClass}
            >
              <option value="">
                {active
                  ? `Aktif: ${active.nama}`
                  : "Otomatis: periode aktif atau semua periode"}
              </option>
              <option value="semua">Semua periode</option>
              {meta.periode.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.nama}
                </option>
              ))}
            </select>
          </div>
          {isBpkha && (
            <div>
              <label
                htmlFor="dashboard-prodi"
                className="mb-2 block text-sm font-medium"
              >
                Program studi
              </label>
              <select
                id="dashboard-prodi"
                value={prodiId}
                onChange={(e) => filter("prodi", e.target.value)}
                className={fieldClass}
              >
                <option value="">Semua program studi</option>
                {meta.prodi.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.nama}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {metaError && (
          <p role="alert" className="mt-3 text-sm text-amber-900">
            Pilihan filter gagal dimuat. Tekan Muat ulang untuk mencoba kembali.
          </p>
        )}
        <p
          role="status"
          aria-atomic="true"
          className="mt-3 text-xs text-hub-muted"
        >
          {loading
            ? "Memuat ringkasan tracer…"
            : error
              ? "Ringkasan belum tersedia."
              : `${scope} · ${data?.periode?.nama ?? "Semua periode"}`}
        </p>
      </section>

      {error ? (
        <section
          role="alert"
          className="rounded-2xl border border-hub-line bg-white p-8 text-center"
        >
          <h2 className="text-lg font-semibold">
            Dashboard belum dapat dimuat
          </h2>
          <p className="mt-2 text-sm text-red-800">{error}</p>
          <button
            type="button"
            className={`${buttonClass} mt-4`}
            onClick={refresh}
          >
            Coba lagi
          </button>
        </section>
      ) : loading || !data ? (
        <div role="status" className="space-y-5">
          <span className="sr-only">Memuat data dashboard…</span>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-36 rounded-2xl bg-white motion-safe:animate-pulse"
              />
            ))}
          </div>
          <div className="h-80 rounded-2xl bg-white motion-safe:animate-pulse" />
        </div>
      ) : (
        <>
          <section
            aria-label="Ringkasan respons"
            className="grid grid-cols-2 gap-4 xl:grid-cols-4"
          >
            {[
              {
                label: "Respons tercatat",
                count: data.total,
                note: "Termasuk respons yang masih draf",
                icon: "clipboard" as const,
                color: "bg-hub-navy/5 text-hub-navy",
              },
              {
                label: "Menunggu verifikasi",
                count: data.status.DIKIRIM,
                note: "Respons terkirim untuk ditinjau",
                icon: "clock" as const,
                color: "bg-amber-50 text-amber-900",
              },
              {
                label: "Terverifikasi",
                count: verified,
                note: "Termasuk yang sudah dilaporkan",
                icon: "check" as const,
                color: "bg-hub-teal/10 text-hub-teal-dark",
              },
              {
                label: "Perlu revisi",
                count: data.status.PERLU_REVISI,
                note: "Menunggu perbaikan dari alumni",
                icon: "book" as const,
                color: "bg-sky-50 text-sky-900",
              },
            ].map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-hub-line bg-white p-4 sm:p-5"
              >
                <div
                  className={`mb-4 flex size-10 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon name={stat.icon} />
                </div>
                <h2 className="text-xs font-medium text-hub-muted sm:text-sm">
                  {stat.label}
                </h2>
                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
                  {stat.count.toLocaleString("id-ID")}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-hub-muted">
                  {stat.note}
                </p>
              </article>
            ))}
          </section>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <section
              aria-labelledby="status-dashboard-title"
              className="rounded-2xl border border-hub-line bg-white p-5 sm:p-6"
            >
              <h2 id="status-dashboard-title" className="text-lg font-semibold">
                Sebaran status respons
              </h2>
              <p className="mt-1 text-sm text-hub-muted">
                Jumlah respons sesuai periode dan cakupan yang dipilih.
              </p>
              {data.total ? (
                <ul className="mt-6 space-y-5">
                  {(Object.keys(statuses) as (keyof typeof statuses)[]).map(
                    (status) => (
                      <li key={status}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span>{statuses[status]}</span>
                          <span className="font-semibold tabular-nums">
                            {data.status[status].toLocaleString("id-ID")}{" "}
                            <span className="font-normal text-hub-muted">
                              (
                              {Math.round(
                                (data.status[status] / data.total) * 100,
                              )}
                              %)
                            </span>
                          </span>
                        </div>
                        <div
                          aria-hidden="true"
                          className="h-2 overflow-hidden rounded-full bg-hub-canvas"
                        >
                          <div
                            className={`h-full rounded-full ${statusColors[status]}`}
                            style={{
                              width: `${(data.status[status] / data.total) * 100}%`,
                            }}
                          />
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <div className="py-12 text-center">
                  <Icon
                    name="clipboard"
                    className="mx-auto size-8 text-hub-muted"
                  />
                  <h3 className="mt-3 font-semibold">Belum ada respons</h3>
                  <p className="mt-2 text-sm text-hub-muted">
                    Coba periode atau program studi lain.
                  </p>
                </div>
              )}
              <p className="mt-6 border-t border-hub-line pt-4 text-xs leading-relaxed text-hub-muted">
                Angka ini menghitung respons yang tercatat, bukan persentase
                partisipasi seluruh alumni.
              </p>
            </section>

            <div className="space-y-5">
              <section className="overflow-hidden rounded-2xl bg-hub-navy p-5 text-white sm:p-6">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
                  <Icon name="calendar" className="size-4" />
                  {data.periode ? "Periode ditampilkan" : "Seluruh periode"}
                </div>
                <h2 className="mt-4 text-xl font-semibold [overflow-wrap:anywhere]">
                  {data.periode?.nama ?? "Rekap lintas periode"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {data.periode
                    ? `${tanggalPeriode(data.periode.tanggal_mulai)} – ${tanggalPeriode(data.periode.tanggal_selesai)} · WIB`
                    : "Ringkasan menggabungkan respons dari seluruh periode tracer yang dapat Anda akses."}
                </p>
                {data.periode && (
                  <p className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                    {data.periode.aktif ? "Periode aktif" : "Periode nonaktif"}{" "}
                    ·{" "}
                    {data.periode.tahun_lulus
                      ? `Lulusan ${data.periode.tahun_lulus}`
                      : "Semua tahun lulusan"}
                  </p>
                )}
                {metaLoaded && !active && (
                  <p className="mt-4 border-t border-white/20 pt-4 text-xs leading-relaxed text-white/80">
                    Belum ada periode aktif.{" "}
                    {isBpkha
                      ? "Buka pengaturan periode untuk mengaktifkan pengisian tracer."
                      : "Pengisian tracer dibuka oleh pengelola BPKHA."}
                  </p>
                )}
              </section>
              <section className="rounded-2xl border border-hub-line bg-white p-5 sm:p-6">
                <h2 className="text-lg font-semibold">Tindak lanjut</h2>
                <p className="mt-2 text-sm leading-relaxed text-hub-muted">
                  {data.status.DIKIRIM
                    ? `Ada ${data.status.DIKIRIM} respons menunggu pemeriksaan pada cakupan ini.`
                    : "Tidak ada respons menunggu verifikasi pada cakupan ini."}
                </p>
                <Link href={listHref} className={`${buttonClass} mt-4 w-full`}>
                  Kelola respons
                  <Icon name="arrow" className="size-4" />
                </Link>
                {isBpkha && (
                  <Link
                    href="/admin/periode"
                    className={`${buttonClass} mt-3 w-full`}
                  >
                    Atur periode tracer
                    <Icon name="calendar" className="size-4" />
                  </Link>
                )}
              </section>
            </div>
          </div>

          <section
            aria-labelledby="respons-terbaru-title"
            className="overflow-hidden rounded-2xl border border-hub-line bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hub-line p-5 sm:px-6">
              <div>
                <h2
                  id="respons-terbaru-title"
                  className="text-lg font-semibold"
                >
                  Respons terbaru
                </h2>
                <p className="mt-1 text-sm text-hub-muted">
                  Lima respons yang paling baru dibuat, sesuai filter dashboard.
                </p>
              </div>
              <Link href={listHref} className={buttonClass}>
                Lihat daftar respons
                <Icon name="arrow" className="size-4" />
              </Link>
            </div>
            {!data.terbaru.length ? (
              <p className="p-8 text-center text-sm text-hub-muted">
                Respons alumni akan muncul di sini setelah pengisian dimulai.
              </p>
            ) : (
              <ul className="divide-y divide-hub-line">
                {data.terbaru.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold [overflow-wrap:anywhere]">
                        {row.mahasiswa.nama}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-hub-muted">
                        {row.mahasiswa.npm} ·{" "}
                        {row.mahasiswa.prodi?.nama ??
                          "Program studi belum tersedia"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="sm:text-right">
                        <StatusBadge status={row.status} />
                        <p className="mt-1 text-xs text-hub-muted">
                          {tanggal(row.dikirim_at)}
                        </p>
                      </div>
                      <Link
                        href={`/admin/respons/${row.id}`}
                        className={buttonClass}
                        aria-label={`Tinjau respons ${row.mahasiswa.nama}`}
                      >
                        Tinjau
                        <Icon name="arrow" className="size-4" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
