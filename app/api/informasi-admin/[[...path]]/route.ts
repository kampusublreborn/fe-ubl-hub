import { teruskanKeApi } from "@/features/hub-api";
const boleh = { GET: /^(?:[1-9]\d*(?:\/gambar)?)?$/, POST: /^(?:[1-9]\d*\/gambar)?$/, DELETE: /^[1-9]\d*\/gambar$/, PUT: /^[1-9]\d*$/, };
async function teruskan(request: Request, ctx: { params: Promise<{ path?: string[] }> }) { return teruskanKeApi(request, (await ctx.params).path ?? [], { prefix: "informasi-admin", boleh, imageCacheControl: "private, no-store" }); }
export const GET = teruskan;
export const POST = teruskan;
export const PUT = teruskan;

export const DELETE = teruskan;
