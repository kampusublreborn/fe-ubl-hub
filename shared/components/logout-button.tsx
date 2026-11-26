"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/shared/components/icons";
import { matikanPush } from "@/shared/lib/web-push";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [galat, setGalat] = useState("");

  async function onClick() {
    setPending(true);
    try { await matikanPush(); }
    catch {
      setGalat("Gagal menonaktifkan notifikasi perangkat. Coba keluar lagi.");
      setPending(false);
      return;
    }
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-hub-line bg-white px-4 text-sm font-medium text-hub-ink transition-colors hover:bg-hub-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-navy disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon name="logout" className="size-4" />
      {pending ? "Keluar..." : "Keluar"}
      {galat && <span role="alert" className="text-xs text-red-700">{galat}</span>}
    </button>
  );
}
