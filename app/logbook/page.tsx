import { redirect } from "next/navigation";

// Umpan logbook kini menjadi Beranda.
export default function Page() {
  redirect("/");
}
