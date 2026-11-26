import { cookies } from "next/headers";
import { COOKIE_NAME, decodeToken, isExpired } from "@/features/auth";
import { teruskanKeApi } from "@/features/hub-api";

const BOLEH = {
  GET: /^(ringkasan|[1-9]\d*\/laporan|gambar\/[1-9]\d*)?$/,
  PATCH: /^[1-9]\d*\/sembunyikan$/,
};

async function teruskan(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const user = token ? decodeToken(token) : null;
  if (!user || isExpired(user)) return Response.json({ message: "Sesi berakhir. Silakan masuk kembali." }, { status: 401 });
  if (user.role !== "admin-biro-bpkha") return Response.json({ message: "Hanya untuk BPKHA." }, { status: 403 });
  return teruskanKeApi(request, (await ctx.params).path ?? [], { prefix: "logbook-admin", boleh: BOLEH });
}

export const GET = teruskan;
export const PATCH = teruskan;
