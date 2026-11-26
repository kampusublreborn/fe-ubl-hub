"use client";

import { useState } from "react";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { panggilKomunitas } from "../lib/client";
import { aktif, bisaModerasi, type Halaman, type Hubungan, type Post } from "../lib/types";
import { PostComposer } from "./post-composer";
import { PostItem } from "./post-item";

/** Yang disematkan di atas (terbaru dulu), sisanya mengikuti urutan terbaru. */
function urutkan(daftar: Post[]) {
  const sematan = daftar.filter((p) => p.disematkan);
  return [...sematan, ...daftar.filter((p) => !p.disematkan)];
}

export function PostFeed({ grupId, awal, saya, nama }: { grupId: number; awal: Halaman<Post>; saya: Hubungan; nama: string }) {
  const [daftar, setDaftar] = useState<Post[]>(awal.data);
  const [cursor, setCursor] = useState(awal.cursorBerikutnya);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const moderasi = bisaModerasi(saya);
  const anggota = aktif(saya);

  async function muatLagi() {
    if (!cursor) return;
    setMemuat(true);
    setGalat(null);
    try {
      const r = await panggilKomunitas<Halaman<Post>>("GET", `${grupId}/post?limit=20&cursor=${cursor}`);
      setDaftar((d) => [...d, ...r.data]);
      setCursor(r.cursorBerikutnya);
    } catch (e) {
      setGalat(pesanGalat(e, "Postingan belum dapat dimuat."));
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {anggota ? (
        <PostComposer grupId={grupId} nama={nama} bisaPengumuman={moderasi} onTerbit={(p) => setDaftar((d) => urutkan([p, ...d]))} />
      ) : (
        <p className="rounded-2xl border border-dashed border-hub-line bg-white px-5 py-4 text-sm text-hub-muted">
          Gabung ke grup ini untuk menulis, menyukai, dan berkomentar.
        </p>
      )}

      {galat && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {galat}
        </p>
      )}

      {daftar.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-hub-line bg-white px-6 py-12 text-center">
          <p className="font-medium">Belum ada postingan</p>
          <p className="max-w-sm text-sm text-hub-muted">{anggota ? "Mulailah diskusi pertama di grup ini." : "Anggota grup belum menulis apa pun."}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {daftar.map((p) => (
            <li key={p.id}>
              <PostItem
                awal={p}
                moderasi={moderasi}
                bolehTulis={anggota}
                onHapus={(id) => setDaftar((d) => d.filter((x) => x.id !== id))}
                onUbah={(baru) => setDaftar((d) => urutkan(d.map((x) => (x.id === baru.id ? baru : x))))}
              />
            </li>
          ))}
        </ul>
      )}

      {memuat && (
        <p role="status" className="text-center text-sm text-hub-muted">
          Memuat...
        </p>
      )}
      {cursor && !memuat && (
        <button
          type="button"
          onClick={muatLagi}
          className={`min-h-12 cursor-pointer self-center rounded-xl border border-hub-line bg-white px-6 text-sm font-medium hover:bg-hub-canvas ${focusRing}`}
        >
          Muat lebih banyak
        </button>
      )}
    </div>
  );
}
