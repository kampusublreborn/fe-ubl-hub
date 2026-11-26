// Warna avatar diturunkan dari nama supaya penulis yang sama selalu berwarna sama.
const WARNA = ["bg-hub-navy", "bg-hub-teal-dark", "bg-[#8a5a00]", "bg-[#9f1239]", "bg-[#5b21b6]"];

export function warna(nama: string) {
  let h = 0;
  for (const c of nama) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return WARNA[h % WARNA.length]!;
}

export function inisial(nama: string) {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Avatar bulat dengan inisial. Dekoratif: nama selalu ditulis di sebelahnya. */
export function Avatar({ nama, className = "size-11 text-sm" }: { nama: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ${warna(nama)} ${className}`}
    >
      {inisial(nama)}
    </span>
  );
}
