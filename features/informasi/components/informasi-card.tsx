import { Card } from "@/shared/components/card";
import { InformasiBody } from "./informasi-body";

export function InformasiCard() {
  return (
    <Card id="informasi" title="Informasi dari UBL" action={{ href: "/informasi", label: "Semua" }}>
      <InformasiBody ringkas />
    </Card>
  );
}
