import assert from "node:assert/strict";
import { test } from "node:test";
import { payloadPeriode, validasiPeriode, type PeriodeInput } from "./periode";
import { adminRoute } from "./routes";

const input: PeriodeInput = {
  nama: " Tracer 2027 ",
  instrumen: "2",
  mulai: "2027-01-01",
  selesai: "2027-01-31",
  tahun: "2025",
};
test("tanggal periode mencakup seluruh hari WIB dan tahun lulusan opsional", () => {
  assert.deepEqual(validasiPeriode(input), {});
  assert.deepEqual(payloadPeriode(input), {
    nama: "Tracer 2027",
    instrumen_versi_id: 2,
    tanggal_mulai: "2026-12-31T17:00:00.000Z",
    tanggal_selesai: "2027-01-31T16:59:59.999Z",
    tahun_lulus: 2025,
  });
  assert.equal("tahun_lulus" in payloadPeriode({ ...input, tahun: "" }), false);
  assert.deepEqual(validasiPeriode({ ...input, selesai: input.mulai }), {});
});
test("form menolak tanggal terbalik, tanggal kalender tidak valid, dan input kosong", () => {
  assert.ok(validasiPeriode({ ...input, selesai: "2026-12-31" }).selesai);
  assert.ok(validasiPeriode({ ...input, mulai: "2027-02-30" }).mulai);
  assert.ok(validasiPeriode({ ...input, mulai: "" }).mulai);
  assert.ok(validasiPeriode({ ...input, nama: "   " }).nama);
  assert.ok(validasiPeriode({ ...input, instrumen: "0" }).instrumen);
  assert.ok(validasiPeriode({ ...input, tahun: "1899" }).tahun);
  assert.ok(validasiPeriode({ ...input, tahun: "20ab" }).tahun);
});
test("hanya BPKHA dapat mengakses daftar instrumen dan mengubah periode melalui perantara", () => {
  assert.equal(
    adminRoute("GET", "dashboard", "admin-biro-bpkha"),
    "verifikasi/dashboard",
  );
  assert.equal(
    adminRoute("GET", "dashboard", "admin-prodi"),
    "verifikasi/dashboard",
  );
  assert.equal(adminRoute("GET", "dashboard", "mahasiswa"), null);
  for (const role of ["admin-prodi", "mahasiswa", "admin-biro-tlc"]) {
    for (const [method, route] of [
      ["GET", "master/periode"],
      ["GET", "master/instrumen"],
      ["POST", "master/periode"],
      ["POST", "master/periode/2/aktifkan"],
      ["POST", "master/periode/2/nonaktifkan"],
    ]) {
      assert.equal(adminRoute(method, route, role), null);
    }
  }
  assert.equal(
    adminRoute("GET", "master/instrumen", "admin-biro-bpkha"),
    "master/instrumen",
  );
  assert.equal(
    adminRoute("POST", "master/periode/2/aktifkan", "admin-biro-bpkha"),
    "master/periode/2/aktifkan",
  );
  assert.equal(
    adminRoute("POST", "master/periode/2/nonaktifkan", "admin-biro-bpkha"),
    "master/periode/2/nonaktifkan",
  );
  assert.equal(
    adminRoute("POST", "master/instrumen", "admin-biro-bpkha"),
    null,
  );
  assert.equal(
    adminRoute("DELETE", "master/periode/2", "admin-biro-bpkha"),
    null,
  );
  assert.equal(
    adminRoute("GET", "respons/2", "admin-prodi"),
    "verifikasi/respons/2",
  );
  assert.equal(
    adminRoute("POST", "respons/2/verifikasi", "admin-prodi"),
    "verifikasi/respons/2/verifikasi",
  );
});
