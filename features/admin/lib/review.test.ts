import assert from "node:assert/strict";
import { test } from "node:test";
import { bagianRespons, kosong } from "./review";
import type { AdminDetail } from "./api";

test("ringkasan tidak menganggap angka nol dan nilai false sebagai jawaban kosong", () => {
  for (const value of [0, false, [0], "0"]) assert.equal(kosong(value), false);
  for (const value of [undefined, null, "", []])
    assert.equal(kosong(value), true);
});

test("bagian mengikuti instrumen, mewariskan langkah, dan mengabaikan pertanyaan tersembunyi", () => {
  const data: AdminDetail = {
    id: 1,
    status: "DRAFT",
    dikirimAt: null,
    mahasiswa: { npm: "123", nama: "Alumni Uji", prodi: null },
    verifikasi: null,
    jawaban: [],
    instrumen: {
      kode: "TEST",
      versi: "1",
      langkah: [
        { nomor: 1, judul: "Identitas" },
        { nomor: 2, judul: "Karier" },
      ],
      butir: [
        {
          kode: "B",
          teks: "Bagian",
          tipe: "BAGIAN",
          langkah: 2,
          anak: [
            { kode: "B1", teks: "Karier", tipe: "TEKS" },
            { kode: "B2", teks: "Tersembunyi", tipe: "TEKS" },
          ],
        },
        { kode: "A", teks: "Identitas", tipe: "TEKS", langkah: 1 },
        {
          kode: "C",
          teks: "Induk tersembunyi",
          tipe: "BAGIAN",
          langkah: 2,
          anak: [{ kode: "C1", teks: "Anak tersembunyi", tipe: "TEKS" }],
        },
      ],
    },
    aturan: {
      B2: { tampil: false, wajib: false },
      C: { tampil: false, wajib: false },
    },
  };
  assert.deepEqual(
    bagianRespons(data).map((g) => ({
      judul: g.judul,
      kode: g.butir.map((b) => b.kode),
    })),
    [
      { judul: "Identitas", kode: ["A"] },
      { judul: "Karier", kode: ["B1"] },
    ],
  );
  assert.deepEqual(bagianRespons({ ...data, instrumen: null }), []);
});
