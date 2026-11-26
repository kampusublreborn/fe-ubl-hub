This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Notifikasi perangkat

Halaman `/notifikasi` menampilkan riwayat, jumlah belum dibaca, tombol tandai dibaca,
dan pengaturan Web Push. Tautan lonceng tersedia di sidebar dan bilah atas mobile.
Push dipicu oleh hasil verifikasi tracer dan balasan komentar dari alumni lain.

Backend UBL Hub perlu menerapkan migration `20261125200000_alumni_notifikasi` dan
mengatur `HUB_VAPID_SUBJECT`, `HUB_VAPID_PUBLIC_KEY`, serta `HUB_VAPID_PRIVATE_KEY`.
Panduan dan script `setup:push` tersedia di README backend `apps/ubl-hub`.
Frontend hanya membutuhkan `HUB_API_URL` yang sudah dipakai fitur lain; kunci publik
diambil dari API dan kunci privat tetap di backend.

Jalankan melalui HTTPS atau localhost. Di halaman Notifikasi, klik **Aktifkan notifikasi**
lalu berikan izin browser. Di iPhone/iPad 16.4+, tambahkan UBL Hub ke Layar Utama dan
buka aplikasi dari sana terlebih dahulu. Izin diminta setelah klik, bukan otomatis.
Logout dan login baru menghentikan subscription browser sebelumnya agar akun lain di
perangkat bersama tidak menerima push milik pengguna lama. Setelah masuk kembali,
aktifkan lagi melalui halaman Notifikasi.

Klik push membuka aktivitas terkait lewat notifikasi milik akun yang sedang masuk.
Logbook yang sudah dihapus atau tidak bisa diakses akan menampilkan pesan dari API.
Notifikasi tidak menyimpan isi komentar atau catatan revisi pada lock screen.
Riwayat tetap tersedia ketika push tidak didukung atau izinnya ditolak.

Pemeriksaan: `node --test tests/web-push.test.mjs`, `npm run lint`, dan `npm run build`.
Uji HP sungguhan memerlukan backend yang sudah dimigrasikan dan dikonfigurasi.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
