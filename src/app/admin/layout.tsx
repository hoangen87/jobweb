import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ApiKeyButton from "@/components/admin/ApiKeyButton";

export const metadata: Metadata = {
  title: "Quản trị tuyển dụng - JHONSIN VIETNAM CO.,LTD",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer actions={<ApiKeyButton />} />
    </div>
  );
}
