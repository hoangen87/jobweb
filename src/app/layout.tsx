import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Tuyển dụng - JHONSIN VIETNAM CO.,LTD",
  description:
    "Trang tuyển dụng chính thức của Công ty TNHH Jhonsin Việt Nam - Sản xuất sản phẩm từ plastic tại KCN An Phước, Đồng Nai.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col bg-gray-50 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
