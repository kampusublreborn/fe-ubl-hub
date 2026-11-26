import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { COOKIE_NAME, decodeToken, displayName } from "@/features/auth";
import { WelcomeSteps } from "@/features/welcome";
import { LeftArt, RightArt } from "@/shared/components/auth-art";

export const metadata: Metadata = {
  title: "Selamat Datang | UBL Hub",
};

export default function WelcomePage() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-[#F4F6FB] text-[#0F1B3D]">
      <div className="absolute inset-x-0 bottom-[22%] hidden border-t border-[#C9D1E3] lg:block" />
      <LeftArt />
      <RightArt />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        {/* Membaca cookie sesi, jadi harus di dalam Suspense (Cache Components). */}
        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="h-[34rem] w-full max-w-[460px] animate-pulse rounded-[2.25rem] bg-white motion-reduce:animate-none"
            />
          }
        >
          <Steps />
        </Suspense>
      </div>

      <footer className="relative z-10 pb-8 text-center text-sm text-[#5B6784]">
        © Universitas Bandar Lampung
      </footer>
    </main>
  );
}

async function Steps() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const user = token ? decodeToken(token) : null;
  return <WelcomeSteps nama={user ? displayName(user) : "Alumni"} />;
}
