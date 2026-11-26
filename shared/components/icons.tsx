// Satu keluarga ikon garis (24px, stroke 1.75) supaya konsisten. Dekoratif: selalu aria-hidden,
// makna disampaikan oleh teks di sebelahnya.

const PATHS = {
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  clipboard:
    "M9 4h6v3H9zM7 5.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1h-1M9 12h6M9 16h4",
  book: "M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 7.5h6",
  route:
    "M7 5.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM21 18.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 5.5h6.5a3.5 3.5 0 0 1 0 7h-3a3.5 3.5 0 0 0 0 7H17",
  idcard:
    "M3 6.5h18v11H3zM7.5 12.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM5.3 15.5c.4-1.6 4-1.6 4.4 0M13 10h5M13 14h3.5",
  users:
    "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M16 5.3a3 3 0 0 1 0 5.4M18 15.2c1.8.7 3 2.2 3 4.8",
  megaphone: "M4 10v4h3l8 4V6l-8 4zM18 9a4 4 0 0 1 0 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6 6 18",
  minus: "M6 12h12",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  arrow: "M5 12h14M13 6l6 6-6 6",
  logout: "M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M15 8l4 4-4 4M19 12H9",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  award:
    "M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.8 13.2 8 21l4-2 4 2-.8-7.8",
  target:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  plus: "M12 5v14M5 12h14",
  calendar: "M4 6.5h16V20H4zM4 10.5h16M8 4v4M16 4v4",
  flip: "M4 8h13l-3-3M20 16H7l3 3",
  copy: "M9 9h10v11H9zM15 9V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  chevron: "m6 9 6 6 6-6",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  msg: "M4 5h16v11H9l-5 4z",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  sparkle:
    "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  className = "size-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
