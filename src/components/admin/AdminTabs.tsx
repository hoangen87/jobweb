"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Quản lý tin tuyển dụng", section: "jobs" },
  { href: "/admin/applications", label: "Quản lý hồ sơ ứng viên", section: "applications" },
] as const;

export default function AdminTabs() {
  const pathname = usePathname();

  if (pathname === "/admin/login") return null;

  const activeSection = pathname.startsWith("/admin/applications") ? "applications" : "jobs";

  return (
    <nav aria-label="Khu vực quản trị tuyển dụng" className="container-page pt-8">
      <div className="grid grid-cols-2 border-b border-[var(--color-rule)]">
        {tabs.map((tab) => {
          const active = activeSection === tab.section;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center justify-center border-b-2 px-3 py-2 text-center text-sm font-bold transition sm:text-base ${
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-paper)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
