import Link from "next/link";
import { ambilDariApi } from "@/features/hub-api";
import { FotoGaleri, labelKategori, tanggal } from "@/features/logbook";
import { focusRing } from "@/shared/lib/ui";
import { ModerasiBaris, type BarisModerasi } from "./moderasi-baris";

type Ringkasan = { aktif: number; disembunyikan: number; komentar: number; dilaporkan: number };
type Item = Omit<BarisModerasi, "kategoriLabel" | "tanggal"> & { kategori: string; waktu: string; gambar: number[] };
type Halaman = { data: Item[]; cursorBerikutnya: number | null };

const chip = (aktif: boolean) =>
  `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors ${focusRing} ${
    aktif ? "border-hub-navy bg-hub-navy text-white" : "border-hub-line bg-white hover:bg-hub-canvas"
  }`;

/** Pantauan komunitas untuk BPKHA. Harus dipanggil di dalam <Suspense>. */
export async function AdminLogbook({ hanyaDilaporkan }: { hanyaDilaporkan: boolean }) {
  const [ringkasan, daftar] = await Promise.all([
    ambilDariApi<Ringkasan>("logbook-admin/ringkasan"),
    ambilDariApi<Halaman>(`logbook-admin?limit=50${hanyaDilaporkan ? "&dilaporkan=1" : ""}`),
  ]);

  if (!ringkasan || !daftar) {
    return (
      <p role="alert" className="rounded-2xl border border-hub-line bg-white p-5 text-sm">
        Pantauan komunitas belum dapat dimuat. Coba muat ulang halaman.
      </p>
    );
  }

  const kpi = [
    { label: "Logbook tampil", nilai: ringkasan.aktif },
    { label: "Laporan masuk", nilai: ringkasan.dilaporkan },
    { label: "Disembunyikan", nilai: ringkasan.disembunyikan },
    { label: "Komentar", nilai: ringkasan.komentar },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pantauan komunitas</h1>
        <p className="mt-1 max-w-prose text-sm text-hub-muted">
          Logbook alumni hanya terlihat oleh sesama alumni. Sembunyikan tulisan yang melanggar; penulisnya
          tetap melihat tulisan itu beserta alasannya.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi.map((k) => (
          <li key={k.label} className="rounded-2xl border border-hub-line bg-white p-4">
            <p className="text-sm text-hub-muted">{k.label}</p>
            <p className="text-2xl font-semibold tabular-nums">{k.nilai}</p>
          </li>
        ))}
      </ul>

      <nav aria-label="Filter" className="flex flex-wrap gap-2">
        <Link href="/admin/logbook" aria-current={!hanyaDilaporkan ? "page" : undefined} className={chip(!hanyaDilaporkan)}>
          Semua
        </Link>
        <Link href="/admin/logbook?dilaporkan=1" aria-current={hanyaDilaporkan ? "page" : undefined} className={chip(hanyaDilaporkan)}>
          Dilaporkan
        </Link>
      </nav>

      {daftar.data.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-hub-line bg-white p-8 text-center text-sm text-hub-muted">
          {hanyaDilaporkan ? "Tidak ada tulisan yang dilaporkan." : "Belum ada logbook."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.data.map((d) => (
            <ModerasiBaris
              key={d.id}
              baris={{ ...d, kategoriLabel: labelKategori(d.kategori), tanggal: tanggal(d.waktu) }}
              foto={<FotoGaleri ids={d.gambar} judul={d.judul} src={(id) => `/api/logbook-admin/gambar/${id}`} />}
            />
          ))}
        </ul>
      )}
      {daftar.cursorBerikutnya && (
        <p className="text-center text-xs text-hub-muted">Menampilkan 50 terbaru.</p>
      )}
    </div>
  );
}
