// Mengecilkan foto di browser sebelum diunggah. Foto disimpan sebagai byte di database, jadi ukurannya
// dijaga kecil, tetapi sisi terpanjang 1600 px dan WebP kualitas tinggi menjaga gambar tetap tajam.

const SISI_MAKS = 1600;
/** Target ukuran. Server menolak di atas 800 KB. */
const TARGET_BYTE = 350 * 1024;
const BATAS_ASAL = 25 * 1024 * 1024;
const KUALITAS = [0.85, 0.78, 0.7, 0.6];

export type FotoSiap = { blob: Blob; lebar: number; tinggi: number };

const toBlob = (c: HTMLCanvasElement, tipe: string, q: number) =>
  new Promise<Blob | null>((ok) => c.toBlob(ok, tipe, q));

/**
 * Membaca file gambar, memutar sesuai orientasi EXIF, memperkecil bila lebih dari 1600 px, lalu
 * menyandikan ke WebP (JPEG di peramban yang belum mendukung WebP). Metadata EXIF, termasuk lokasi, hilang.
 */
export async function kompresFoto(file: File): Promise<FotoSiap> {
  if (!file.type.startsWith("image/")) throw new Error("Berkas bukan gambar.");
  if (file.size > BATAS_ASAL) throw new Error("Foto terlalu besar (maksimal 25 MB sebelum dikecilkan).");

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Foto tidak dapat dibaca. Coba format JPEG, PNG, atau WebP.");
  }

  const skala = Math.min(1, SISI_MAKS / Math.max(bmp.width, bmp.height));
  const lebar = Math.max(1, Math.round(bmp.width * skala));
  const tinggi = Math.max(1, Math.round(bmp.height * skala));
  const kanvas = document.createElement("canvas");
  kanvas.width = lebar;
  kanvas.height = tinggi;
  const ctx = kanvas.getContext("2d");
  if (!ctx) throw new Error("Peramban tidak mendukung pengolahan gambar.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, lebar, tinggi);
  bmp.close();

  let terakhir: Blob | null = null;
  for (const q of KUALITAS) {
    let b = await toBlob(kanvas, "image/webp", q);
    // Peramban tanpa dukungan WebP mengembalikan PNG; pakai JPEG supaya tetap kecil.
    if (!b || b.type !== "image/webp") b = await toBlob(kanvas, "image/jpeg", q);
    if (!b) throw new Error("Foto gagal dikecilkan.");
    terakhir = b;
    if (b.size <= TARGET_BYTE) break;
  }
  return { blob: terakhir!, lebar, tinggi };
}

export const ukuranTeks = (byte: number) =>
  byte >= 1024 * 1024 ? `${(byte / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(byte / 1024))} KB`;
