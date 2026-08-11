"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { normalizeAdminLocale, type AdminLocale } from "@/lib/admin-i18n";
import { adminT } from "@/lib/admin-translations";

export default function AdminTabs({ role }: { role: string | null }) {
  const pathname = usePathname();
  const [locale, setLocale] = useState<AdminLocale>("vi");
  useEffect(() => setLocale(normalizeAdminLocale(localStorage.getItem("admin-locale"))), []);
  if (pathname === "/admin/login") return null;

  const tabs = [
    { href: "/admin", label: adminT(locale, "tabsJobs"), section: "jobs", show: true },
    { href: "/admin/applications", label: adminT(locale, "tabsApplications"), section: "applications", show: true },
    { href: "/admin/settings/ai", label: adminT(locale, "tabsAi"), section: "settings", show: hasPermission(role, "AI_CONFIGURE") },
    { href: "/admin/users", label: adminT(locale, "tabsUsers"), section: "users", show: hasPermission(role, "USERS_MANAGE") },
  ].filter((tab) => tab.show);

  const activeSection = pathname.startsWith("/admin/users") ? "users" : pathname.startsWith("/admin/settings") ? "settings" : pathname.startsWith("/admin/applications") ? "applications" : "jobs";

  return (
    <nav aria-label="Admin recruitment area" className="container-page pt-8">
      <div className="grid grid-cols-1 border-b border-[var(--color-rule)] sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => {
          const active = activeSection === tab.section;
          return <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={`flex min-h-12 items-center justify-center border-b-2 px-3 py-2 text-center text-sm font-bold transition sm:text-base ${active ? "border-[var(--color-accent)] bg-[var(--color-paper)] text-[var(--color-accent)]" : "border-transparent text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"}`}>{tab.label}</Link>;
        })}
      </div>
    </nav>
  );
}
