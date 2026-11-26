/** Panggilan dari browser ke perantara /api/<basis>. Melempar Error berisi pesan dari server. */
export async function panggilApi<T = unknown>(
  basis: string,
  metode: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  /** Isi `body` berupa Blob dengan jenis ini (mis. image/webp), bukan JSON. */
  jenisBlob?: string,
): Promise<T> {
  const r = await fetch(`/api/${basis}${path ? `/${path}` : ""}`, {
    method: metode,
    headers: body === undefined ? undefined : { "Content-Type": jenisBlob ?? "application/json" },
    body: body === undefined ? undefined : body instanceof Blob ? body : JSON.stringify(body),
    cache: "no-store",
  });
  const json = await r.json().catch(() => null);
  if (!r.ok) {
    throw Object.assign(new Error(json?.message ?? "Permintaan gagal"), { status: r.status });
  }
  return json as T;
}

export const pesanGalat = (e: unknown, bawaan = "Terjadi kesalahan. Coba lagi.") =>
  e instanceof Error ? e.message : bawaan;
