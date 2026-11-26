// Konfeti ringan untuk ucapan selamat. Posisi tetap (tanpa Math.random) agar aman saat hydration.
const COLORS = ["#E0A100", "#26A69A", "#0F1B3D", "#E0A100", "#26A69A"];
const PIECES = [
  [8, 0, 0.1], [16, 1, 0.4], [24, 2, 0.0], [32, 3, 0.55], [40, 4, 0.2],
  [48, 0, 0.7], [56, 1, 0.15], [64, 2, 0.5], [72, 3, 0.3], [80, 4, 0.8],
  [88, 0, 0.05], [12, 2, 0.9], [60, 4, 0.65], [92, 1, 0.45],
] as const;

export function Confetti() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.25rem]"
    >
      {PIECES.map(([left, c, delay], i) => (
        <span
          key={i}
          className="welcome-confetti absolute top-0 block h-2.5 w-1.5 rounded-[1px]"
          style={{
            left: `${left}%`,
            backgroundColor: COLORS[c],
            animationDelay: `${delay}s`,
            ["--spin" as string]: `${(i % 2 ? 1 : -1) * (240 + i * 20)}deg`,
          }}
        />
      ))}
    </div>
  );
}
