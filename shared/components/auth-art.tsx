// Ilustrasi latar yang dipakai halaman login dan sambutan.
const INK = "#0F1B3D";
const PEACH = "#26A69A";
const SAND = "#E0A100";

function Dots({ id }: { id: string }) {
  return (
    <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="7" cy="7" r="3.2" fill={INK} />
      <circle cx="20" cy="19" r="3.2" fill={INK} />
    </pattern>
  );
}

export function LeftArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 360 420"
      className="pointer-events-none absolute bottom-24 left-[3%] hidden h-[56%] max-h-[420px] lg:block"
      fill="none"
      stroke={INK}
      strokeWidth="1"
    >
      <defs>
        <Dots id="dotsL" />
      </defs>
      <path d="M10 40c20-30 35 20 55-5s30-35 55-10" />
      <circle cx="140" cy="8" r="4" />
      <rect x="40" y="70" width="110" height="64" />
      <path d="M58 92h74M58 112h54M52 134l-12 20 30-20" />
      <circle cx="170" cy="190" r="5" />
      <rect x="0" y="230" width="72" height="190" fill={SAND} stroke="none" />
      <rect x="0" y="230" width="72" height="190" fill="url(#dotsL)" stroke="none" />
      <rect x="92" y="280" width="88" height="140" fill="#fff" />
      <path d="M112 395c4-40 24-78 52-98m0 0l-6 22m6-22l-22 6" />
      <path d="M190 280c14-18 28-22 40 0" />
    </svg>
  );
}

export function RightArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 380 420"
      className="pointer-events-none absolute bottom-24 right-[3%] hidden h-[56%] max-h-[420px] lg:block"
      fill="none"
      stroke={INK}
      strokeWidth="1"
    >
      <defs>
        <Dots id="dotsR" />
      </defs>
      <path d="M250 30c18-26 32 22 52-4s28-30 60-8" />
      <circle cx="372" cy="2" r="4" />
      <rect x="60" y="60" width="62" height="38" fill="#fff" />
      <path d="M72 74h38M72 86h38" />
      <rect x="150" y="190" width="130" height="230" fill="#fff" />
      <rect x="310" y="215" width="70" height="205" fill={PEACH} stroke="none" />
      <rect x="310" y="215" width="70" height="205" fill="url(#dotsR)" stroke="none" />
      {/* person */}
      <path d="M40 250l60-110 22 12-34 70z" fill="#26A69A" stroke="none" />
      <path
        d="M70 330c20-60 60-90 120-80 20 4 22 40 6 70l-40 60"
        fill="#fff"
      />
      <path d="M96 250c24-30 60-40 90-30l8 40-60 6z" fill={INK} stroke="none" />
      <circle cx="170" cy="150" r="22" fill="#fff" />
      <path d="M150 140c4-30 44-34 46 0-14-8-30-8-46 0z" fill={INK} stroke="none" />
      <circle cx="208" cy="122" r="12" fill={INK} stroke="none" />
      <path d="M60 340l-26 18 22 16 24-26z" fill={INK} stroke="none" />
      <path d="M150 400l22-12 18 24-26 8z" fill={INK} stroke="none" />
    </svg>
  );
}
