"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { adminApi, buttonClass, type AdminDetail } from "../lib/api";
import { Icon } from "@/shared/components/icons";
import { ResponsReview } from "./respons-review";

export function AdminRespons({ id }: { id: string }) {
  const [data, setData] = useState<AdminDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [decision, setDecision] = useState<"DIVERIFIKASI" | "PERLU_REVISI">(
    "DIVERIFIKASI",
  );
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    adminApi<AdminDetail>(`respons/${id}`, { signal: controller.signal })
      .then((detail) => {
        if (controller.signal.aborted) return;
        setData(detail);
        setNote(detail.verifikasi?.catatan ?? "");
      })
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [id, reload]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !data || data.status !== "DIKIRIM") return;
    const action = decision;
    setActionError(null);
    setSuccess(null);
    if (action === "PERLU_REVISI" && !note.trim()) {
      setActionError("Isi catatan perbaikan sebelum meminta revisi.");
      noteRef.current?.focus();
      return;
    }
    setPending(true);
    try {
      const result = await adminApi<{
        status: "DIVERIFIKASI" | "PERLU_REVISI";
        catatan: string | null;
      }>(`respons/${id}/verifikasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action,
          catatan: note.trim() || undefined,
        }),
      });
      setData({
        ...data,
        status: result.status,
        verifikasi: { catatan: result.catatan },
      });
      setSuccess(
        result.status === "DIVERIFIKASI"
          ? "Respons berhasil diverifikasi."
          : "Respons dikembalikan kepada alumni untuk diperbaiki.",
      );
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Gagal menyimpan verifikasi.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <nav
        aria-label="Navigasi respons"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <Link href="/admin/respons" className={`${buttonClass} w-fit`}>
          <span className="rotate-180">
            <Icon name="arrow" className="size-4" />
          </span>
          Kembali ke daftar
        </Link>
        <span className="text-xs font-medium text-hub-muted">
          Tracer Study / Respons #{id}
        </span>
      </nav>
      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-white p-8 text-center"
        >
          <h1 className="text-xl font-semibold">Respons belum dapat dimuat</h1>
          <p className="mt-2 text-sm text-red-800">{error}</p>
          <button
            className={`${buttonClass} mt-5`}
            onClick={() => {
              setError(null);
              setReload((n) => n + 1);
            }}
          >
            Coba lagi
          </button>
        </div>
      ) : !data ? (
        <div role="status" className="space-y-5">
          <span className="sr-only">Memuat jawaban alumni...</span>
          <div className="h-48 rounded-2xl border border-hub-line bg-white motion-safe:animate-pulse" />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="h-96 rounded-2xl bg-white motion-safe:animate-pulse" />
            <div className="h-72 rounded-2xl bg-white motion-safe:animate-pulse" />
          </div>
        </div>
      ) : (
        <ResponsReview
          data={data}
          note={note}
          setNote={setNote}
          noteRef={noteRef}
          decision={decision}
          setDecision={(value) => {
            setDecision(value);
            setActionError(null);
          }}
          pending={pending}
          actionError={actionError}
          success={success}
          onSubmit={submit}
        />
      )}
    </>
  );
}
