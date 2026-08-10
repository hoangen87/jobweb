import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminTabs from "@/components/admin/AdminTabs";

export const metadata: Metadata = {
  title: "Quản trị tuyển dụng - JHONSIN VIETNAM CO.,LTD",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper-2)]">
      <Navbar />
      <main className="flex-1">
        <AdminTabs />
        {children}
      </main>
      <Footer />
    </div>
  );
}
