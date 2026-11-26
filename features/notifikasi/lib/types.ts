export type Notifikasi = {
  id: number; judul: string; pesan: string; jenis: string;
  dibaca_at: string | null; created_at: string;
  tujuan: { fitur?: string; logbookId?: number; komentarId?: number; responsId?: number; komunitasId?: number; postId?: number; bagian?: string };
};
export type HalamanNotifikasi = { data: Notifikasi[]; belumDibaca: number; cursorBerikutnya: number | null };

export function tautanNotifikasi(n: Notifikasi): string {
  if (n.tujuan.fitur === "tracer") return "/tracer";
  if (n.tujuan.fitur === "logbook" && Number.isSafeInteger(n.tujuan.logbookId) && n.tujuan.logbookId! > 0) {
    return `/logbook/${n.tujuan.logbookId}`;
  }
  if (n.tujuan.fitur === "komunitas") {
    const id = n.tujuan.komunitasId;
    if (n.tujuan.bagian === "undangan") return "/komunitas";
    if (Number.isSafeInteger(id) && id! > 0) return n.tujuan.bagian === "anggota" ? `/komunitas/${id}?tab=anggota` : `/komunitas/${id}`;
    return "/komunitas";
  }
  return "/notifikasi";
}
