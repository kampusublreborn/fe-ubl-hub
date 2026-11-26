import { teruskanKeApi } from "@/features/hub-api";

const ID = String.raw`[1-9]\d*`;
const PATH_POST = `${ID}/post/${ID}`;

// Hanya rute yang dipakai front-end yang diteruskan ke API.
const BOLEH = {
  GET: new RegExp(`^(saran|undangan|cari-alumni|${ID}|${ID}/(anggota|post)|${PATH_POST}|${PATH_POST}/komentar|${PATH_POST}/gambar/${ID}|${ID}/gambar/(logo|banner))?$`),
  POST: new RegExp(`^(${ID}/(gabung|undang|post)|${PATH_POST}/(komentar|laporan|gambar))?$`),
  PUT: new RegExp(`^(${PATH_POST}/(like|sematan)|${ID}/gambar/(logo|banner))$`),
  PATCH: new RegExp(`^(${ID}|${ID}/anggota/${ID}|${PATH_POST}|${PATH_POST}/sembunyikan)$`),
  DELETE: new RegExp(
    `^(${ID}|${ID}/gabung|${ID}/anggota/${ID}|${PATH_POST}|${PATH_POST}/(like|sematan)|${PATH_POST}/komentar/${ID}|${PATH_POST}/gambar/${ID}|${ID}/gambar/(logo|banner))$`,
  ),
};

async function teruskan(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return teruskanKeApi(request, (await ctx.params).path ?? [], { prefix: "komunitas", boleh: BOLEH });
}

export const GET = teruskan;
export const POST = teruskan;
export const PUT = teruskan;
export const PATCH = teruskan;
export const DELETE = teruskan;
