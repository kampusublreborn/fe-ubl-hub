"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/shared/components/avatar";
import { Icon } from "@/shared/components/icons";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { kompresFoto, ukuranTeks } from "@/features/logbook/client";
import { panggilKomunitas } from "../lib/client";
import { MAKS_FOTO, type Post } from "../lib/types";

const MAKS_ISI = 5000;

type Foto = { key: number; blob: Blob; preview: string; nama: string; terunggah: boolean };

/** Kotak menulis di dalam grup. Pengumuman hanya muncul untuk admin dan moderator. */
export function PostComposer({
  grupId,
  nama,
  bisaPengumuman,
  onTerbit,
}: {
  grupId: number;
  nama: string;
  bisaPengumuman: boolean;
  onTerbit: (p: Post) => void;
}) {
  const id = useId();
  const [isi, setIsi] = useState("");
  const [pengumuman, setPengumuman] = useState(false);
  const [foto, setFoto] = useState<Foto[]>([]);
  const [galat, setGalat] = useState<string | null>(null);
  const [galatFoto, setGalatFoto] = useState<string | null>(null);
  const [memprosesFoto, setMemprosesFoto] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  // Ringkas dulu supaya postingan tidak terdorong ke bawah layar; membuka hanya saat disentuh.
  const [buka, setBuka] = useState(false);
  // Setelah postingan tersimpan, percobaan ulang hanya mengunggah foto yang tersisa (tanpa postingan ganda).
  const [dibuat, setDibuat] = useState<Post | null>(null);
  const kunci = useRef(0);
  const semuaFoto = useRef<Foto[]>([]);
  useEffect(() => {
    semuaFoto.current = foto;
  }, [foto]);
  useEffect(() => () => semuaFoto.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

  async function pilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const berkas = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!berkas.length) return;
    setGalatFoto(null);
    const sisa = MAKS_FOTO - foto.length;
    if (berkas.length > sisa) setGalatFoto(`Maksimal ${MAKS_FOTO} foto.${sisa > 0 ? ` Hanya ${sisa} foto pertama yang dipakai.` : ""}`);
    setMemprosesFoto(true);
    const baru: Foto[] = [];
    for (const f of berkas.slice(0, Math.max(0, sisa))) {
      try {
        const { blob } = await kompresFoto(f);
        baru.push({ key: ++kunci.current, blob, preview: URL.createObjectURL(blob), nama: f.name, terunggah: false });
      } catch (err) {
        setGalatFoto(pesanGalat(err, "Foto tidak dapat diproses."));
      }
    }
    setFoto((cur) => [...cur, ...baru]);
    setMemprosesFoto(false);
  }

  function hapusFoto(key: number) {
    setFoto((cur) => {
      const f = cur.find((x) => x.key === key);
      if (f) URL.revokeObjectURL(f.preview);
      return cur.filter((x) => x.key !== key);
    });
  }

  function bersihkan() {
    foto.forEach((f) => URL.revokeObjectURL(f.preview));
    setFoto([]);
    setIsi("");
    setPengumuman(false);
    setDibuat(null);
    setBuka(false);
  }

  async function kirim(ev: React.FormEvent) {
    ev.preventDefault();
    if (mengirim || memprosesFoto) return;
    if (!dibuat && !isi.trim()) {
      setGalat("Tulis sesuatu dulu sebelum membagikan.");
      return;
    }
    setMengirim(true);
    setGalat(null);
    let post = dibuat;
    try {
      if (!post) {
        post = await panggilKomunitas<Post>("POST", `${grupId}/post`, { isi: isi.trim(), pengumuman: bisaPengumuman && pengumuman });
        setDibuat(post);
      }
    } catch (e) {
      setGalat(pesanGalat(e, "Postingan belum terkirim. Coba lagi."));
      setMengirim(false);
      return;
    }
    const gambar = [...post.gambar];
    for (const f of foto.filter((x) => !x.terunggah)) {
      try {
        const r = await panggilKomunitas<{ id: number }>("POST", `${grupId}/post/${post.id}/gambar`, f.blob, f.blob.type);
        gambar.push(r.id);
        setFoto((cur) => cur.map((x) => (x.key === f.key ? { ...x, terunggah: true } : x)));
      } catch (e) {
        setDibuat({ ...post, gambar });
        setGalat(`Postingan sudah tersimpan, tetapi foto "${f.nama}" belum terunggah: ${pesanGalat(e)} Tekan tombol lagi untuk mencoba ulang, atau hapus foto tersebut.`);
        setMengirim(false);
        return;
      }
    }
    onTerbit({ ...post, gambar });
    bersihkan();
    setMengirim(false);
  }

  const sisa = MAKS_ISI - isi.length;

  if (!buka) {
    return (
      <button
        type="button"
        onClick={() => setBuka(true)}
        className={`flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-2xl border border-hub-line bg-white px-4 text-left transition-shadow hover:shadow-[0_8px_24px_-14px_rgba(15,27,61,0.3)] sm:px-5 ${focusRing}`}
      >
        <Avatar nama={nama} className="size-10 text-sm" />
        <span className="min-w-0 flex-1 truncate rounded-full bg-hub-canvas px-4 py-2.5 text-sm text-hub-muted">Tulis sesuatu untuk grup ini...</span>
        <Icon name="plus" className="size-5 shrink-0 text-hub-navy" />
        <span className="sr-only">Buka kotak menulis</span>
      </button>
    );
  }

  return (
    <form onSubmit={kirim} noValidate className="rounded-2xl border border-hub-line bg-white p-4 sm:p-5">
      <div className="flex gap-3">
        <Avatar nama={nama} className="size-11 text-sm" />
        <div className="min-w-0 flex-1">
          <label htmlFor={`${id}-isi`} className="sr-only">
            Tulis di grup
          </label>
          <textarea
            id={`${id}-isi`}
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            maxLength={MAKS_ISI}
            rows={3}
            disabled={!!dibuat}
            autoFocus
            placeholder="Bagikan sesuatu dengan anggota grup"
            aria-describedby={`${id}-hint`}
            className={`block w-full resize-y rounded-xl bg-hub-canvas px-4 py-3 text-base leading-relaxed placeholder:text-hub-muted disabled:opacity-70 ${focusRing}`}
          />
        </div>
      </div>

      {foto.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {foto.map((f) => (
            <li key={f.key} className="relative overflow-hidden rounded-xl border border-hub-line bg-hub-canvas">
              {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau dari blob lokal */}
              <img src={f.preview} alt={`Pratinjau ${f.nama}`} className="aspect-square w-full object-cover" />
              <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-xs text-white">{f.terunggah ? "Terunggah" : ukuranTeks(f.blob.size)}</span>
              {!f.terunggah && (
                <button
                  type="button"
                  onClick={() => hapusFoto(f.key)}
                  aria-label={`Hapus foto ${f.nama}`}
                  className={`absolute right-1 top-1 flex size-11 cursor-pointer items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/80 ${focusRing}`}
                >
                  <Icon name="x" className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {galatFoto && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {galatFoto}
        </p>
      )}
      {galat && (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {galat}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hub-line pt-3">
        {foto.length < MAKS_FOTO && (
          <label
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium text-hub-teal-dark transition-colors hover:bg-hub-canvas has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hub-navy ${memprosesFoto ? "opacity-60" : ""}`}
          >
            <Icon name="plus" className="size-5" />
            {memprosesFoto ? "Mengecilkan foto..." : `Foto (${foto.length}/${MAKS_FOTO})`}
            <input type="file" accept="image/*" multiple disabled={memprosesFoto || mengirim} onChange={pilihFoto} className="sr-only" />
          </label>
        )}
        {bisaPengumuman && (
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hub-navy">
            <input type="checkbox" checked={pengumuman} disabled={!!dibuat} onChange={(e) => setPengumuman(e.target.checked)} className="size-4 accent-[#071952]" />
            Jadikan pengumuman
          </label>
        )}
        {!dibuat && !isi && foto.length === 0 && (
          <button
            type="button"
            onClick={() => setBuka(false)}
            className={`min-h-11 cursor-pointer rounded-full px-3 text-sm font-medium text-hub-muted hover:bg-hub-canvas ${focusRing}`}
          >
            Tutup
          </button>
        )}
        <span id={`${id}-hint`} className={`ml-auto text-xs tabular-nums ${sisa < 200 ? "text-red-700" : "text-hub-muted"}`}>
          {isi.length}/{MAKS_ISI}
        </span>
        <button
          type="submit"
          disabled={mengirim || memprosesFoto}
          className={`min-h-11 cursor-pointer rounded-full bg-hub-navy px-6 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none ${focusRing}`}
        >
          {mengirim ? (dibuat ? "Mengunggah foto..." : "Membagikan...") : dibuat ? "Coba unggah lagi" : pengumuman ? "Umumkan" : "Bagikan"}
        </button>
      </div>
    </form>
  );
}
