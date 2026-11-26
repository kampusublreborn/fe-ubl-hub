"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/shared/components/avatar";
import { Icon } from "@/shared/components/icons";
import { pesanGalat } from "@/shared/lib/api-client";
import { focusRing } from "@/shared/lib/ui";
import { panggilLogbook } from "../lib/client";
import { kompresFoto, ukuranTeks } from "../lib/kompres";
import { KATEGORI, MAKS_FOTO, type Kategori } from "../lib/types";

const MAKS_JUDUL = 150;
const MAKS_ISI = 5000;

type Foto = { key: number; blob: Blob; preview: string; nama: string; terunggah: boolean };

type Galat = { kategori?: string; judul?: string; isi?: string; umum?: string };

export function LogbookForm({ nama }: { nama: string }) {
  const router = useRouter();
  const id = useId();
  const [kategori, setKategori] = useState<Kategori | null>(null);
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [galat, setGalat] = useState<Galat>({});
  const [mengirim, setMengirim] = useState(false);
  const [foto, setFoto] = useState<Foto[]>([]);
  const [galatFoto, setGalatFoto] = useState<string | null>(null);
  const [memprosesFoto, setMemprosesFoto] = useState(false);
  // Setelah logbook tersimpan, percobaan ulang hanya mengunggah foto yang tersisa (tanpa membuat logbook ganda).
  const [dibuatId, setDibuatId] = useState<number | null>(null);
  const kunci = useRef(0);
  const semuaFoto = useRef<Foto[]>([]);
  useEffect(() => {
    semuaFoto.current = foto;
  }, [foto]);

  // Bebaskan URL pratinjau saat halaman ditutup.
  useEffect(() => () => semuaFoto.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

  async function pilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const berkas = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!berkas.length) return;
    setGalatFoto(null);
    const sisa = MAKS_FOTO - foto.length;
    if (berkas.length > sisa) {
      setGalatFoto(`Maksimal ${MAKS_FOTO} foto.${sisa > 0 ? ` Hanya ${sisa} foto pertama yang dipakai.` : ""}`);
    }
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

  function periksa() {
    const e: Galat = {};
    if (!kategori) e.kategori = "Pilih kategori yang paling sesuai.";
    if (judul.trim().length < 3) e.judul = "Judul minimal 3 karakter.";
    if (!isi.trim()) e.isi = "Ceritakan apa yang terjadi dan hasilnya.";
    setGalat(e);
    return Object.keys(e).length === 0;
  }

  async function kirim(ev: React.FormEvent) {
    ev.preventDefault();
    if (mengirim || memprosesFoto || !periksa()) return;
    setMengirim(true);
    let id = dibuatId;
    try {
      if (id === null) {
        const baru = await panggilLogbook<{ id: number }>("POST", "", {
          kategori,
          judul: judul.trim(),
          isi: isi.trim(),
        });
        id = baru.id;
        setDibuatId(id);
      }
    } catch (e) {
      setGalat({ umum: pesanGalat(e, "Logbook belum terkirim. Coba lagi.") });
      setMengirim(false);
      return;
    }
    // Foto diunggah satu per satu; yang sudah berhasil tidak diulang.
    for (const f of foto.filter((x) => !x.terunggah)) {
      try {
        await panggilLogbook("POST", `${id}/gambar`, f.blob, f.blob.type);
        setFoto((cur) => cur.map((x) => (x.key === f.key ? { ...x, terunggah: true } : x)));
      } catch (e) {
        setGalat({
          umum: `Logbook sudah tersimpan, tetapi foto "${f.nama}" belum terunggah: ${pesanGalat(e)} Tekan tombol lagi untuk mencoba ulang, atau hapus foto tersebut.`,
        });
        setMengirim(false);
        return;
      }
    }
    router.push("/");
    router.refresh();
  }

  // Kolom tanpa bingkai: tulisan terasa seperti menulis kabar, bukan mengisi formulir.
  const sisa = MAKS_ISI - isi.length;

  return (
    <form
      onSubmit={kirim}
      noValidate
      className="hub-rise overflow-hidden rounded-2xl border border-hub-line bg-white"
    >
      <div className="flex items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <Avatar nama={nama} className="size-12 text-base" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{nama}</p>
          <p className="inline-flex items-center gap-1 text-xs text-hub-muted">
            <Icon name="users" className="size-3.5" />
            Terlihat oleh sesama alumni UBL
          </p>
        </div>
      </div>

      <fieldset
        className="mt-4 px-4 sm:px-5"
        aria-describedby={galat.kategori ? `${id}-kat-err` : undefined}
      >
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-hub-muted">
          Kategori
        </legend>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {KATEGORI.map((k) => (
            <label
              key={k.nilai}
              className="shrink-0 cursor-pointer rounded-full has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hub-navy"
            >
              <input
                type="radio"
                name="kategori"
                value={k.nilai}
                checked={kategori === k.nilai}
                onChange={() => setKategori(k.nilai)}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-11 items-center rounded-full border border-hub-line px-4 text-sm font-medium transition-colors hover:bg-hub-canvas peer-checked:border-hub-navy peer-checked:bg-hub-navy peer-checked:text-white">
                {k.label}
              </span>
            </label>
          ))}
        </div>
        {galat.kategori && (
          <p id={`${id}-kat-err`} role="alert" className="mt-2 text-sm text-red-700">
            {galat.kategori}
          </p>
        )}
      </fieldset>

      <div className="mt-4 px-4 sm:px-5">
        <label htmlFor={`${id}-judul`} className="sr-only">
          Judul
        </label>
        <input
          id={`${id}-judul`}
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          maxLength={MAKS_JUDUL}
          placeholder="Judul singkat, misalnya: Lulus sertifikasi AWS"
          aria-invalid={!!galat.judul}
          aria-describedby={galat.judul ? `${id}-judul-err` : undefined}
          className="min-h-12 w-full rounded-lg border-0 border-b border-hub-line bg-transparent px-0 py-2 text-lg font-semibold placeholder:font-normal placeholder:text-hub-muted focus-visible:border-hub-navy focus-visible:outline-none aria-[invalid=true]:border-red-700"
        />
        {galat.judul && (
          <p id={`${id}-judul-err`} role="alert" className="mt-2 text-sm text-red-700">
            {galat.judul}
          </p>
        )}

        <label htmlFor={`${id}-isi`} className="sr-only">
          Apa yang terjadi dan hasilnya?
        </label>
        <textarea
          id={`${id}-isi`}
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          maxLength={MAKS_ISI}
          rows={7}
          placeholder="Apa yang terjadi dan apa hasilnya? Semakin jelas, semakin tepat Career Path Anda."
          aria-invalid={!!galat.isi}
          aria-describedby={`${id}-isi-hint${galat.isi ? ` ${id}-isi-err` : ""}`}
          className="mt-3 block w-full resize-y rounded-lg border-0 bg-transparent px-0 py-1 text-base leading-relaxed placeholder:text-hub-muted focus-visible:outline-none aria-[invalid=true]:rounded-lg aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-700"
        />
        {galat.isi && (
          <p id={`${id}-isi-err`} role="alert" className="text-sm text-red-700">
            {galat.isi}
          </p>
        )}
      </div>

      {foto.length > 0 && (
        <ul className="mt-2 grid grid-cols-2 gap-2 px-4 sm:grid-cols-4 sm:px-5">
          {foto.map((f) => (
            <li key={f.key} className="relative overflow-hidden rounded-xl border border-hub-line bg-hub-canvas">
              {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau dari blob lokal */}
              <img src={f.preview} alt={`Pratinjau ${f.nama}`} className="aspect-square w-full object-cover" />
              <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-xs text-white">
                {f.terunggah ? "Terunggah" : ukuranTeks(f.blob.size)}
              </span>
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
        <p role="alert" className="mx-4 mt-2 text-sm text-red-700 sm:mx-5">
          {galatFoto}
        </p>
      )}

      {galat.umum && (
        <p
          role="alert"
          className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:mx-5"
        >
          {galat.umum}
        </p>
      )}

      {/* Bilah aksi: tambah foto di kiri, sisa karakter dan tombol bagikan di kanan. */}
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-hub-line px-4 py-3 sm:px-5">
        {foto.length < MAKS_FOTO && (
          <label
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium text-hub-teal-dark transition-colors hover:bg-hub-canvas has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hub-navy ${memprosesFoto ? "opacity-60" : ""}`}
          >
            <Icon name="plus" className="size-5" />
            {memprosesFoto ? "Mengecilkan foto..." : `Foto (${foto.length}/${MAKS_FOTO})`}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={memprosesFoto || mengirim}
              onChange={pilihFoto}
              className="sr-only"
            />
          </label>
        )}
        <span
          id={`${id}-isi-hint`}
          className={`ml-auto text-xs tabular-nums ${sisa < 200 ? "text-red-700" : "text-hub-muted"}`}
        >
          {isi.length}/{MAKS_ISI}
        </span>
        <button
          type="submit"
          disabled={mengirim || memprosesFoto}
          className={`min-h-11 cursor-pointer rounded-full bg-hub-navy px-6 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none ${focusRing}`}
        >
          {mengirim ? (dibuatId ? "Mengunggah foto..." : "Membagikan...") : dibuatId ? "Coba unggah lagi" : "Bagikan"}
        </button>
      </div>
    </form>
  );
}
