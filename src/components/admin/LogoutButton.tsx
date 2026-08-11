"use client";

import { useRouter } from "next/navigation";
import type { AdminLocale } from "@/lib/admin-i18n";
import { adminT } from "@/lib/admin-translations";

export default function LogoutButton({ locale = "vi" }: { locale?: AdminLocale }) {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return <button onClick={handleLogout} className="btn-secondary">{adminT(locale, "logout")}</button>;
}
