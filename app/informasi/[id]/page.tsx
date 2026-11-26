import { Suspense } from "react";
import { Shell } from "@/shared/components/layout/shell";
import { InformasiDetail } from "@/features/informasi";
async function Content({ params }: { params: Promise<{ id: string }> }) { return <InformasiDetail id={(await params).id} />; }
export default function Page({ params }: { params: Promise<{ id: string }> }) { return <Shell active="/informasi" fab={false}><Suspense fallback={<p>Memuat informasi?</p>}><Content params={params} /></Suspense></Shell>; }
