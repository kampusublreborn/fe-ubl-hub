import Link from "next/link";
import { ambilDariApi } from "@/features/hub-api";
import { FotoGaleri, labelKategori, tanggal } from "@/features/logbook";
import { focusRing } from "@/shared/lib/ui";
import { Icon } from "@/shared/components/icons";
import { ModerasiBaris, type BarisModerasi } from "./moderasi-baris";

type Ringkasan = { aktif: number; disembunyikan: number; komentar: number; dilaporkan: number };
type Item = Omit<BarisModerasi, "kategoriLabel" | "tanggal"> & { kategori: string; waktu: string; gambar: number[] };
type Halaman = { data: Item[]; cursorBerikutnya: number | null };

const chip = (aktif: boolean) =>
  `inline-flex min-h-11 items-center rounded-lg border px-3 text-sm font-medium transition-colors ${focusRing} ${
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
    { label: "Logbook dilaporkan", nilai: ringkasan.dilaporkan },
    { label: "Disembunyikan", nilai: ringkasan.disembunyikan },
    { label: "Komentar", nilai: ringkasan.komentar },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Pantauan komunitas</h1>
        <p className="mt-1 text-sm text-hub-muted">Tinjau logbook alumni dan tangani laporan komunitas.</p>
      </header>

      <ul aria-label="Ringkasan logbook" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {kpi.map((k) => (
          <li key={k.label} className="flex min-w-0 flex-col gap-2 rounded-2xl border border-hub-line bg-white p-4 sm:p-5">
            <span className="text-sm font-medium text-hub-muted">{k.label}</span>
            <span className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">{k.nilai.toLocaleString("id-ID")}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="font-semibold">{hanyaDilaporkan ? "Logbook dilaporkan" : "Semua logbook"}</h2><p className="mt-0.5 text-xs text-hub-muted">{daftar.data.length} tulisan ditampilkan · Terbaru lebih dahulu</p></div>
      <nav aria-label="Filter logbook" className="flex flex-wrap gap-2">
        <Link href="/admin/logbook" aria-current={!hanyaDilaporkan ? "page" : undefined} className={chip(!hanyaDilaporkan)}>
          Semua
        </Link>
        <Link href="/admin/logbook?dilaporkan=1" aria-current={hanyaDilaporkan ? "page" : undefined} className={chip(hanyaDilaporkan)}>
          Dilaporkan
        </Link>
      </nav>
      </div>

      {daftar.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hub-line bg-white px-6 py-12 text-center">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-hub-canvas text-hub-teal-dark"><Icon name={hanyaDilaporkan ? "check" : "book"} /></span>
          <h3 className="font-semibold">{hanyaDilaporkan ? "Tidak ada logbook yang dilaporkan" : "Belum ada logbook"}</h3>
          <p className="mt-2 text-sm text-hub-muted">{hanyaDilaporkan ? "Tulisan yang dilaporkan alumni akan muncul di sini untuk ditinjau." : "Tulisan alumni akan tampil di sini setelah dipublikasikan."}</p>
          {hanyaDilaporkan && <Link href="/admin/logbook" className={`mt-5 inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-hub-navy hover:bg-hub-canvas ${focusRing}`}>Lihat semua logbook <Icon name="arrow" className="ml-2 size-4" /></Link>}
        </div>
      ) : (
        <ul className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-5 2xl:grid-cols-3">
          {daftar.data.map((d) => (
            <ModerasiBaris
              key={d.id}
              baris={{ ...d, kategoriLabel: labelKategori(d.kategori), tanggal: tanggal(d.waktu) }}
              foto={<FotoGaleri ringkas ids={d.gambar} judul={d.judul} src="/api/logbook-admin/gambar" />}
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
