export type ProfilPublik = {
  nomor: string | null;
  nama: string;
  prodi: string | null;
  tahunLulus: number | null;
  periodeWisuda: "GANJIL" | "GENAP" | null;
};

/** Profil untuk halaman QR. Tanpa login, jadi tidak membaca cookie. */
export async function getProfilPublik(token: string): Promise<ProfilPublik | null> {
  const api = process.env.HUB_API_URL;
  if (!api) return null;
  try {
    const r = await fetch(`${api}/kartu/profil/${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
    if (!r.ok) return null;
    return (await r.json()) as ProfilPublik;
  } catch {
    return null;
  }
}
