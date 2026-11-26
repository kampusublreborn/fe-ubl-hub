import { teruskanKeApi } from "@/features/hub-api";

const BOLEH = {
  GET: /^(saya|[1-9]\d*|[1-9]\d*\/komentar|gambar\/[1-9]\d*)?$/,
  POST: /^([1-9]\d*\/(komentar|laporan|gambar))?$/,
  PUT: /^[1-9]\d*\/like$/,
  PATCH: /^[1-9]\d*$/,
  DELETE: /^([1-9]\d*|[1-9]\d*\/like|[1-9]\d*\/komentar\/[1-9]\d*|[1-9]\d*\/gambar\/[1-9]\d*)$/,
};

async function teruskan(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return teruskanKeApi(request, (await ctx.params).path ?? [], { prefix: "logbook", boleh: BOLEH });
}

export const GET = teruskan;
export const POST = teruskan;
export const PUT = teruskan;
export const PATCH = teruskan;
export const DELETE = teruskan;
