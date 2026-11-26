import { teruskanKeApi } from "@/features/hub-api";
const boleh = { GET: /^(?:[1-9]\d*(?:\/gambar)?)?$/, };
async function teruskan(request: Request, ctx: { params: Promise<{ path?: string[] }> }) { return teruskanKeApi(request, (await ctx.params).path ?? [], { prefix: "informasi", boleh, imageCacheControl: "private, no-store" }); }
export const GET = teruskan;
