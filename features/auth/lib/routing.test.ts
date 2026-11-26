import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../../../proxy";
import { COOKIE_NAME } from "./token";

function request(path: string, role?: string, expired = false) {
  const payload = {
    id: 1,
    role,
    exp: Math.floor(Date.now() / 1000) + (expired ? -60 : 864000),
    mahasiswa: { status: "LULUS" },
  };
  const token = `test.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.test`;
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: role ? { cookie: `${COOKIE_NAME}=${token}` } : {},
  });
}

test("login yang sama mengarahkan admin ke area admin", async () => {
  for (const role of ["admin-prodi", "admin-biro-bpkha"]) {
    assert.equal(
      (await proxy(request("/login", role))).headers.get("location"),
      "http://localhost:3000/admin",
    );
    assert.equal(
      (await proxy(request("/admin", role))).headers.get("location"),
      null,
    );
    assert.equal(
      (await proxy(request("/welcome", role))).headers.get("location"),
      "http://localhost:3000/admin",
    );
    assert.equal(
      (await proxy(request("/tracer", role))).headers.get("location"),
      "http://localhost:3000/admin",
    );
  }
});
test("alumni tidak masuk halaman admin dan tetap mendapat sambutan", async () => {
  assert.equal(
    (await proxy(request("/admin", "mahasiswa"))).headers.get("location"),
    "http://localhost:3000/",
  );
  assert.equal(
    (await proxy(request("/", "mahasiswa"))).headers.get("location"),
    "http://localhost:3000/welcome",
  );
});
test("sesi hilang, kedaluwarsa, dan role lain diarahkan ke login", async () => {
  for (const req of [
    request("/admin"),
    request("/admin", "admin-prodi", true),
    request("/admin", "dosen"),
    request("/admin", "admin-biro-tlc"),
  ]) {
    assert.equal(
      (await proxy(req)).headers.get("location"),
      "http://localhost:3000/login",
    );
  }
  assert.equal(
    (await proxy(request("/alumni/token"))).headers.get("location"),
    null,
  );
});
