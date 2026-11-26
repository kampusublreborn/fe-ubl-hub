// Memotong dan mengecilkan logo atau banner grup di browser sebelum diunggah. Gambar disimpan sebagai byte
// di database, jadi ukurannya dijaga kecil. Pemotongan selalu di tengah gambar (rasio tetap).

export type JenisGambar = "logo" | "banner";

/** Logo persegi 1:1; banner 2:1 dipakai sebagai latar seluruh kartu header grup. */
export const UKURAN_GAMBAR: Record<JenisGambar, { rasio: number; lebar: number; label: string; bantuan: string }> = {
  logo: { rasio: 1, lebar: 512, label: "Logo grup", bantuan: "Foto persegi dipotong di bagian tengah. Logo yang lebar atau tinggi dimuat utuh dengan latar putih." },
  banner: { rasio: 2, lebar: 1600, label: "Banner grup", bantuan: "Menjadi latar header grup (rasio 2:1). Bagian tengah foto yang dipakai; teks di atasnya diberi lapisan gelap agar tetap terbaca." },
};

const TARGET_BYTE = 350 * 1024;
const BATAS_ASAL = 25 * 1024 * 1024;
const KUALITAS = [0.85, 0.75, 0.65, 0.5];

const toBlob = (c: HTMLCanvasElement, tipe: string, q: number) => new Promise<Blob | null>((ok) => c.toBlob(ok, tipe, q));

export async function siapkanGambarGrup(file: File, jenis: JenisGambar): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Berkas bukan gambar.");
  if (file.size > BATAS_ASAL) throw new Error("Gambar terlalu besar (maksimal 25 MB sebelum dikecilkan).");
  const { rasio, lebar } = UKURAN_GAMBAR[jenis];

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Gambar tidak dapat dibaca. Coba format JPEG, PNG, atau WebP.");
  }

  // Logo yang bentuknya jauh dari persegi (mis. logo lebar bertulisan) dimuat UTUH dengan latar putih,
  // supaya tidak terpotong. Foto yang mendekati persegi, dan semua banner, dipotong di tengah.
  const nisbah = bmp.width / bmp.height;
  const muatUtuh = jenis === "logo" && (nisbah < 0.8 || nisbah > 1.25);

  const kanvas = document.createElement("canvas");
  const ctx = kanvas.getContext("2d");
  if (!ctx) throw new Error("Peramban tidak mendukung pengolahan gambar.");
  ctx.imageSmoothingQuality = "high";

  if (muatUtuh) {
    const sisi = Math.min(lebar, Math.max(bmp.width, bmp.height));
    kanvas.width = sisi;
    kanvas.height = sisi;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, sisi, sisi);
    // Sisakan ruang tepi 6% agar gambar tidak menempel ke sudut membulat.
    const skala = (sisi * 0.88) / Math.max(bmp.width, bmp.height);
    const dw = Math.round(bmp.width * skala);
    const dh = Math.round(bmp.height * skala);
    ctx.drawImage(bmp, Math.round((sisi - dw) / 2), Math.round((sisi - dh) / 2), dw, dh);
  } else {
    let sw = bmp.width;
    let sh = bmp.height;
    if (sw / sh > rasio) sw = Math.round(sh * rasio);
    else sh = Math.round(sw / rasio);
    const sx = Math.round((bmp.width - sw) / 2);
    const sy = Math.round((bmp.height - sh) / 2);
    // Jangan memperbesar gambar kecil.
    const w = Math.min(lebar, sw);
    const h = Math.max(1, Math.round(w / rasio));
    kanvas.width = w;
    kanvas.height = h;
    ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, w, h);
  }
  bmp.close();

  let terakhir: Blob | null = null;
  for (const q of KUALITAS) {
    let b = await toBlob(kanvas, "image/webp", q);
    if (!b || b.type !== "image/webp") b = await toBlob(kanvas, "image/jpeg", q);
    if (!b) throw new Error("Gambar gagal dikecilkan.");
    terakhir = b;
    if (b.size <= TARGET_BYTE) break;
  }
  return terakhir!;
}

export const urlGambarGrup = (grupId: number, jenis: JenisGambar, versi: number | null) =>
  versi === null ? null : `/api/komunitas/${grupId}/gambar/${jenis}?v=${versi}`;
