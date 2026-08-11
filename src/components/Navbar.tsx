"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { normalizeAdminLocale, type AdminLocale } from "@/lib/admin-i18n";

const labels: Record<AdminLocale, { jobs: string; company: string; admin: string }> = {
  vi: { jobs: "Việc làm", company: "Giới thiệu công ty", admin: "Quản trị" },
  en: { jobs: "Jobs", company: "Company", admin: "Admin" },
  "zh-TW": { jobs: "職缺", company: "公司介紹", admin: "管理後台" },
};

export default function Navbar() {
  const [locale, setLocale] = useState<AdminLocale>("vi");
  useEffect(() => setLocale(normalizeAdminLocale(localStorage.getItem("admin-locale"))), []);
  const t = labels[locale];
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2"><Logo className="h-8" /></Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--color-muted)] sm:flex">
          <Link href="/" className="hover:text-[var(--color-accent)]">{t.jobs}</Link>
          <Link href="/company" className="hover:text-[var(--color-accent)]">{t.company}</Link>
          <Link href="/admin" className="hover:text-[var(--color-accent)]">{t.admin}</Link>
        </nav>
      </div>
    </header>
  );
}
