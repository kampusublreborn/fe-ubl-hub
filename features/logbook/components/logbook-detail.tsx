"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { LogbookItem } from "./logbook-item";
import type { Logbook } from "../lib/types";

export function LogbookNotification({ id }: { id: string }) {
  const router = useRouter();
  const [row, setRow] = useState<Logbook | null>(null);
  const [galat, setGalat] = useState("");
  useEffect(() => {
    let alive = true;
    void panggilApi<Logbook>("logbook", "GET", id).then((r) => { if (alive) setRow(r); })
      .catch((e) => { if (alive) setGalat(pesanGalat(e)); });
    return () => { alive = false; };
  }, [id]);
  if (galat) return <p role="alert">{galat}</p>;
  if (!row) return <p role="status">Memuat logbook…</p>;
  return <LogbookItem awal={row} onHapus={() => router.replace("/")} komentarTerbuka />;
}
