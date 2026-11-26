"use client";

import { useState, type FormEvent, type RefObject } from "react";
import { labelNilai, petaNilai, teksButir } from "@/features/tracer/client";
import { Icon } from "@/shared/components/icons";
import { buttonClass, fieldClass, tanggal, type AdminDetail } from "../lib/api";
import { bagianRespons, kosong } from "../lib/review";
import { StatusBadge } from "./status-badge";

type Decision = "DIVERIFIKASI" | "PERLU_REVISI";
type Props = {
  data: AdminDetail;
  note: string;
  setNote: (value: string) => void;
  noteRef: RefObject<HTMLTextAreaElement | null>;
  decision: Decision;
  setDecision: (value: Decision) => void;
  pending: boolean;
  actionError: string | null;
  success: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const sumber = {
  LMS: "Data kampus",
  PASSPORT: "Passport",
  RUMUS: "Perhitungan sistem",
  AI: "Usulan AI",
  ALUMNI: "Diisi alumni",
};
const statusJawaban = {
  USULAN: "Belum dikonfirmasi alumni",
  KONFIRMASI: "Dikonfirmasi alumni",
  DIUBAH: "Diubah alumni",
  DIISI: "Diisi alumni",
};

export function ResponsReview({
  data,
  note,
  setNote,
  noteRef,
  decision,
  setDecision,
  pending,
  actionError,
  success,
  onSubmit,
}: Props) {
  const [search, setSearch] = useState("");
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const groups = bagianRespons(data);
  const all = groups.flatMap((g) => g.butir);
  const answers = new Map(data.jawaban.map((j) => [j.kode, j]));
  const values = petaNilai(data.jawaban);
  const filled = all.filter((b) => !kosong(answers.get(b.kode)?.nilai)).length;
  const requiredEmpty = all.filter(
    (b) => data.aturan?.[b.kode]?.wajib && kosong(answers.get(b.kode)?.nilai),
  ).length;
  const textAnswer = (b: (typeof all)[number]) => {
    const answer = answers.get(b.kode);
    return !answer || kosong(answer.nilai)
      ? ""
      : (answer.label ??
          labelNilai(b, answer.nilai, answer.range ? [answer.range] : []));
  };
  const query = search.trim().toLocaleLowerCase("id-ID");
  const filtered = groups
    .map((g) => ({
      ...g,
      butir: g.butir.filter(
        (b) =>
          (!onlyEmpty || kosong(answers.get(b.kode)?.nilai)) &&
          (!query ||
            `${b.kode} ${teksButir(b, values)} ${textAnswer(b)}`
              .toLocaleLowerCase("id-ID")
              .includes(query)),
      ),
    }))
    .filter((g) => g.butir.length);
  const shown = filtered.reduce((total, g) => total + g.butir.length, 0);
  const canReview = data.status === "DIKIRIM";
  const ready = !!data.instrumen && !!data.aturan;

  return (
    <>
      <header className="overflow-hidden rounded-2xl border border-hub-line bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hub-line bg-hub-navy px-5 py-4 sm:px-7">
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            <Icon name="clipboard" className="size-4" />
            Tinjauan Tracer Study
          </p>
          <span className="rounded-full bg-white px-1 py-1">
            <StatusBadge status={data.status} />
          </span>
        </div>
        <div className="flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-hub-navy/5 text-xl font-semibold text-hub-navy"
            >
              {data.mahasiswa.nama
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-hub-muted">
                RESPONS ALUMNI #{data.id}
              </p>
              <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-3xl">
                {data.mahasiswa.nama}
              </h1>
              <p className="mt-2 text-sm text-hub-muted [overflow-wrap:anywhere]">
                {data.mahasiswa.npm} ·{" "}
                {data.mahasiswa.prodi?.nama ?? "Program studi belum tersedia"}
              </p>
            </div>
          </div>
          <dl className="grid gap-4 border-t border-hub-line pt-5 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Icon name="calendar" className="mt-0.5 size-4 text-hub-muted" />
              <div>
                <dt className="text-xs text-hub-muted">Tanggal pengiriman</dt>
                <dd className="mt-1 font-medium">{tanggal(data.dikirimAt)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="book" className="mt-0.5 size-4 text-hub-muted" />
              <div>
                <dt className="text-xs text-hub-muted">Instrumen tracer</dt>
                <dd className="mt-1 font-medium">
                  {data.instrumen
                    ? `${data.instrumen.nama ?? data.instrumen.kode} · ${data.instrumen.versi}`
                    : "Belum tersedia"}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </header>

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-hub-teal/30 bg-hub-teal/10 p-5 text-sm font-medium text-hub-teal-dark"
        >
          <Icon name="check" />
          {success}
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <section
            aria-label="Ringkasan jawaban"
            className="grid grid-cols-3 overflow-hidden rounded-2xl border border-hub-line bg-white divide-x divide-hub-line"
          >
            {[
              {
                label: "Pertanyaan tampil",
                value: all.length,
                color: "text-hub-ink",
              },
              {
                label: "Sudah terisi",
                value: filled,
                color: "text-hub-teal-dark",
              },
              {
                label: "Wajib belum diisi",
                value: requiredEmpty,
                color: requiredEmpty ? "text-amber-800" : "text-hub-ink",
              },
            ].map((stat) => (
              <div key={stat.label} className="px-3 py-5 sm:px-5">
                <p
                  className={`text-2xl font-semibold tabular-nums ${stat.color}`}
                >
                  {ready ? stat.value : "—"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-hub-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </section>

          <section aria-labelledby="jawaban-title" className="space-y-4">
            <div className="rounded-2xl border border-hub-line bg-white p-5">
              <h2 id="jawaban-title" className="text-lg font-semibold">
                Jawaban alumni
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-hub-muted">
                Periksa jawaban per bagian. Buka detail sumber bila perlu
                menelusuri asal jawaban.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="cari-jawaban"
                    className="mb-2 block text-xs font-medium text-hub-muted"
                  >
                    Cari pertanyaan atau jawaban
                  </label>
                  <input
                    id="cari-jawaban"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ketik kata kunci atau kode pertanyaan…"
                    className={`${fieldClass} text-base sm:text-sm`}
                  />
                </div>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-hub-line px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={onlyEmpty}
                    onChange={(e) => setOnlyEmpty(e.target.checked)}
                    className="size-4 accent-hub-navy"
                  />
                  Belum diisi
                </label>
              </div>
              <p
                role="status"
                aria-atomic="true"
                className="mt-3 text-xs text-hub-muted"
              >
                Menampilkan {shown} dari {all.length} pertanyaan yang berlaku
                untuk alumni ini.
              </p>
            </div>

            {!data.instrumen ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                <h3 className="font-semibold">Instrumen belum tersedia</h3>
                <p className="mt-2">
                  Jawaban belum dapat ditampilkan. Muat ulang halaman atau
                  hubungi pengelola instrumen sebelum memverifikasi.
                </p>
              </div>
            ) : !filtered.length ? (
              <div className="rounded-2xl border border-hub-line bg-white p-8 text-center">
                <Icon
                  name="clipboard"
                  className="mx-auto size-8 text-hub-muted"
                />
                <h3 className="mt-3 font-semibold">
                  {all.length
                    ? "Tidak ada jawaban yang cocok"
                    : "Belum ada pertanyaan untuk ditampilkan"}
                </h3>
                <p className="mt-2 text-sm text-hub-muted">
                  {all.length
                    ? "Coba kata kunci lain atau tampilkan semua jawaban."
                    : "Pertanyaan akan muncul sesuai instrumen dan kondisi jawaban alumni."}
                </p>
                {(search || onlyEmpty) && (
                  <button
                    type="button"
                    className={`${buttonClass} mt-4`}
                    onClick={() => {
                      setSearch("");
                      setOnlyEmpty(false);
                    }}
                  >
                    Tampilkan semua jawaban
                  </button>
                )}
              </div>
            ) : (
              filtered.map((group, index) => (
                <details
                  key={group.nomor}
                  open
                  className="group/section overflow-hidden rounded-2xl border border-hub-line bg-white"
                >
                  <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 p-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-hub-navy [&::-webkit-details-marker]:hidden">
                    <span
                      aria-hidden="true"
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-hub-navy/5 text-sm font-semibold text-hub-navy"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <h3 className="font-semibold [overflow-wrap:anywhere]">
                        {group.judul}
                      </h3>
                      <span className="mt-1 block text-xs text-hub-muted">
                        {
                          group.butir.filter(
                            (b) => !kosong(answers.get(b.kode)?.nilai),
                          ).length
                        }{" "}
                        dari {group.butir.length} jawaban terisi
                      </span>
                    </span>
                    <Icon
                      name="chevron"
                      className="size-4 shrink-0 text-hub-muted group-open/section:rotate-180"
                    />
                  </summary>
                  <dl className="divide-y divide-hub-line border-t border-hub-line">
                    {group.butir.map((b) => {
                      const answer = answers.get(b.kode);
                      const empty = kosong(answer?.nilai);
                      const required = data.aturan?.[b.kode]?.wajib;
                      return (
                        <div key={b.kode} className="p-5 sm:p-6">
                          <dt>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs text-hub-muted">
                                {b.kode}
                              </span>
                              {required && (
                                <span className="rounded bg-hub-canvas px-2 py-0.5 text-xs font-medium text-hub-muted">
                                  Wajib
                                </span>
                              )}
                              {answer?.status === "USULAN" && (
                                <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
                                  Menunggu konfirmasi alumni
                                </span>
                              )}
                            </div>
                            <p className="text-base font-medium leading-relaxed [overflow-wrap:anywhere]">
                              {teksButir(b, values)}
                            </p>
                          </dt>
                          <dd className="mt-3">
                            <div
                              className={`whitespace-pre-wrap rounded-xl border px-4 py-3 text-base leading-relaxed [overflow-wrap:anywhere] ${empty ? (required ? "border-amber-200 bg-amber-50 text-amber-900" : "border-dashed border-hub-line text-hub-muted") : "border-transparent bg-hub-canvas text-hub-ink"}`}
                            >
                              {empty ? (
                                <span className="flex items-center gap-2">
                                  <Icon name="minus" className="size-4" />
                                  Belum diisi
                                  {required ? " · Jawaban wajib" : ""}
                                </span>
                              ) : (
                                textAnswer(b)
                              )}
                            </div>
                            {answer && !empty && (
                              <details className="mt-2">
                                <summary className="min-h-11 w-fit cursor-pointer rounded-lg py-3 text-xs font-medium text-hub-muted focus-visible:outline-2 focus-visible:outline-hub-navy">
                                  Detail sumber jawaban
                                </summary>
                                <p className="pb-1 text-xs leading-relaxed text-hub-muted">
                                  {sumber[answer.sumber]} ·{" "}
                                  {statusJawaban[answer.status]}
                                </p>
                              </details>
                            )}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </details>
              ))
            )}
          </section>
        </div>

        <aside
          aria-labelledby="keputusan-title"
          className="min-w-0 space-y-4 xl:sticky xl:top-6"
        >
          <section className="overflow-hidden rounded-2xl border border-hub-line bg-white shadow-sm">
            <div className="border-b border-hub-line p-5">
              <div className="flex items-center gap-2">
                <Icon
                  name={canReview ? "clipboard" : "lock"}
                  className="size-5 text-hub-navy"
                />
                <h2 id="keputusan-title" className="text-lg font-semibold">
                  {canReview ? "Keputusan verifikasi" : "Status tinjauan"}
                </h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-hub-muted">
                {canReview
                  ? "Tentukan hasil pemeriksaan setelah meninjau jawaban alumni."
                  : "Informasi tindak lanjut respons alumni."}
              </p>
            </div>
            {canReview ? (
              <form
                onSubmit={onSubmit}
                noValidate
                className="space-y-5 p-5"
                aria-busy={pending}
              >
                <fieldset disabled={pending} className="space-y-3">
                  <legend className="mb-3 text-sm font-semibold">
                    Hasil pemeriksaan
                  </legend>
                  {(
                    [
                      {
                        value: "DIVERIFIKASI",
                        title: "Verifikasi respons",
                        description: "Jawaban sudah sesuai dan dapat diterima.",
                        icon: "check",
                      },
                      {
                        value: "PERLU_REVISI",
                        title: "Minta revisi",
                        description: "Kembalikan ke alumni untuk diperbaiki.",
                        icon: "book",
                      },
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.value}
                      className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${decision === option.value ? "border-hub-navy bg-hub-navy/5" : "border-hub-line hover:bg-hub-canvas"}`}
                    >
                      <input
                        type="radio"
                        name="keputusan"
                        value={option.value}
                        checked={decision === option.value}
                        onChange={() => setDecision(option.value)}
                        className="mt-1 size-4 shrink-0 accent-hub-navy"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <Icon name={option.icon} className="size-4" />
                          {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-hub-muted">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div>
                  <label
                    htmlFor="catatan"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Catatan untuk alumni{" "}
                    <span className="font-normal text-hub-muted">
                      {decision === "PERLU_REVISI" ? "(wajib)" : "(opsional)"}
                    </span>
                  </label>
                  <textarea
                    ref={noteRef}
                    id="catatan"
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required={decision === "PERLU_REVISI"}
                    disabled={pending}
                    aria-invalid={
                      !!actionError &&
                      decision === "PERLU_REVISI" &&
                      !note.trim()
                    }
                    aria-describedby={
                      actionError
                        ? "catatan-hint keputusan-error"
                        : "catatan-hint"
                    }
                    placeholder={
                      decision === "PERLU_REVISI"
                        ? "Jelaskan bagian yang perlu diperbaiki…"
                        : "Tambahkan catatan jika diperlukan…"
                    }
                    className={`${fieldClass} resize-y text-base sm:text-sm`}
                  />
                  <p
                    id="catatan-hint"
                    className="mt-2 text-xs leading-relaxed text-hub-muted"
                  >
                    {decision === "PERLU_REVISI"
                      ? "Sebutkan pertanyaan dan perbaikan yang diperlukan agar alumni mudah menindaklanjuti."
                      : "Catatan akan disimpan bersama hasil verifikasi."}
                  </p>
                </div>
                {actionError && (
                  <p
                    id="keputusan-error"
                    role="alert"
                    className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
                  >
                    {actionError}
                  </p>
                )}
                {!ready && (
                  <p className="text-sm text-amber-900">
                    Verifikasi belum tersedia karena instrumen atau aturan
                    pertanyaan belum dapat dimuat.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending || (decision === "DIVERIFIKASI" && !ready)}
                  className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-hub-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-hub-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-navy disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon
                    name={
                      pending
                        ? "clock"
                        : decision === "DIVERIFIKASI"
                          ? "check"
                          : "arrow"
                    }
                    className="size-4"
                  />
                  {pending
                    ? "Menyimpan keputusan…"
                    : decision === "DIVERIFIKASI"
                      ? "Simpan verifikasi"
                      : "Kirim permintaan revisi"}
                </button>
              </form>
            ) : (
              <div className="space-y-4 p-5">
                <StatusBadge status={data.status} />
                <p className="text-sm leading-relaxed text-hub-muted">
                  {data.status === "DRAFT"
                    ? "Alumni masih mengisi tracer. Verifikasi dapat dilakukan setelah seluruh respons dikirim."
                    : data.status === "PERLU_REVISI"
                      ? "Menunggu alumni memperbaiki jawaban dan mengirim ulang respons."
                      : data.status === "DILAPORKAN"
                        ? "Respons alumni telah ditandai sebagai sudah dilaporkan."
                        : "Respons telah diverifikasi. Jawaban tetap dapat ditinjau di halaman ini."}
                </p>
                {data.verifikasi?.catatan && (
                  <div className="rounded-xl bg-hub-canvas p-4">
                    <h3 className="text-sm font-semibold">
                      Catatan verifikasi
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-hub-muted [overflow-wrap:anywhere]">
                      {data.verifikasi.catatan}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
          {ready && requiredEmpty > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              <p className="font-semibold">Perlu diperiksa kembali</p>
              <p className="mt-1">
                Ada {requiredEmpty} jawaban wajib yang kosong. Gunakan filter
                “Belum diisi” untuk menemukannya sebelum memberi keputusan.
              </p>
            </div>
          )}
          <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-hub-muted">
            <Icon name="lock" className="mt-0.5 size-4 shrink-0" />
            Jawaban alumni ditampilkan untuk keperluan pemeriksaan tracer sesuai
            hak akses akun Anda.
          </p>
        </aside>
      </div>
    </>
  );
}
