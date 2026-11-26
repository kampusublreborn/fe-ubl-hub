/** Daftar perantara yang dibuka UI; endpoint master hanya untuk BPKHA. */
export function adminRoute(
  method: string,
  route: string,
  role: string,
): string | null {
  if (role !== "admin-prodi" && role !== "admin-biro-bpkha") return null;
  if (route.startsWith("master/")) {
    if (role !== "admin-biro-bpkha") return null;
    const allowed =
      method === "GET"
        ? /^master\/(periode|instrumen)$/.test(route)
        : method === "POST" &&
          /^master\/periode(?:\/[1-9]\d*\/(aktifkan|nonaktifkan))?$/.test(
            route,
          );
    return allowed ? route : null;
  }
  const allowed =
    method === "GET"
      ? /^(dashboard|prodi|periode|ekspor|respons(?:\/[1-9]\d*)?)$/.test(route)
      : method === "POST" && /^respons\/[1-9]\d*\/verifikasi$/.test(route);
  return allowed ? `verifikasi/${route}` : null;
}
