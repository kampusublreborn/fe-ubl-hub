import { teruskanKeApi } from "@/features/hub-api";
const boleh = { GET: /^$/, POST: /^[1-9]\d*\/batalkan$/, };
async function teruskan(request: Request, ctx: { params: Promise<{ path?: string[] }> }) { return teruskanKeApi(request, (await ctx.params).path ?? [], { prefix: "penghargaan-admin", boleh }); }
export const GET = teruskan;
export const POST = teruskan;
