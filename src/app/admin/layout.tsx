import type { Metadata } from "next";
import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminTabs from "@/components/admin/AdminTabs";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";
import { getCurrentAdminUser } from "@/lib/auth";
import { normalizeAdminLocale } from "@/lib/admin-i18n";

export const metadata: Metadata = { title: "Quản trị tuyển dụng - JHONSIN VIETNAM CO.,LTD" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdminUser();
  const locale = normalizeAdminLocale(cookies().get("admin-locale")?.value);
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper-2)]">
      <Navbar />
      <main className="flex-1">
        {admin && <div className="container-page flex justify-end pt-4"><AdminLanguageSwitcher /></div>}
        <AdminTabs role={admin?.role ?? null} />
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
