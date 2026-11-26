import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/shared/components/card";
import { focusRing } from "@/shared/lib/ui";
import { getGrupSaya, getSaran } from "../lib/api";
import type { KartuGrup } from "../lib/types";

function Baris({ g, tanda }: { g: KartuGrup; tanda?: string }) {
  return (
    <li>
      <Link href={`/komunitas/${g.id}`} className={`-mx-2 flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 hover:bg-hub-canvas ${focusRing}`}>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{g.nama}</span>
          <span className="block text-xs tabular-nums text-hub-muted">{g.jumlahAnggota} anggota</span>
        </span>
        {tanda && <span className="shrink-0 rounded-full bg-hub-canvas px-2.5 py-1 text-xs font-medium text-hub-muted">{tanda}</span>}
      </Link>
    </li>
  );
}

async function Isi() {
  const [saya, saran] = await Promise.all([getGrupSaya(), getSaran()]);
  if (!saya) return <p className="text-sm text-hub-muted">Grup belum dapat dimuat.</p>;
  const grupSaya = saya.data.slice(0, 3);
  const disarankan = (saran?.data ?? []).slice(0, grupSaya.length ? 2 : 3);

  if (grupSaya.length === 0 && disarankan.length === 0) {
    return (
      <p className="text-sm text-hub-muted">
        Anda belum bergabung ke grup mana pun.{" "}
        <Link href="/komunitas" className={`font-medium text-hub-teal-dark underline ${focusRing}`}>
          Jelajahi grup
        </Link>
        .
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {grupSaya.length > 0 && (
        <ul className="flex flex-col gap-1">
          {grupSaya.map((g) => (
            <Baris key={g.id} g={g} />
          ))}
        </ul>
      )}
      {disarankan.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-hub-muted">Disarankan</p>
          <ul className="flex flex-col gap-1">
            {disarankan.map((g) => (
              <Baris key={g.id} g={g} tanda="Lihat" />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Kartu panel samping beranda: grup saya dan saran grup. Membaca cookie sesi lewat <Suspense>. */
export function GrupSaya() {
  return (
    <Card id="group" title="Group profesi" action={{ href: "/komunitas", label: "Jelajahi" }}>
      <Suspense fallback={<div aria-hidden="true" className="h-24 rounded-xl bg-hub-line/70 motion-safe:animate-pulse" />}>
        <Isi />
      </Suspense>
    </Card>
  );
}
