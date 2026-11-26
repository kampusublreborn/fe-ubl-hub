"use client";

import { useEffect, useState } from "react";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { aktifkanPush, dukungPush, matikanPush, siapkanPush } from "@/shared/lib/web-push";

type Config = { aktif: boolean; publicKey: string | null };
export function PushSettings() {
  const [config, setConfig] = useState<Config | null>(null);
  const [aktif, setAktif] = useState(false);
  const [didukung, setDidukung] = useState<boolean | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");
  useEffect(() => {
    let alive = true;
    void (async () => {
      const support = dukungPush();
      const cfg = await panggilApi<Config>("notifikasi", "GET", "push/config");
      if (alive) { setConfig(cfg); setDidukung(support); }
      if (!support || !cfg.aktif) return;
      const reg = await siapkanPush();
      const sub = await reg.pushManager.getSubscription();
      if (sub && Notification.permission === "granted") {
        await panggilApi("notifikasi", "POST", "push/subscription", sub.toJSON());
        if (alive) setAktif(true);
      }
    })().catch((e) => { if (alive) setPesan(pesanGalat(e)); });
    return () => { alive = false; };
  }, []);

  async function ubah() {
    setSibuk(true); setPesan("");
    try {
      if (aktif) await matikanPush();
      else if (config?.publicKey) await aktifkanPush(config.publicKey);
      setAktif(!aktif);
      setPesan(aktif ? "Notifikasi perangkat dinonaktifkan." : "Notifikasi perangkat aktif.");
    } catch (e) { setPesan(pesanGalat(e)); }
    finally { setSibuk(false); }
  }
  return <section className="rounded-2xl border border-hub-line bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-hub-ink">Notifikasi di perangkat ini</h2><span className="rounded-full bg-hub-canvas px-3 py-1 text-xs font-medium text-hub-navy">{aktif ? "Aktif" : "Belum aktif"}</span></div>
    <p className="mt-2 text-sm leading-relaxed text-hub-muted">Terima pemberitahuan revisi tracer dan balasan komentar meskipun UBL Hub sedang tidak dibuka.</p>
    <details className="mt-3 text-sm text-hub-muted"><summary className={`w-fit cursor-pointer rounded-lg py-2 font-medium text-hub-navy ${focusRing}`}>Menggunakan iPhone atau iPad?</summary><p className="mt-1 leading-relaxed">Di iPhone atau iPad, tambahkan UBL Hub ke Layar Utama melalui menu Bagikan, lalu buka dari ikon tersebut untuk mengaktifkan notifikasi.</p></details>
    {didukung === false && <p className="mt-3 text-sm">Browser ini belum mendukung push, atau koneksi belum memakai HTTPS. Riwayat notifikasi tetap tersedia di bawah.</p>}
    {config && !config.aktif && <p className="mt-3 text-sm">Notifikasi perangkat belum tersedia. Silakan coba lagi nanti.</p>}
    <button type="button" onClick={ubah} disabled={sibuk || !didukung || !config?.aktif || (!aktif && !config?.publicKey)}
      className={`mt-4 min-h-11 rounded-full bg-hub-navy px-5 text-sm font-semibold text-white disabled:opacity-50 ${focusRing}`}>
      {sibuk ? "Memproses…" : aktif ? "Nonaktifkan notifikasi" : "Aktifkan notifikasi"}
    </button>
    {pesan && <p role="status" className="mt-3 text-sm">{pesan}</p>}
  </section>;
}
