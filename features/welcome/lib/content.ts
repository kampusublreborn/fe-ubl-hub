// Narasi sementara. Ganti isi berkas ini saat narasi final dari UBL tersedia.
export type WelcomeStep = {
  title: (nama: string) => string;
  body: string;
  points?: string[];
};

export const WELCOME_STEPS: WelcomeStep[] = [
  {
    title: (nama) => `Selamat, ${nama}!`,
    body: "Selamat atas kelulusan Anda dari Universitas Bandar Lampung. Kini Anda resmi menjadi bagian dari keluarga besar alumni UBL, dan UBL Hub adalah rumah bersama Anda.",
  },
  {
    title: () => "Apa itu UBL Hub?",
    body: "UBL Hub adalah aplikasi alumni UBL untuk melanjutkan perjalanan Anda setelah lulus.",
    points: [
      "Mengisi tracer study dengan data yang sudah ada di kampus terisi otomatis",
      "Mencatat perjalanan karier lewat logbook alumni",
      "Memiliki kartu alumni UBL",
    ],
  },
  {
    title: () => "Terhubung dengan sesama alumni",
    body: "Bergabunglah dengan komunitas alumni berdasarkan profesi, ikuti informasi dan peluang karier dari UBL, dan temukan inspirasi dari Alumni of the Month.",
  },
];
