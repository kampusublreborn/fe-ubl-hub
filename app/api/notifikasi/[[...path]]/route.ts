import { teruskanKeApi } from "@/features/hub-api";

const BOLEH = {
  GET: /^(push\/config|[1-9]\d*)?$/,
  POST: /^push\/(subscription|unsubscribe)$/,
  PATCH: /^(baca-semua|[1-9]\d*\/baca)$/,
};
async function teruskan(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return teruskanKeApi(request, (await ctx.params).path ?? [], { prefix: "notifikasi", boleh: BOLEH });
}
export const GET = teruskan;
export const POST = teruskan;
export const PATCH = teruskan;
