"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/shared/components/icons";
import { panggilApi } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";

export function NotificationBell() {
  const [jumlah, setJumlah] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () => {
      if (document.visibilityState !== "visible") return;
      void panggilApi<{ belumDibaca: number }>("notifikasi", "GET", "?limit=1")
        .then((r) => { if (alive) setJumlah(r.belumDibaca); }).catch(() => {});
    };
    load();
    const timer = setInterval(load, 60000);
    window.addEventListener("notifikasi-dibaca", load);
    document.addEventListener("visibilitychange", load);
    return () => { alive = false; clearInterval(timer); window.removeEventListener("notifikasi-dibaca", load); document.removeEventListener("visibilitychange", load); };
  }, []);
  return <Link href="/notifikasi" aria-label={`Notifikasi${jumlah ? `, ${jumlah} belum dibaca` : ""}`}
    className={`relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-hub-line bg-white text-hub-navy ${focusRing}`}>
    <Icon name="bell" />
    {jumlah > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-hub-navy px-1.5 text-xs font-semibold text-white">{jumlah > 99 ? "99+" : jumlah}</span>}
  </Link>;
}
