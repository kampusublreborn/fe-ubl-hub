import Link from "next/link";
import { Icon } from "@/shared/components/icons";
import { focusRing } from "@/shared/lib/ui";
import { tanggal } from "@/features/logbook";
import type { StatusCareerPath } from "../lib/types";
import { CareerPathBody } from "./career-path-body";
import { SusunButton } from "./susun-button";

/** Isi Career Path sesuai keadaannya: belum ada logbook, belum disusun, atau sudah ada. */
export function CareerPathStatus({ status, ringkas = false }: { status: StatusCareerPath; ringkas?: boolean }) {
  if (status.keadaan === "KOSONG") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-hub-muted">
          Career Path dibuat dari logbook Anda. Anda belum punya logbook, jadi belum ada Career Path.
        </p>
        <Link
          href="/logbook/baru"
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl bg-hub-navy px-5 text-sm font-semibold text-white ${focusRing}`}
        >
          <Icon name="plus" className="size-4" />
          Tulis logbook pertama
        </Link>
      </div>
    );
  }

  if (status.keadaan === "BELUM_DISUSUN" || !status.careerPath) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-hub-muted">
          Anda punya {status.jumlahLogbook} logbook. Susun Career Path untuk melihat perkiraan posisi
          1 dan 3 tahun, keterampilan, dan sertifikasi yang disarankan.
        </p>
        <SusunButton perbarui={false} bisa={status.bisaDisusun} alasan={status.alasanBelumBisa} />
      </div>
    );
  }

  const c = status.careerPath;
  return (
    <>
      <CareerPathBody key={c.disusunPada} data={c} />
      <p className="mt-4 rounded-xl bg-hub-canvas px-4 py-3 text-xs text-hub-muted">
        Perkiraan yang disusun AI dari {c.dariJumlahLogbook} logbook Anda pada {tanggal(c.disusunPada)}.
        Bukan jaminan, dan bisa berubah saat Anda menambah logbook.
      </p>
      {!ringkas && (
        <div className="mt-4">
          <SusunButton perbarui bisa={status.bisaDisusun} alasan={status.alasanBelumBisa} />
        </div>
      )}
    </>
  );
}
