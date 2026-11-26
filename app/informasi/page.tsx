import { Shell } from "@/shared/components/layout/shell";
import { InformasiBody } from "@/features/informasi";
export const metadata = { title: "Informasi dari UBL | UBL Hub" };
export default function Page() {
  return <Shell active="/informasi" fab={false}>
    <header className="rounded-3xl bg-hub-navy p-6 text-white sm:p-9">
      <p className="mb-5 text-sm font-medium text-white/80">KABAR UNTUK ALUMNI</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Informasi dari UBL</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80">Temukan peluang karier dan kabar kampus. Pilih topik yang kamu butuhkan, lalu buka informasi untuk membaca selengkapnya.</p>
    </header>
    <section aria-label="Daftar informasi"><InformasiBody /></section>
  </Shell>;
}
