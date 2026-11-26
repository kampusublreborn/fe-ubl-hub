import assert from "node:assert/strict";
import { test } from "node:test";
import { eksporCsv } from "./api";
import { adminRoute } from "./routes";

test("ekspor hanya dibuka lewat GET untuk kedua peran admin", () => {
  for (const role of ["admin-prodi", "admin-biro-bpkha"]) {
    assert.equal(adminRoute("GET", "ekspor", role), "verifikasi/ekspor");
    assert.equal(adminRoute("POST", "ekspor", role), null);
    assert.equal(adminRoute("GET", "ekspor/1", role), null);
  }
  assert.equal(adminRoute("GET", "ekspor", "mahasiswa"), null);
  assert.equal(adminRoute("GET", "ekspor", "dosen"), null);
});

test("unduhan meneruskan filter dan menjaga isi CSV sebagai blob", async () => {
  const originalFetch = globalThis.fetch;
  const csv = '\uFEFF"npm","nama"\r\n"001234","Alumni UBL"\r\n';
  try {
    globalThis.fetch = (async (url, options) => {
      assert.equal(url, "/api/tracer-admin/ekspor?periode_id=2&prodi_id=12&status=DIVERIFIKASI");
      assert.equal(options?.cache, "no-store");
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
    }) as typeof fetch;
    const blob = await eksporCsv("periode_id=2&prodi_id=12&status=DIVERIFIKASI");
    assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), new TextEncoder().encode(csv));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("kegagalan autentikasi dan respons non-CSV tidak diunduh sebagai file", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async () => Response.json({ message: "Sesi berakhir." }, { status: 401 })) as typeof fetch;
    await assert.rejects(eksporCsv(""), /Sesi berakhir/);
    globalThis.fetch = (async () => new Response("Server error", { status: 502 })) as typeof fetch;
    await assert.rejects(eksporCsv(""), /Ekspor gagal/);
    globalThis.fetch = (async () => Response.json({ data: [] })) as typeof fetch;
    await assert.rejects(eksporCsv(""), /Format ekspor tidak sesuai/);
    globalThis.fetch = (async () => { throw new Error("Koneksi terputus"); }) as typeof fetch;
    await assert.rejects(eksporCsv(""), /Koneksi terputus/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
