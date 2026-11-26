import type {
  AturanButir,
  Instrumen,
  Jawaban,
  StatusRespons,
} from "@/features/tracer";

export type Alumni = {
  npm: string;
  nama: string;
  prodi: { nama: string } | null;
};
export type AdminRow = {
  id: number;
  status: StatusRespons;
  dikirim_at: string | null;
  inti_dikirim_at: string | null;
  periode_id: number;
  mahasiswa: Alumni;
};
export type AdminList = {
  total: number;
  halaman: number;
  batas: number;
  data: AdminRow[];
};
export type Periode = { id: number; nama: string; aktif: boolean };
export type Prodi = { id: number; nama: string };
export type AdminDetail = {
  id: number;
  status: StatusRespons;
  dikirimAt: string | null;
  mahasiswa: Alumni;
  verifikasi: { catatan: string | null } | null;
  instrumen: Instrumen | null;
  aturan: Record<string, AturanButir> | null;
  jawaban: (Jawaban & {
    label?: string | null;
    range: {
      id: number;
      label: string;
      batasBawah: number;
      batasAtas: number;
    } | null;
  })[];
};

export async function adminApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api/tracer-admin/${path}`, {
    ...options,
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(json?.message ?? "Permintaan gagal. Silakan coba lagi.");
  return json as T;
}

export async function eksporCsv(query: string): Promise<Blob> {
  const res = await fetch(`/api/tracer-admin/ekspor?${query}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message ?? "Ekspor gagal. Silakan coba lagi.");
  }
  if (!res.headers.get("content-type")?.startsWith("text/csv"))
    throw new Error("Format ekspor tidak sesuai. Silakan coba lagi.");
  return res.blob();
}

export const statuses: Record<StatusRespons, string> = {
  DRAFT: "Draf",
  DIKIRIM: "Menunggu verifikasi",
  DIVERIFIKASI: "Terverifikasi",
  PERLU_REVISI: "Perlu revisi",
  DILAPORKAN: "Sudah dilaporkan",
};

export const fieldClass =
  "min-h-11 w-full rounded-xl border border-hub-line bg-white px-3 py-2 text-sm text-hub-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-navy";
export const buttonClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-hub-line bg-white px-4 text-sm font-medium transition hover:bg-hub-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-navy disabled:cursor-not-allowed disabled:opacity-50";

export function tanggal(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Belum dikirim";
}
