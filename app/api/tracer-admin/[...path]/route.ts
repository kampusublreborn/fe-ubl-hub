import { cookies } from "next/headers";
import { COOKIE_NAME, decodeToken, isAdmin, isExpired } from "@/features/auth";
import { adminRoute } from "@/features/admin";

async function forward(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const user = token ? decodeToken(token) : null;
  if (!user || isExpired(user))
    return Response.json(
      { message: "Sesi berakhir. Silakan masuk kembali." },
      { status: 401 },
    );
  if (!isAdmin(user))
    return Response.json(
      { message: "Akses hanya untuk admin tracer." },
      { status: 403 },
    );

  const { path } = await ctx.params;
  const route = path.join("/");
  if (route.startsWith("master/") && user.role !== "admin-biro-bpkha")
    return Response.json(
      { message: "Pengaturan periode hanya untuk BPKHA." },
      { status: 403 },
    );
  const upstream = adminRoute(request.method, route, user.role);
  if (!upstream)
    return Response.json({ message: "Tidak ditemukan" }, { status: 404 });
  if (
    request.method === "POST" &&
    request.headers.get("origin") !== new URL(request.url).origin
  ) {
    return Response.json(
      { message: "Asal permintaan tidak diizinkan." },
      { status: 403 },
    );
  }
  const api = process.env.HUB_API_URL;
  if (!api)
    return Response.json(
      { message: "Alamat API belum diatur." },
      { status: 500 },
    );
  try {
    // API memverifikasi tanda tangan token dan membatasi data sesuai prodi admin.
    const response = await fetch(
      `${api}/tracer-admin/${upstream}${new URL(request.url).search}`,
      {
        method: request.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: request.method === "POST" ? await request.text() : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      },
    );
    if (response.status >= 500)
      return Response.json(
        { message: "Terjadi gangguan pada server. Coba lagi sebentar." },
        { status: 502 },
      );
    if (route === "ekspor" && response.ok) {
      if (!response.headers.get("content-type")?.startsWith("text/csv"))
        return Response.json(
          { message: "Format ekspor dari server tidak sesuai." },
          { status: 502 },
        );
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="tracer-study.csv"',
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    return Response.json(await response.json(), { status: response.status });
  } catch {
    return Response.json(
      { message: "Server tidak dapat dihubungi. Coba lagi sebentar." },
      { status: 502 },
    );
  }
}

export const GET = forward;
export const POST = forward;
