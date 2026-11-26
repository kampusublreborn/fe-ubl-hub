// Ilustrasi tiap langkah sambutan. Dekoratif (aria-hidden), warna mengikuti halaman login.
const INK = "#0F1B3D";
const TEAL = "#26A69A";
const SAND = "#E0A100";
const SOFT = "#EEF2FF";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 150"
      className="h-auto w-full max-w-[17rem]"
      fill="none"
      stroke={INK}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="120" cy="78" rx="104" ry="64" fill={SOFT} stroke="none" />
      {children}
    </svg>
  );
}

function Wisuda() {
  return (
    <Frame>
      {/* confetti */}
      <rect x="40" y="34" width="9" height="9" rx="2" fill={SAND} stroke="none" transform="rotate(20 44 38)" />
      <circle cx="62" cy="108" r="4" fill={TEAL} stroke="none" />
      <rect x="196" y="42" width="8" height="8" rx="2" fill={TEAL} stroke="none" transform="rotate(-18 200 46)" />
      <circle cx="184" cy="112" r="4.5" fill={SAND} stroke="none" />
      <path d="M30 78l6 6m0-6l-6 6" stroke={TEAL} />
      <path d="M208 84l6 6m0-6l-6 6" stroke={SAND} />
      {/* topi */}
      <path d="M84 84v22c0 8 16 14 36 14s36-6 36-14V84" fill="#fff" />
      <path d="M120 38l72 30-72 30-72-30z" fill={INK} />
      <path d="M120 98V68" stroke="#fff" strokeOpacity="0.35" />
      <path d="M188 70v34" />
      <circle cx="188" cy="108" r="6" fill={SAND} />
    </Frame>
  );
}

function Aplikasi() {
  return (
    <Frame>
      <rect x="48" y="26" width="144" height="104" rx="12" fill="#fff" />
      <path d="M48 48h144" />
      <circle cx="62" cy="37" r="2.6" fill={SAND} stroke="none" />
      <circle cx="72" cy="37" r="2.6" fill={TEAL} stroke="none" />
      <circle cx="82" cy="37" r="2.6" fill={INK} stroke="none" />
      {[64, 84, 104].map((y) => (
        <g key={y}>
          <circle cx="68" cy={y} r="7" fill={TEAL} stroke="none" />
          <path d={`M64.8 ${y}l2.4 2.4 4-4.6`} stroke="#fff" strokeWidth="1.8" />
          <rect x="84" y={y - 4} width={y === 84 ? 70 : 88} height="8" rx="4" fill={SOFT} stroke="none" />
        </g>
      ))}
      <rect x="150" y="100" width="56" height="32" rx="9" fill={SAND} stroke={INK} />
      <path d="M162 116h32M162 123h20" stroke={INK} />
    </Frame>
  );
}

function Komunitas() {
  return (
    <Frame>
      <path d="M120 78L64 48M120 78l56-30M120 78v50M64 48l56 80M176 48l-56 80" stroke={INK} strokeOpacity="0.35" />
      <circle cx="120" cy="78" r="18" fill={INK} />
      <path d="M113 84c1-4 4-6 7-6s6 2 7 6M120 74.5a3.6 3.6 0 100-.01" stroke="#fff" strokeWidth="1.6" />
      <circle cx="64" cy="48" r="12" fill={TEAL} />
      <circle cx="176" cy="48" r="12" fill={SAND} />
      <circle cx="120" cy="128" r="12" fill="#fff" />
      <circle cx="36" cy="100" r="5" fill={SAND} stroke="none" />
      <circle cx="206" cy="104" r="5" fill={TEAL} stroke="none" />
      <path d="M200 30l5 5m0-5l-5 5" stroke={TEAL} />
    </Frame>
  );
}

export const ILLUSTRATIONS = [Wisuda, Aplikasi, Komunitas];
