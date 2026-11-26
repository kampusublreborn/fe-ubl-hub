import assert from "node:assert/strict";
import { test } from "node:test";
import { gabungkanJawaban } from "./pending";
import type { Jawaban } from "./types";

const j = (kode: string, nilai: number): Jawaban => ({ kode, nilai, sumber: "ALUMNI", status: "DIISI" });

test("respons lama tidak menghapus pilihan lain yang masih antre", () => {
  const hasil = gabungkanJawaban([j("A", 1)], { A: j("A", 1), B: j("B", 4) }, { B: { urutan: 2, nilai: 4 } });
  assert.equal(hasil.A.nilai, 1);
  assert.equal(hasil.B.nilai, 4);
});

test("pilihan terbaru untuk butir yang sama bertahan sampai disimpan", () => {
  const hasil = gabungkanJawaban([j("A", 1)], { A: j("A", 5) }, { A: { urutan: 2, nilai: 5 } });
  assert.equal(hasil.A.nilai, 5);
});

test("tanpa perubahan tertunda, respons server menentukan hasil", () => {
  const hasil = gabungkanJawaban([j("A", 2)], { A: j("A", 1), B: j("B", 4) }, {});
  assert.deepEqual(hasil, { A: j("A", 2) });
});
