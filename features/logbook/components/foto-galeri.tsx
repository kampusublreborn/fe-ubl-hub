import { focusRing } from "@/shared/lib/ui";
import { urlFoto } from "../lib/types";

/** Foto lampiran logbook. Satu foto tampil utuh; beberapa foto tampil sebagai kisi. Klik membuka ukuran penuh. */
export function FotoGaleri({
  ids,
  judul,
  src = urlFoto,
}: {
  ids: number[];
  judul: string;
  src?: (id: number) => string;
}) {
  if (ids.length === 0) return null;
  const tunggal = ids.length === 1;

  return (
    <ul
      aria-label={`Foto lampiran: ${judul}`}
      className={`mt-3 grid gap-2 ${tunggal ? "grid-cols-1" : "grid-cols-2"}`}
    >
      {ids.map((id, i) => (
        <li key={id} className="overflow-hidden rounded-xl border border-hub-line bg-hub-canvas">
          <a
            href={src(id)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Buka foto ${i + 1} dari ${ids.length} ukuran penuh`}
            className={`block ${focusRing}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- foto dari API berotentikasi, sudah dikompres */}
            <img
              src={src(id)}
              alt={`Foto ${i + 1} dari ${ids.length}: ${judul}`}
              loading="lazy"
              decoding="async"
              className={tunggal ? "mx-auto max-h-[28rem] w-auto max-w-full" : "aspect-[4/3] w-full object-cover"}
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
