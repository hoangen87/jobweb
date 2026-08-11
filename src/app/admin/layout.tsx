import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminTabs from "@/components/admin/AdminTabs";
import { getCurrentAdminUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Quản trị tuyển dụng - JHONSIN VIETNAM CO.,LTD",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdminUser();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper-2)]">
      <Navbar />
      <main className="flex-1">
        <AdminTabs role={admin?.role ?? null} />
        {children}
      </main>
      <Footer />
    </div>
  );
}
