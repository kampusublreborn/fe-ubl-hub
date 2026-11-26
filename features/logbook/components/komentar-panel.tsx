"use client";

import { createContext, useContext, useEffect, useId, useState, type ReactNode } from "react";
import { Icon } from "@/shared/components/icons";
import { panggilApi, pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { tanggal, type Halaman, type Komentar } from "../lib/types";

const aksiKecil = `inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-semibold text-hub-muted transition-colors hover:text-hub-ink ${focusRing}`;

function Avatar({ nama, kecil = false }: { nama: string; kecil?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-hub-navy font-semibold text-white ${
        kecil ? "size-7 text-xs" : "size-9 text-sm"
      }`}
    >
      {nama.trim().charAt(0).toUpperCase()}
    </span>
  );
}

type HasilKomentar = Halaman<Komentar>;
type CacheKomentar = Map<string, { sampai: number; hasil: Promise<HasilKomentar> }>;
const KonteksKomentar = createContext<CacheKomentar | null>(null);

/** Satu cache per postingan, dibuang saat postingan meninggalkan halaman. */
export function KomentarProvider({ children }: { children: ReactNode }) {
  const [cache] = useState<CacheKomentar>(() => new Map());
  return <KonteksKomentar.Provider value={cache}>{children}</KonteksKomentar.Provider>;
}

type Sasaran = { induk: number; id: number; nama: string };

/**
 * Komentar bergaya Facebook: komentar tingkat atas dan balasannya (satu tingkat). Membalas sebuah balasan
 * tetap masuk ke komentar induknya dan menyebut nama orang yang dibalas.
 */
export function KomentarPanel({
  logbookId,
  pemilikLogbook,
  panelId,
  onUbahJumlah,
  basis = "logbook",
  jalur = String(logbookId),
  bolehTulis = true,
}: {
  logbookId: number;
  /** Yang boleh menghapus komentar siapa pun (pemilik tulisan, atau moderator grup). */
  pemilikLogbook: boolean;
  panelId: string;
  onUbahJumlah: (delta: number) => void;
  /** Dipakai ulang oleh komunitas: basis API dan jalur ke tulisannya. */
  basis?: string;
  jalur?: string;
  /** Bukan anggota grup: komentar hanya bisa dibaca. */
  bolehTulis?: boolean;
}) {
  const panggilLogbook = <T,>(metode: Parameters<typeof panggilApi>[1], path: string, body?: unknown) =>
    panggilApi<T>(basis, metode, path, body);
  const cache = useContext(KonteksKomentar);
  const baseId = useId();
  const [daftar, setDaftar] = useState<Komentar[] | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [memuatLagi, setMemuatLagi] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [teks, setTeks] = useState("");
  const [sasaran, setSasaran] = useState<Sasaran | null>(null);
  const [teksBalas, setTeksBalas] = useState("");
  const [terbuka, setTerbuka] = useState<Set<number>>(new Set());
  const [kirim, setKirim] = useState(false);

  useEffect(() => {
    let batal = false;
    const key = `${basis}/${jalur}`;
    const tersimpan = cache?.get(key);
    const hasil = tersimpan && tersimpan.sampai > Date.now()
      ? tersimpan.hasil
      : panggilApi<HasilKomentar>(basis, "GET", `${jalur}/komentar?limit=10`);
    if (hasil !== tersimpan?.hasil) {
      cache?.set(key, { sampai: Date.now() + 30_000, hasil });
      void hasil.catch(() => {
        if (cache?.get(key)?.hasil === hasil) cache.delete(key);
      });
    }
    hasil
      .then((r) => {
        if (!batal) { setDaftar(r.data); setCursor(r.cursorBerikutnya); }
      })
      .catch((e) => {
        if (!batal) setGalat(pesanGalat(e, "Komentar belum dapat dimuat."));
      })
      .finally(() => {
        if (!batal) setMemuat(false);
      });
    return () => {
      batal = true;
    };
  }, [basis, jalur, cache]);

  async function muatLagi() {
    if (cursor === null || memuatLagi) return;
    setMemuatLagi(true);
    setGalat(null);
    try {
      const r = await panggilLogbook<Halaman<Komentar>>("GET", `${jalur}/komentar?limit=10&cursor=${cursor}`);
      setDaftar((lama) => {
        const gabungan = new Map((lama ?? []).map((k) => [k.id, k]));
        for (const k of r.data) gabungan.set(k.id, k);
        return [...gabungan.values()].sort((a, b) => a.id - b.id);
      });
      setCursor(r.cursorBerikutnya);
    } catch (e) {
      setGalat(pesanGalat(e, "Komentar berikutnya belum dapat dimuat."));
    } finally {
      setMemuatLagi(false);
    }
  }

  async function kirimKomentar(isi: string, balasKeId?: number) {
    const bersih = isi.trim();
    if (!bersih || kirim) return;
    setKirim(true);
    setGalat(null);
    try {
      const baru = await panggilLogbook<Komentar>("POST", `${jalur}/komentar`, { isi: bersih, balasKeId });
      cache?.delete(`${basis}/${jalur}`);
      setDaftar((d) =>
        baru.indukId === null
          ? [...(d ?? []), { ...baru, balasan: [] }]
          : (d ?? []).map((k) => (k.id === baru.indukId ? { ...k, balasan: [...(k.balasan ?? []), baru] } : k)),
      );
      if (baru.indukId !== null) setTerbuka((s) => new Set(s).add(baru.indukId!));
      onUbahJumlah(1);
      if (balasKeId === undefined) setTeks("");
      else {
        setTeksBalas("");
        setSasaran(null);
      }
    } catch (e) {
      setGalat(pesanGalat(e, "Komentar belum terkirim."));
    } finally {
      setKirim(false);
    }
  }

  async function hapus(k: Komentar, induk: Komentar | null) {
    setGalat(null);
    try {
      await panggilLogbook("DELETE", `${jalur}/komentar/${k.id}`);
      cache?.delete(`${basis}/${jalur}`);
      if (induk) {
        setDaftar((d) => (d ?? []).map((x) => (x.id === induk.id ? { ...x, balasan: (x.balasan ?? []).filter((b) => b.id !== k.id) } : x)));
        onUbahJumlah(-1);
      } else {
        setDaftar((d) => (d ?? []).filter((x) => x.id !== k.id));
        onUbahJumlah(-(1 + (k.balasan?.length ?? 0)));
      }
      if (sasaran && (sasaran.id === k.id || sasaran.induk === k.id)) setSasaran(null);
    } catch (e) {
      setGalat(pesanGalat(e));
    }
  }

  function balas(k: Komentar, induk: Komentar) {
    setTeksBalas("");
    setSasaran({ induk: induk.id, id: k.id, nama: k.milikSaya ? "diri sendiri" : k.penulis.nama });
  }

  function alihBalasan(id: number) {
    setTerbuka((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const bisaHapus = (k: Komentar) => k.milikSaya || pemilikLogbook;

  function gelembung(k: Komentar, induk: Komentar | null) {
    return (
      <div className="flex gap-2">
        <Avatar nama={k.penulis.nama} kecil={!!induk} />
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-hub-canvas px-3.5 py-2">
            <p className="flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate font-semibold">{k.milikSaya ? "Anda" : k.penulis.nama}</span>
              <time dateTime={k.waktu} className="shrink-0 text-hub-muted">
                {tanggal(k.waktu)}
              </time>
            </p>
            <p className="mt-0.5 whitespace-pre-line text-sm [overflow-wrap:anywhere]">
              {k.balasKe && <span className="mr-1 font-semibold text-hub-teal-dark">{k.balasKe}</span>}
              {k.isi}
            </p>
          </div>
          <div className="flex items-center">
            {bolehTulis && (
              <button type="button" onClick={() => balas(k, induk ?? k)} className={aksiKecil} aria-label={`Balas komentar ${k.milikSaya ? "Anda" : `dari ${k.penulis.nama}`}`}>
                Balas
              </button>
            )}
            {bisaHapus(k) && (
              <button type="button" onClick={() => hapus(k, induk)} className={aksiKecil} aria-label={`Hapus komentar ${k.milikSaya ? "Anda" : `dari ${k.penulis.nama}`}`}>
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const input = `min-h-11 w-full resize-y rounded-xl border border-hub-line bg-white px-3.5 py-2.5 text-sm ${focusRing}`;
  const kirimBtn = `min-h-11 shrink-0 rounded-xl bg-hub-navy px-5 text-sm font-semibold text-white disabled:opacity-50 ${focusRing}`;

  return (
    <div id={panelId} className="hub-fade mt-3 flex flex-col gap-3">
      {memuat && (
        <p role="status" className="text-sm text-hub-muted">
          Memuat komentar...
        </p>
      )}
      {daftar && daftar.length === 0 && <p className="text-sm text-hub-muted">Belum ada komentar. Jadilah yang pertama.</p>}

      {daftar && daftar.length > 0 && (
        <ul className="flex flex-col gap-3">
          {daftar.map((k) => {
            const jumlah = k.balasan?.length ?? 0;
            const buka = terbuka.has(k.id);
            return (
              <li key={k.id}>
                {gelembung(k, null)}

                {(jumlah > 0 || sasaran?.induk === k.id) && (
                  <div className="ml-11 border-l-2 border-hub-line pl-3">
                    {jumlah > 0 && (
                      <button
                        type="button"
                        onClick={() => alihBalasan(k.id)}
                        aria-expanded={buka}
                        aria-controls={`${baseId}-b-${k.id}`}
                        className={`${aksiKecil} gap-1.5 !text-hub-teal-dark`}
                      >
                        <Icon name="chevron" className={`size-4 transition-transform motion-reduce:transition-none ${buka ? "rotate-180" : ""}`} />
                        {buka ? "Sembunyikan balasan" : `Lihat ${jumlah} balasan`}
                      </button>
                    )}
                    {buka && jumlah > 0 && (
                      <ul id={`${baseId}-b-${k.id}`} className="mt-1 flex flex-col gap-2">
                        {k.balasan!.map((b) => (
                          <li key={b.id}>
                            {gelembung(b, k)}
                          </li>
                        ))}
                      </ul>
                    )}

                    {sasaran?.induk === k.id && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          void kirimKomentar(teksBalas, sasaran.id);
                        }}
                        className="mt-2 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-hub-muted">
                          <label htmlFor={`${baseId}-r-${k.id}`}>
                            Membalas <span className="font-semibold text-hub-ink">{sasaran.nama}</span>
                          </label>
                          <button type="button" onClick={() => setSasaran(null)} className={aksiKecil}>
                            Batal
                          </button>
                        </div>
                        <div className="flex items-end gap-2">
                          <textarea
                            id={`${baseId}-r-${k.id}`}
                            autoFocus
                            value={teksBalas}
                            onChange={(e) => setTeksBalas(e.target.value)}
                            maxLength={1000}
                            rows={1}
                            placeholder="Tulis balasan"
                            className={input}
                          />
                          <button type="submit" disabled={kirim || !teksBalas.trim()} className={kirimBtn}>
                            {kirim ? "Mengirim..." : "Balas"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {cursor !== null && <button type="button" onClick={muatLagi} disabled={memuatLagi} className={`${aksiKecil} self-start disabled:opacity-50`}>
        {memuatLagi ? "Memuat komentar..." : "Muat komentar lainnya"}
      </button>}

      {!bolehTulis && (
        <p className="text-sm text-hub-muted">Gabung ke grup untuk ikut berkomentar.</p>
      )}
      {bolehTulis && <form
        onSubmit={(e) => {
          e.preventDefault();
          void kirimKomentar(teks);
        }}
        className="flex items-end gap-2"
      >
        <label className="sr-only" htmlFor={`${baseId}-baru`}>
          Tulis komentar
        </label>
        <textarea
          id={`${baseId}-baru`}
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          maxLength={1000}
          rows={1}
          placeholder="Tulis komentar"
          className={input}
        />
        <button type="submit" disabled={kirim || !teks.trim()} className={kirimBtn}>
          {kirim ? "Mengirim..." : "Kirim"}
        </button>
      </form>}

      {galat && (
        <p role="alert" className="text-sm text-red-700">
          {galat}
        </p>
      )}
    </div>
  );
}
