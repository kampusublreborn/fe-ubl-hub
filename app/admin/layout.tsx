import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  currentUser,
  displayName,
  homePath,
  isAdmin,
  LogoutButton,
} from "@/features/auth";
import { AdminNav } from "@/features/admin";

async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!isAdmin(user)) redirect(homePath(user));
  return (
    <div className="min-h-dvh flex-1 bg-hub-canvas text-hub-ink lg:pl-64">
      <a
        href="#konten-admin"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:p-4"
      >
        Lewati ke konten
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-hub-line bg-white lg:flex">
        <Link href="/admin" className="flex items-center gap-3 p-6">
          <Image src="/ubl-logo.png" alt="" width={36} height={36} />
          <div>
            <p className="font-semibold">UBL Hub</p>
            <p className="text-xs text-hub-muted">Ruang Admin</p>
          </div>
        </Link>
        <AdminNav
          isBpkha={user.role === "admin-biro-bpkha"}
          className="flex-1 px-3"
        />
        <div className="border-t border-hub-line p-6 text-sm">
          <p className="font-medium">
            {user.role === "admin-prodi"
              ? "Admin Program Studi"
              : "Admin BPKHA"}
          </p>
          <p className="mt-1 text-hub-muted">
            {user.prodi?.nama ?? "Seluruh program studi"}
          </p>
        </div>
      </aside>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-hub-line bg-white px-4 py-4 sm:px-8">
        <div>
          <Link
            href="/admin"
            className="text-xs font-semibold uppercase tracking-widest text-hub-muted"
          >
            UBL Hub / Admin
          </Link>
          <p className="mt-1 font-semibold">{displayName(user)}</p>
        </div>
        <LogoutButton />
      </header>
      <AdminNav
        isBpkha={user.role === "admin-biro-bpkha"}
        className="border-b border-hub-line bg-white px-4 py-3 sm:px-8 lg:hidden"
      />
      <main
        id="konten-admin"
        className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-8 sm:py-8"
      >
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-hub-muted">
          Memuat ruang admin…
        </p>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
