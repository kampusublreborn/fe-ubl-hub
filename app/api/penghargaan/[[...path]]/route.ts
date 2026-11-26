import { teruskanKeApi } from "@/features/hub-api";
const boleh = { GET: /^(?:saya)?$/,  };
async function teruskan(request: Request, ctx: { params: Promise<{ path?: string[] }> }) { return teruskanKeApi(request, (await ctx.params).path ?? [], { prefix: "penghargaan", boleh }); }
export const GET = teruskan;
