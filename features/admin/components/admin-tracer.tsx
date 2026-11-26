"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StatusRespons } from "@/features/tracer";
import { Icon } from "@/shared/components/icons";
import {
  adminApi,
  buttonClass,
  eksporCsv,
  fieldClass,
  statuses,
  tanggal,
  type AdminList,
  type Periode,
  type Prodi,
} from "../lib/api";
import { StatusBadge } from "./status-badge";

export function AdminTracer({
  canFilterProdi,
  initialPeriode = "",
  initialProdi = "",
}: {
  canFilterProdi: boolean;
  initialPeriode?: string;
  initialProdi?: string;
}) {
  const [prodi, setProdi] = useState<Prodi[]>([]);
  const [prodiId, setProdiId] = useState(canFilterProdi ? initialProdi : "");
  const [prodiError, setProdiError] = useState(false);
  const [periode, setPeriode] = useState<Periode[]>([]);
  const [periodeId, setPeriodeId] = useState(initialPeriode);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState<AdminList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [periodeError, setPeriodeError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const filters = new URLSearchParams();
  if (periodeId) filters.set("periode_id", periodeId);
  if (status) filters.set("status", status);
  if (canFilterProdi && prodiId) filters.set("prodi_id", prodiId);
  const filterQuery = filters.toString();

  useEffect(() => {
    const controller = new AbortController();
    adminApi<Periode[]>("periode", { signal: controller.signal })
      .then((rows) => {
        setPeriode(rows);
        setPeriodeError(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setPeriodeError(true);
      });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    if (!canFilterProdi) return;
    const controller = new AbortController();
    adminApi<Prodi[]>("prodi", { signal: controller.signal })
      .then((rows) => {
        setProdi(rows);
        setProdiError(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setProdiError(true);
      });
    return () => controller.abort();
  }, [canFilterProdi, reload]);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams(filterQuery);
    query.set("page", String(page));
    query.set("limit", "20");
    adminApi<AdminList>(`respons?${query}`, { signal: controller.signal })
      .then(setData)
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, filterQuery, reload]);

  async function downloadCsv() {
    setExporting(true);
    setExportError(null);
    setExportSuccess(false);
    try {
      const blob = await eksporCsv(filterQuery);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tracer-study.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportSuccess(true);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Ekspor gagal. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  }

  function refresh() {
    setError(null);
    setLoading(true);
    setReload((n) => n + 1);
  }
  function filter(kind: "periode" | "status" | "prodi", value: string) {
    if (
      (kind === "periode" ? periodeId : kind === "prodi" ? prodiId : status) ===
      value
    )
      return;
    setLoading(true);
    setError(null);
    setPage(1);
    setExportError(null);
    setExportSuccess(false);
    if (kind === "periode") setPeriodeId(value);
    else if (kind === "prodi") setProdiId(value);
    else setStatus(value);
  }
  function goToPage(value: number) {
    setLoading(true);
    setError(null);
    setPage(value);
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.batas)) : 1;
  return (
    <>
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-hub-teal-dark">
            Tracer Study
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Kelola respons alumni
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-hub-muted">
            Tinjau jawaban alumni, verifikasi respons yang lengkap, atau kirim
            catatan perbaikan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadCsv}
            disabled={exporting || loading || !!error || !data?.total}
            aria-busy={exporting}
            aria-describedby="export-help"
            className={buttonClass}
          >
            <Icon name="download" className="size-4" />
            {exporting ? "Menyiapkan CSV…" : "Ekspor CSV"}
          </button>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className={buttonClass}
          >
            <Icon name="flip" className="size-4" />
            Muat ulang
          </button>
        </div>
      </section>

      <div className="space-y-2 text-sm">
        <p id="export-help" className="text-hub-muted">
          Ekspor mencakup seluruh respons sesuai filter, termasuk halaman lainnya.
        </p>
        {exportError && (
          <p role="alert" className="text-red-800">{exportError}</p>
        )}
        <p role="status" className="text-hub-teal-dark">
          {exportSuccess ? "Unduhan CSV sudah dimulai." : ""}
        </p>
      </div>

      <section
        aria-labelledby="respons-title"
        className="overflow-hidden rounded-2xl border border-hub-line bg-white"
      >
        <div
          className={`grid gap-4 border-b border-hub-line p-5 sm:grid-cols-2 sm:p-6 ${canFilterProdi ? "xl:grid-cols-3" : ""}`}
        >
          {canFilterProdi && (
            <div>
              <label htmlFor="prodi" className="mb-2 block text-sm font-medium">
                Program studi
              </label>
              <select
                id="prodi"
                className={fieldClass}
                value={prodiId}
                onChange={(e) => filter("prodi", e.target.value)}
              >
                <option value="">Semua program studi</option>
                {prodi.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="periode" className="mb-2 block text-sm font-medium">
              Periode pelaporan
            </label>
            <select
              id="periode"
              className={fieldClass}
              value={periodeId}
              onChange={(e) => filter("periode", e.target.value)}
            >
              <option value="">Semua periode</option>
              {periode.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                  {p.aktif ? " · Aktif" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="mb-2 block text-sm font-medium">
              Status respons
            </label>
            <select
              id="status"
              className={fieldClass}
              value={status}
              onChange={(e) => filter("status", e.target.value)}
            >
              <option value="">Semua status</option>
              {Object.entries(statuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {periodeError && (
            <p role="alert" className="text-sm text-amber-900 sm:col-span-2">
              Daftar periode gagal dimuat. Tekan Muat ulang untuk mencoba
              kembali.
            </p>
          )}
          {canFilterProdi && prodiError && (
            <p role="alert" className="text-sm text-amber-900 sm:col-span-full">
              Daftar program studi gagal dimuat. Tekan Muat ulang untuk mencoba
              kembali.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
          <h2 id="respons-title" className="font-semibold">
            Daftar respons
          </h2>
          <p className="text-sm text-hub-muted" role="status">
            {loading
              ? "Memuat respons…"
              : error
                ? "Data belum tersedia"
                : `${data?.total ?? 0} respons sesuai filter`}
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{error}</p>
            <button className={`${buttonClass} mt-3`} onClick={refresh}>
              Coba lagi
            </button>
          </div>
        ) : loading ? (
          <div role="status" className="space-y-3 px-6 pb-6">
            <span className="sr-only">Memuat daftar respons</span>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-16 rounded-xl bg-hub-canvas motion-safe:animate-pulse"
              />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="px-6 py-14 text-center">
            <Icon
              name="clipboard"
              className="mx-auto mb-3 size-8 text-hub-muted"
            />
            <p className="font-semibold">Belum ada respons</p>
            <p className="mt-2 text-sm text-hub-muted">
              Respons alumni akan muncul di sini. Coba pilih periode atau status
              lain.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <caption className="sr-only">
                  Respons tracer alumni yang dapat diakses oleh akun admin ini
                </caption>
                <thead className="border-y border-hub-line bg-hub-canvas text-hub-muted">
                  <tr>
                    {[
                      "Alumni",
                      "Program studi",
                      "Status",
                      "Tanggal kirim",
                      "Tindakan",
                    ].map((label) => (
                      <th
                        key={label}
                        scope="col"
                        className="px-6 py-3 text-xs font-semibold"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hub-line">
                  {data.data.map((row) => (
                    <tr key={row.id} className="hover:bg-hub-canvas/50">
                      <th scope="row" className="px-6 py-4 font-normal">
                        <p className="font-semibold">{row.mahasiswa.nama}</p>
                        <p className="mt-1 text-xs text-hub-muted">
                          {row.mahasiswa.npm}
                        </p>
                      </th>
                      <td className="px-6 py-4">
                        {row.mahasiswa.prodi?.nama ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status as StatusRespons} />
                        {row.status === "DRAFT" && row.inti_dikirim_at && (
                          <p className="mt-1 text-xs text-hub-muted">
                            Bagian inti sudah dikirim
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-hub-muted">
                        {tanggal(row.dikirim_at)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/respons/${row.id}`}
                          className={buttonClass}
                          aria-label={`Tinjau respons ${row.mahasiswa.nama}`}
                        >
                          Tinjau
                          <Icon name="arrow" className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav
              aria-label="Halaman respons"
              className="flex flex-wrap items-center justify-between gap-3 border-t border-hub-line px-5 py-4 sm:px-6"
            >
              <p className="text-sm text-hub-muted">
                Halaman {data.halaman} dari {pages}
              </p>
              <div className="flex gap-2">
                <button
                  className={buttonClass}
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Sebelumnya
                </button>
                <button
                  className={buttonClass}
                  disabled={page >= pages}
                  onClick={() => goToPage(page + 1)}
                >
                  Berikutnya
                </button>
              </div>
            </nav>
          </>
        )}
      </section>
      <p className="flex items-start gap-2 text-xs leading-relaxed text-hub-muted">
        <Icon name="lock" className="size-4" />
        Data ditampilkan sesuai hak akses akun. Admin prodi hanya dapat meninjau
        alumni dari program studinya.
      </p>
    </>
  );
}
