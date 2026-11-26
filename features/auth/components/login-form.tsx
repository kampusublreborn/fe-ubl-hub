"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { matikanPush } from "@/shared/lib/web-push";

const inputClass =
  "w-full rounded-xl border border-[#C9D1E3] bg-white px-4 py-3.5 text-base text-[#0F1B3D] placeholder:text-[#5B6784] outline-none transition focus:border-[#071952] focus-visible:ring-2 focus-visible:ring-[#26A69A]";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    try {
      // Sesi yang kedaluwarsa bisa meninggalkan subscription akun sebelumnya pada browser bersama.
      await matikanPush();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.message ?? "Login gagal");
        setPending(false);
        return;
      }
      router.replace(json?.data?.redirectTo === "/admin" ? "/admin" : "/");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung. Periksa koneksi Anda.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate={false}>
      <div>
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Username"
          autoComplete="username"
          required
          autoFocus
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            required
            className={`${inputClass} pr-20`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-pressed={show}
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute inset-y-0 right-1 my-1 cursor-pointer rounded-lg px-3 text-xs font-semibold text-[#071952] hover:bg-[#EEF2FF] focus-visible:outline-2 focus-visible:outline-zinc-900"
          >
            {show ? "Sembunyi" : "Tampil"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-[#FBE3E3] px-4 py-2.5 text-sm text-[#9F1C1C]"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 cursor-pointer rounded-xl bg-[#071952] px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#13266B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
