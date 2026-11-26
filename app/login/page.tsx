import type { Metadata } from "next";
import { LoginForm } from "@/features/auth";
import { LeftArt, RightArt } from "@/shared/components/auth-art";

export const metadata: Metadata = {
  title: "Masuk | UBL Hub",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-[#F4F6FB] text-[#0F1B3D]">
      <div className="absolute inset-x-0 bottom-[22%] hidden border-t border-[#C9D1E3] lg:block" />
      <LeftArt />
      <RightArt />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px] rounded-[2.25rem] bg-white px-7 py-10 shadow-[0_30px_60px_-20px_rgba(7,25,82,0.18)] sm:px-10">
          <h1 className="text-center text-3xl font-bold tracking-tight">
            Masuk
          </h1>
          <p className="mx-auto mb-8 mt-4 max-w-[17rem] text-center text-base leading-relaxed text-[#5B6784]">
            Silakan masuk dengan akun UBL Apps Anda.
          </p>
          <LoginForm />
          <p className="mt-5 text-center text-sm leading-relaxed text-[#5B6784]">
            Alumni dan admin masuk di sini. Akses disesuaikan dengan peran akun Anda.
          </p>
        </div>
      </div>

      <footer className="relative z-10 pb-8 text-center text-sm text-[#5B6784]">
        © Universitas Bandar Lampung
      </footer>
    </main>
  );
}
