import assert from "node:assert/strict";
import { test } from "node:test";
import { homePath, isAdmin, rejectReason, type HubUser } from "./token";

const user = (role: string, status = "LULUS"): HubUser => ({
  id: 1,
  username: "tester",
  role,
  exp: Math.floor(Date.now() / 1000) + 3600,
  ...(role === "mahasiswa"
    ? { mahasiswa: { id: 1, nama: "Alumni", npm: "123", status } }
    : {}),
});

test("kedua role verifikator masuk ke area admin", () => {
  for (const role of ["admin-prodi", "admin-biro-bpkha"]) {
    assert.equal(rejectReason(user(role)), null);
    assert.equal(isAdmin(user(role)), true);
    assert.equal(homePath(user(role)), "/admin");
  }
});
test("alumni tetap masuk ke beranda alumni", () => {
  assert.equal(rejectReason(user("mahasiswa")), null);
  assert.equal(isAdmin(user("mahasiswa")), false);
  assert.equal(homePath(user("mahasiswa")), "/");
});
test("mahasiswa aktif dan role tanpa hak tracer ditolak", () => {
  assert.ok(rejectReason(user("mahasiswa", "AKTIF")));
  for (const role of [
    "dosen",
    "karyawan",
    "admin-tlc",
    "admin-biro-tlc",
    "admin-biro-keuangan",
    "admin",
  ]) {
    assert.ok(rejectReason(user(role)));
    assert.equal(isAdmin(user(role)), false);
  }
});
