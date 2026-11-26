import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

function worker({ windows = [] } = {}) {
  const handlers = {};
  const shown = [];
  const opened = [];
  const self = {
    location: { origin: "https://hub.example.com" },
    registration: { showNotification: async (...args) => shown.push(args) },
    addEventListener: (name, handler) => { handlers[name] = handler; },
  };
  vm.runInNewContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), {
    self, URL, clients: { matchAll: async () => windows, openWindow: async (url) => opened.push(url) },
  });
  return { handlers, shown, opened };
}

test("push menampilkan pesan generik ketika payload rusak dan menolak ID yang tidak valid", async () => {
  const { handlers, shown } = worker();
  let done;
  handlers.push({ data: { json: () => { throw new Error("invalid JSON"); } }, waitUntil: (p) => { done = p; } });
  await done;
  assert.equal(shown[0][0], "UBL Hub");
  assert.equal(shown[0][1].data.id, null);
  handlers.push({ data: { json: () => ({ id: "https://evil.example", judul: "Baru" }) }, waitUntil: (p) => { done = p; } });
  await done;
  assert.equal(shown[1][1].data.id, null);
});

test("klik push membuka inbox pada origin aplikasi", async () => {
  const { handlers, opened } = worker();
  let closed = false;
  let done;
  handlers.notificationclick({ notification: { data: { id: 7 }, close: () => { closed = true; } }, waitUntil: (p) => { done = p; } });
  await done;
  assert.equal(closed, true);
  assert.deepEqual(opened, ["https://hub.example.com/notifikasi?buka=7"]);
});

test("klik push memakai jendela yang ada tanpa membuka tab tambahan", async () => {
  const navigated = [];
  let focused = false;
  const { handlers, opened } = worker({ windows: [{ url: "https://hub.example.com/", navigate: async (url) => navigated.push(url), focus: async () => { focused = true; } }] });
  let done;
  handlers.notificationclick({ notification: { data: { id: 8 }, close() {} }, waitUntil: (p) => { done = p; } });
  await done;
  assert.equal(focused, true);
  assert.deepEqual(navigated, ["https://hub.example.com/notifikasi?buka=8"]);
  assert.equal(opened.length, 0);
});
