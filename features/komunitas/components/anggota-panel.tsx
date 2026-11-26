"use client";

import { useEffect, useId, useState } from "react";
import { Avatar } from "@/shared/components/avatar";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { panggilKomunitas } from "../lib/client";
import {
  LABEL_PERAN, adalahAdmin, bisaModerasi,
  type Anggota, type CalonAnggota, type Halaman, type Hubungan, type Jenis, type Peran,
} from "../lib/types";

const btn = `min-h-11 cursor-pointer rounded-full border border-hub-line bg-white px-4 text-sm font-medium transition-colors hover:bg-hub-canvas disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;
const btnUtama = `min-h-11 cursor-pointer rounded-full bg-hub-navy px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

function info(a: { prodi: string | null; tahunLulus: number | null }) {
  return [a.prodi, a.tahunLulus ? `Lulus ${a.tahunLulus}` : null].filter(Boolean).join(" · ");
}

/** Admin boleh mengeluarkan siapa saja selain admin lain. Moderator hanya anggota biasa. */
const bolehKeluarkan = (saya: Hubungan, target: Peran) =>
  adalahAdmin(saya) ? target !== "ADMIN" : bisaModerasi(saya) && target === "ANGGOTA";

export function AnggotaPanel({
  grupId, jenis, saya, idSaya, onUbahJumlah,
}: {
  grupId: number;
  jenis: Jenis;
  saya: Hubungan;
  /** Tidak diketahui front-end: anggota yang `peran`-nya menyentuh diri sendiri ditolak server. */
  idSaya?: number;
  onUbahJumlah: (anggota: number, permintaan: number) => void;
}) {
  const baseId = useId();
  const [anggota, setAnggota] = useState<Halaman<Anggota> | null>(null);
  const [permintaan, setPermintaan] = useState<Anggota[]>([]);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState<number | null>(null);
  const moderasi = bisaModerasi(saya);
  const admin = adalahAdmin(saya);
  const bisaUndang = jenis === "PUBLIK" ? saya?.status === "AKTIF" : moderasi;

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const [a, p] = await Promise.all([
          panggilKomunitas<Halaman<Anggota>>("GET", `${grupId}/anggota?limit=100`),
          moderasi ? panggilKomunitas<Halaman<Anggota>>("GET", `${grupId}/anggota?status=MENUNGGU&limit=100`) : Promise.resolve(null),
        ]);
        if (batal) return;
        setAnggota(a);
        setPermintaan(p?.data ?? []);
      } catch (e) {
        if (!batal) setGalat(pesanGalat(e, "Anggota belum dapat dimuat."));
      }
    })();
    return () => {
      batal = true;
    };
  }, [grupId, moderasi]);

  async function jalankan(id: number, kerja: () => Promise<void>) {
    setSibuk(id);
    setGalat(null);
    try {
      await kerja();
    } catch (e) {
      setGalat(pesanGalat(e));
    } finally {
      setSibuk(null);
    }
  }

  const setujui = (a: Anggota) =>
    jalankan(a.id, async () => {
      await panggilKomunitas("PATCH", `${grupId}/anggota/${a.id}`, { setujui: true });
      setPermintaan((p) => p.filter((x) => x.id !== a.id));
      setAnggota((d) => (d ? { ...d, data: [{ ...a, peran: "ANGGOTA" }, ...d.data] } : d));
      onUbahJumlah(1, -1);
    });

  const tolakAtauKeluarkan = (a: Anggota, daftarPermintaan: boolean) =>
    jalankan(a.id, async () => {
      await panggilKomunitas("DELETE", `${grupId}/anggota/${a.id}`);
      if (daftarPermintaan) {
        setPermintaan((p) => p.filter((x) => x.id !== a.id));
        onUbahJumlah(0, -1);
      } else {
        setAnggota((d) => (d ? { ...d, data: d.data.filter((x) => x.id !== a.id) } : d));
        onUbahJumlah(-1, 0);
      }
    });

  const ubahPeran = (a: Anggota, peran: Peran) =>
    jalankan(a.id, async () => {
      await panggilKomunitas("PATCH", `${grupId}/anggota/${a.id}`, { peran });
      setAnggota((d) => (d ? { ...d, data: d.data.map((x) => (x.id === a.id ? { ...x, peran } : x)) } : d));
    });

  return (
    <div className="flex flex-col gap-5">
      {galat && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {galat}
        </p>
      )}

      {moderasi && permintaan.length > 0 && (
        <section aria-labelledby={`${baseId}-minta`} className="rounded-2xl border border-hub-sand/60 bg-hub-sand/10 p-4 sm:p-5">
          <h2 id={`${baseId}-minta`} className="text-base font-semibold">
            Permintaan bergabung <span className="tabular-nums text-hub-muted">({permintaan.length})</span>
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {permintaan.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3">
                <Avatar nama={a.nama} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.nama}</p>
                  <p className="truncate text-xs text-hub-muted">{info(a)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={sibuk === a.id} onClick={() => setujui(a)} className={btnUtama}>
                    Setujui<span className="sr-only"> {a.nama}</span>
                  </button>
                  <button type="button" disabled={sibuk === a.id} onClick={() => tolakAtauKeluarkan(a, true)} className={btn}>
                    Tolak<span className="sr-only"> {a.nama}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {bisaUndang && <UndangAlumni grupId={grupId} />}

      <section aria-labelledby={`${baseId}-anggota`} className="rounded-2xl border border-hub-line bg-white p-4 sm:p-5">
        <h2 id={`${baseId}-anggota`} className="text-base font-semibold">
          Anggota
        </h2>
        {!anggota && !galat && (
          <p role="status" className="mt-3 text-sm text-hub-muted">
            Memuat anggota...
          </p>
        )}
        {anggota && (
          <ul className="mt-3 flex flex-col divide-y divide-hub-line">
            {anggota.data.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <Avatar nama={a.nama} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold">
                    <span className="[overflow-wrap:anywhere]">{a.nama}</span>
                    {a.peran !== "ANGGOTA" && (
                      <span className="rounded-full bg-hub-navy/10 px-2 py-0.5 text-xs font-semibold text-hub-navy">{LABEL_PERAN[a.peran]}</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-hub-muted">{info(a)}</p>
                </div>
                {(admin || bolehKeluarkan(saya, a.peran)) && a.id !== idSaya && (
                  <div className="flex flex-wrap items-center gap-2">
                    {admin && (
                      <>
                        <label htmlFor={`${baseId}-p-${a.id}`} className="sr-only">
                          Peran {a.nama}
                        </label>
                        <select
                          id={`${baseId}-p-${a.id}`}
                          value={a.peran}
                          disabled={sibuk === a.id}
                          onChange={(e) => ubahPeran(a, e.target.value as Peran)}
                          className={`min-h-11 rounded-lg border border-hub-line bg-white px-2 text-sm ${focusRing}`}
                        >
                          <option value="ANGGOTA">Anggota</option>
                          <option value="MODERATOR">Moderator</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </>
                    )}
                    {bolehKeluarkan(saya, a.peran) && (
                      <button type="button" disabled={sibuk === a.id} onClick={() => tolakAtauKeluarkan(a, false)} className={`${btn} hover:!text-red-700`}>
                        Keluarkan<span className="sr-only"> {a.nama}</span>
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {anggota?.cursorBerikutnya && <p className="mt-3 text-xs text-hub-muted">Menampilkan 100 anggota terbaru.</p>}
      </section>
    </div>
  );
}

function UndangAlumni({ grupId }: { grupId: number }) {
  const id = useId();
  const [q, setQ] = useState("");
  const [hasil, setHasil] = useState<CalonAnggota[] | null>(null);
  const [diundang, setDiundang] = useState<Set<number>>(new Set());
  const [pesan, setPesan] = useState<{ jenis: "ok" | "galat"; teks: string } | null>(null);
  const [mencari, setMencari] = useState(false);

  async function cari(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 3) {
      setPesan({ jenis: "galat", teks: "Ketik minimal 3 huruf nama alumni." });
      return;
    }
    setMencari(true);
    setPesan(null);
    try {
      setHasil(await panggilKomunitas<CalonAnggota[]>("GET", `cari-alumni?q=${encodeURIComponent(q.trim())}`));
    } catch (err) {
      setPesan({ jenis: "galat", teks: pesanGalat(err) });
    } finally {
      setMencari(false);
    }
  }

  async function undang(a: CalonAnggota) {
    setPesan(null);
    try {
      await panggilKomunitas("POST", `${grupId}/undang`, { mahasiswaId: a.id });
      setDiundang((s) => new Set(s).add(a.id));
      setPesan({ jenis: "ok", teks: `Undangan untuk ${a.nama} terkirim.` });
    } catch (err) {
      setPesan({ jenis: "galat", teks: pesanGalat(err) });
    }
  }

  return (
    <section aria-labelledby={`${id}-judul`} className="rounded-2xl border border-hub-line bg-white p-4 sm:p-5">
      <h2 id={`${id}-judul`} className="text-base font-semibold">
        Undang alumni
      </h2>
      <form role="search" onSubmit={cari} className="mt-3 flex gap-2">
        <label htmlFor={`${id}-q`} className="sr-only">
          Nama alumni
        </label>
        <input
          id={`${id}-q`}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama alumni"
          className={`min-h-12 w-full rounded-full border border-hub-line bg-white px-5 text-sm ${focusRing}`}
        />
        <button type="submit" disabled={mencari} className={`${btnUtama} min-h-12 shrink-0 px-6`}>
          {mencari ? "Mencari..." : "Cari"}
        </button>
      </form>
      {pesan && (
        <p role={pesan.jenis === "galat" ? "alert" : "status"} className={`mt-2 text-sm ${pesan.jenis === "galat" ? "text-red-700" : "text-hub-teal-dark"}`}>
          {pesan.teks}
        </p>
      )}
      {hasil && hasil.length === 0 && <p className="mt-3 text-sm text-hub-muted">Tidak ada alumni dengan nama itu.</p>}
      {hasil && hasil.length > 0 && (
        <ul className="mt-3 flex flex-col divide-y divide-hub-line">
          {hasil.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-2.5">
              <Avatar nama={a.nama} className="size-10 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.nama}</p>
                <p className="truncate text-xs text-hub-muted">{info(a)}</p>
              </div>
              <button type="button" disabled={diundang.has(a.id)} onClick={() => undang(a)} className={btn}>
                {diundang.has(a.id) ? "Diundang" : "Undang"}
                <span className="sr-only"> {a.nama}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
