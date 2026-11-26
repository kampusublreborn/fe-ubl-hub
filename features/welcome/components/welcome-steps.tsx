"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Confetti } from "./confetti";
import { WELCOME_STEPS } from "../lib/content";
import { ILLUSTRATIONS } from "./illustrations";

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="mt-0.5 h-5 w-5 shrink-0 text-[#26A69A]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.7 2.7L16 9.8" />
    </svg>
  );
}

export function WelcomeSteps({ nama }: { nama: string }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const [celebrate, setCelebrate] = useState(true);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const total = WELCOME_STEPS.length;
  const step = WELCOME_STEPS[index];
  const last = index === total - 1;
  const Illustration = ILLUSTRATIONS[index];

  // Pindahkan fokus ke judul tiap ganti langkah (pembaca layar dan pengguna keyboard).
  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [index]);

  function go(next: number) {
    moved.current = true;
    setCelebrate(false);
    setDir(next > index ? "fwd" : "back");
    setIndex(Math.min(Math.max(next, 0), total - 1));
  }

  async function finish() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/welcome", { method: "POST" });
      if (!res.ok) throw new Error();
      router.replace("/");
      router.refresh();
    } catch {
      // Tanpa penanda, proxy akan mengembalikan ke sini, jadi jangan lanjut diam-diam.
      setError("Gagal menyimpan. Periksa koneksi Anda lalu coba lagi.");
      setPending(false);
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  }

  // Geser horizontal berpindah langkah; gerak vertikal tetap menggulir halaman.
  function onTouchEnd(e: React.TouchEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0 && !last) go(index + 1);
    if (dx > 0 && index > 0) go(index - 1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" && !last) go(index + 1);
    if (e.key === "ArrowLeft" && index > 0) go(index - 1);
  }

  return (
    <div
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative w-full max-w-[460px] rounded-[2.25rem] bg-white px-7 pb-8 pt-9 shadow-[0_30px_60px_-20px_rgba(7,25,82,0.18)] sm:px-10"
    >
      {celebrate && <Confetti />}

      <div className="flex flex-col items-center gap-1">
        <Image
          src="/ubl-logo.png"
          alt="Universitas Bandar Lampung"
          width={1024}
          height={604}
          priority
          className="h-14 w-auto"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1B7F76]">
          UBL Hub
        </p>
      </div>

      <nav aria-label="Langkah" className="mx-auto mt-4 flex max-w-[14rem]">
        {WELCOME_STEPS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            disabled={pending}
            aria-label={`Langkah ${i + 1} dari ${total}`}
            aria-current={i === index ? "step" : undefined}
            className="group flex h-6 flex-1 cursor-pointer items-center px-1 focus-visible:outline-2 focus-visible:outline-zinc-900"
          >
            <span
              className={`h-1.5 w-full rounded-full transition-colors duration-300 group-hover:bg-[#13266B] ${
                i <= index ? "bg-[#071952]" : "bg-[#E3E8F4]"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* key memicu animasi masuk ulang tiap langkah; dimatikan bila pengguna memilih reduced motion. */}
      <div
        key={index}
        className={`welcome-step welcome-${dir} mt-5 flex min-h-[26rem] flex-col items-center text-center`}
      >
        <Illustration />

        <p className="mt-4 text-sm font-medium text-[#5B6784]">
          Langkah {index + 1} dari {total}
        </p>
        <h1
          ref={heading}
          tabIndex={-1}
          className="mt-1 text-balance text-2xl font-bold tracking-tight outline-none sm:text-[1.75rem]"
        >
          {step.title(nama)}
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-[#5B6784]">
          {step.body}
        </p>
        {step.points && (
          <ul className="mt-5 w-full space-y-3 text-left text-[0.95rem] leading-snug text-[#0F1B3D]">
            {step.points.map((p, i) => (
              <li
                key={p}
                className="welcome-item flex gap-3"
                style={{ animationDelay: `${120 + i * 60}ms` }}
              >
                <CheckIcon />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-[#FBE3E3] px-4 py-2.5 text-sm text-[#9F1C1C]"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={pending}
            className="min-h-12 cursor-pointer rounded-xl px-5 text-sm font-semibold text-[#071952] hover:bg-[#EEF2FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-60"
          >
            Kembali
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={pending}
            className="min-h-12 cursor-pointer rounded-xl px-5 text-sm font-semibold text-[#5B6784] hover:bg-[#EEF2FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-60"
          >
            Lewati
          </button>
        )}
        <button
          type="button"
          onClick={last ? finish : () => go(index + 1)}
          disabled={pending}
          autoFocus
          className="inline-flex min-h-12 min-w-32 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#071952] px-6 text-sm font-semibold text-white transition active:scale-[0.97] hover:bg-[#13266B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {last ? (pending ? "Memuat..." : "Mulai") : "Lanjut"}
          {!last && (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
