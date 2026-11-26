import { teruskanKeApi } from "@/features/hub-api";

const BOLEH = {
  GET: /^saya$/,
  POST: /^susun$/,
  PATCH: /^langkah\/[1-9]\d*$/,
};

async function teruskan(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  // Penyusunan memanggil AI dan bisa memakan waktu hampir satu menit.
  return teruskanKeApi(request, (await ctx.params).path, { prefix: "career-path", boleh: BOLEH, timeoutMs: 90000 });
}

export const GET = teruskan;
export const POST = teruskan;
export const PATCH = teruskan;
