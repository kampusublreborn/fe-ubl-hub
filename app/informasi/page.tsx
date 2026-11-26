import { Shell } from "@/shared/components/layout/shell";
import { InformasiBody } from "@/features/informasi";
export const metadata = { title: "Informasi dari UBL | UBL Hub" };
export default function Page() { return <Shell active="/informasi" fab={false}><section className="rounded-2xl border border-hub-line bg-white p-5 sm:p-6"><h1 className="text-2xl font-semibold">Informasi dari UBL</h1><p className="mb-6 mt-2 text-sm text-hub-muted">Peluang karier dan kabar terbaru untuk alumni.</p><InformasiBody /></section></Shell>; }
