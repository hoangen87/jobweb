"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasPermission } from "@/lib/permissions";

export default function AdminTabs({ role }: { role: string | null }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  const tabs = [
    { href: "/admin", label: "Quản lý tin tuyển dụng", section: "jobs", show: true },
    { href: "/admin/applications", label: "Quản lý hồ sơ ứng viên", section: "applications", show: true },
    { href: "/admin/settings/ai", label: "Cấu hình AI", section: "settings", show: hasPermission(role, "AI_CONFIGURE") },
    { href: "/admin/users", label: "Người dùng & Phân quyền", section: "users", show: hasPermission(role, "USERS_MANAGE") },
  ].filter((tab) => tab.show);

  const activeSection = pathname.startsWith("/admin/users")
    ? "users"
    : pathname.startsWith("/admin/settings")
      ? "settings"
      : pathname.startsWith("/admin/applications")
        ? "applications"
        : "jobs";

  return (
    <nav aria-label="Khu vực quản trị tuyển dụng" className="container-page pt-8">
      <div className="grid grid-cols-1 border-b border-[var(--color-rule)] sm:grid-cols-2 lg:grid-cols-4">
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
