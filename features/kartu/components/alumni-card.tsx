"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { useRef, useState } from "react";
import { Icon } from "@/shared/components/icons";

export type CardData = {
  nama: string;
  prodi: string;
  npm?: string;
  /** null berarti belum terbit. */
  nomor: string | null;
  tahunLulus: number | null;
  /** Tautan profil publik untuk QR. Tanpa ini QR tidak ditampilkan. */
  profilUrl?: string;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-navy";

/* ------------------------------------------------------------------ QR */

/** QR asli (dapat dipindai). Modul dihitung sinkron dari tautan, tanpa efek samping. */
function Qr({ value, className = "" }: { value: string; className?: string }) {
  const modules = QRCode.create(value, { errorCorrectionLevel: "M" }).modules;
  const size = modules.size;
  let d = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules.get(y, x)) d +=`M${x} ${y}h1v1h-1z`;
    }
  }
  return (
    <svg
      role="img"
      aria-label="Kode QR kartu alumni"
      viewBox={`-2 -2 ${size + 4} ${size + 4}`}
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x="-2" y="-2" width={size + 4} height={size + 4} fill="#fff" />
      <path d={d} fill="#071952" />
    </svg>
  );
}

function QrBox({
  nomor,
  url,
  light = false,
  className = "",
}: {
  nomor: string | null;
  url?: string;
  /** true bila ditaruh di latar terang (sisi belakang kartu). */
  light?: boolean;
  className?: string;
}) {
  if (!nomor || !url) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-2 text-center text-xs ${
          light ? "border-hub-line text-hub-muted" : "border-white/40 text-white/80"
        } ${className}`}
      >
        <Icon name="lock" className="size-5" />
        QR aktif setelah kartu terbit
      </div>
    );
  }
  return (
    <div className={`rounded-xl bg-white p-[6%] ${className}`}>
      <Qr value={url} className="size-full" />
    </div>
  );
}

/* ---------------------------------------------------------------- Kartu */

const face =
  "absolute inset-0 overflow-hidden rounded-[clamp(14px,3.5cqw,24px)] backface-hidden";
const pad = "p-[clamp(16px,5cqw,32px)]";

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-[clamp(8px,2cqw,14px)]">
      {/* Logo berwarna gelap, jadi butuh pelat putih agar terbaca di atas navy. Tinggi pelat
          tetap, lebarnya mengikuti rasio logo (1024x609) supaya tidak terpotong atau melar. */}
      <span className="flex h-[clamp(34px,8.6cqw,54px)] shrink-0 items-center rounded-[clamp(7px,1.8cqw,12px)] bg-white px-[clamp(5px,1.2cqw,8px)] py-[clamp(4px,1cqw,7px)] shadow-sm ring-1 ring-white/20">
        <Image
          src="/ubl-logo.png"
          alt=""
          width={1024}
          height={609}
          sizes="96px"
          className="h-full w-auto"
        />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-[clamp(12px,2.4cqw,16px)] font-semibold tracking-wide">
          Universitas Bandar Lampung
        </p>
        <p className="mt-0.5 text-[clamp(12px,1.9cqw,13px)] font-semibold uppercase tracking-[0.2em] text-white/75">
          Kartu Alumni
        </p>
      </div>
    </div>
  );
}

function Front({ d, hidden }: { d: CardData; hidden: boolean }) {
  const terbit = d.nomor !== null;
  return (
    <div
      className={`${face} bg-hub-navy text-white`}
      aria-hidden={hidden}
      inert={hidden}
    >
      {/* Latar: dua lingkaran besar, sama seperti rancangan kartu. */}
      <div
        aria-hidden="true"
        className="absolute -right-[8cqw] -top-[22cqw] size-[58cqw] rounded-full bg-white/[0.06]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-[26cqw] -left-[10cqw] size-[54cqw] rounded-full bg-white/[0.05]"
      />
      <div aria-hidden="true" className="hub-sheen pointer-events-none absolute inset-0" />

      <div className={`relative flex h-full flex-col justify-between ${pad}`}>
        <div className="flex items-start justify-between gap-3">
          <Brand />
          <span
            className={`hidden shrink-0 items-center gap-1.5 rounded-full px-[clamp(10px,2.4cqw,16px)] py-[clamp(4px,1cqw,7px)] text-[clamp(12px,2cqw,14px)] font-semibold @sm:inline-flex ${
              terbit ? "bg-hub-teal text-hub-ink" : "bg-hub-sand text-hub-ink"
            }`}
          >
            <Icon name={terbit ? "check" : "clock"} className="size-[1.1em]" />
            {terbit ? "Terverifikasi" : "Belum terbit"}
          </span>
        </div>

        <div className="flex items-end gap-[clamp(12px,3cqw,24px)]">
          <div
            aria-hidden="true"
            className="hidden aspect-[4/5] w-[21cqw] shrink-0 flex-col items-center justify-center gap-1 rounded-[clamp(10px,2.4cqw,18px)] border-2 border-white/30 bg-white/[0.06] text-white/70 @xl:flex"
          >
            <Icon name="user" className="size-[38%]" />
            <span className="text-xs">Foto alumni</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-balance text-[clamp(18px,4.6cqw,30px)] font-bold leading-tight [overflow-wrap:anywhere]">
              {d.nama}
            </p>
            <p className="mt-0.5 text-[clamp(13px,2.7cqw,18px)] text-white/85">{d.prodi}</p>
            <p className="mt-0.5 hidden text-[clamp(12px,2.1cqw,14px)] text-white/75 @sm:block">
              Lulus {d.tahunLulus ?? "-"}
              {d.npm ? ` · NPM ${d.npm}` : ""}
            </p>

            <p className="mt-[clamp(8px,2.2cqw,18px)] text-[clamp(12px,1.9cqw,13px)] font-semibold uppercase tracking-[0.2em] text-white/75">
              ID alumni
            </p>
            {terbit ? (
              <p className="font-mono text-[clamp(22px,6.6cqw,44px)] font-bold leading-none tracking-[0.06em] tabular-nums">
                {d.nomor}
              </p>
            ) : (
              <p className="inline-flex items-center gap-2 text-[clamp(16px,3.6cqw,24px)] font-semibold text-hub-sand">
                <Icon name="clock" className="size-[1.1em]" />
                Belum terbit
              </p>
            )}
          </div>

          <div className="hidden w-[21cqw] shrink-0 flex-col items-center gap-1.5 @xl:flex">
            <QrBox nomor={d.nomor} url={d.profilUrl} className="aspect-square w-full" />
            <span className="text-center text-xs leading-tight text-white/80">
              Pindai untuk membuka profil alumni
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Back({ d, hidden }: { d: CardData; hidden: boolean }) {
  return (
    <div
      className={`${face} rotate-y-180 border border-hub-line bg-white text-hub-ink`}
      aria-hidden={hidden}
      inert={hidden}
    >
      <div className="bg-hub-navy px-[clamp(16px,5cqw,32px)] py-[clamp(10px,2.6cqw,18px)] text-white">
        <Brand />
      </div>

      <div className="flex items-center gap-[clamp(12px,3.5cqw,28px)] px-[clamp(16px,5cqw,32px)] pt-[clamp(10px,3cqw,22px)]">
        <QrBox
          nomor={d.nomor}
          url={d.profilUrl}
          light
          className="aspect-square w-[clamp(84px,27cqw,150px)] shrink-0 border border-hub-line"
        />
        <dl className="grid min-w-0 flex-1 grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[clamp(12px,2.1cqw,15px)]">
          <dt className="text-hub-muted">Status</dt>
          <dd className="font-semibold">Alumni UBL</dd>
          <dt className="text-hub-muted">Lulus</dt>
          <dd className="font-semibold tabular-nums">{d.tahunLulus ?? "-"}</dd>
          {d.npm && (
            <>
              <dt className="text-hub-muted">NPM</dt>
              <dd className="font-semibold tabular-nums">{d.npm}</dd>
            </>
          )}
          <dt className="text-hub-muted">Prodi</dt>
          <dd className="font-semibold [overflow-wrap:anywhere]">{d.prodi}</dd>
        </dl>
      </div>

      <p className="absolute inset-x-0 bottom-0 hidden px-[clamp(16px,5cqw,32px)] pb-[clamp(10px,3cqw,20px)] text-[clamp(12px,1.9cqw,13px)] text-hub-muted @md:block">
        QR hanya membuka profil yang Anda izinkan. Data pribadi hanya dilaporkan secara
        agregat.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------- Panel */

export function AlumniCard({
  data,
  children,
}: {
  data: CardData;
  /** Tombol atau tautan tambahan di bawah tombol bawaan. */
  children?: React.ReactNode;
}) {
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tilt = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    // Kemiringan hanya untuk mouse. Sentuhan dibiarkan agar tidak mengganggu scroll.
    if (e.pointerType !== "mouse" || !tilt.current) return;
    const r = tilt.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const s = tilt.current.style;
    s.setProperty("--rx", `${((0.5 - py) * 9).toFixed(2)}deg`);
    s.setProperty("--ry", `${((px - 0.5) * 12).toFixed(2)}deg`);
    s.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    s.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    s.setProperty("--glare", "1");
  }

  function onLeave() {
    const s = tilt.current?.style;
    if (!s) return;
    s.setProperty("--rx", "0deg");
    s.setProperty("--ry", "0deg");
    s.setProperty("--glare", "0");
  }

  async function copy() {
    if (!data.nomor) return;
    try {
      await navigator.clipboard.writeText(data.nomor);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard bisa ditolak browser. Nomor tetap tampil di kartu untuk disalin manual.
    }
  }

  const btn = `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-hub-line bg-white px-3 text-sm font-medium transition-colors hover:bg-hub-canvas active:bg-hub-line/60 ${focusRing}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="@container w-full">
        <div className="perspective-distant">
          <div
            ref={tilt}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className="hub-tilt transform-3d"
          >
            <div
              onClick={() => setFlipped((f) => !f)}
              className={`relative aspect-[1.586] transform-3d transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                flipped ? "rotate-y-180" : ""
              } rounded-[clamp(14px,3.5cqw,24px)] shadow-[0_18px_40px_-18px_rgba(7,25,82,0.55)]`}
            >
              <Front d={data} hidden={flipped} />
              <Back d={data} hidden={!flipped} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          className={btn}
        >
          <Icon name="flip" className="size-4" />
          {flipped ? "Lihat depan" : "Balik kartu"}
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!data.nomor}
          className={`${btn} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Icon name={copied ? "check" : "copy"} className="size-4" />
          {copied ? "Tersalin" : "Salin nomor"}
        </button>
      </div>
      {children}
      <p role="status" className="sr-only">
        {copied ? "Nomor alumni disalin" : ""}
      </p>
    </div>
  );
}
