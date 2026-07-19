import Link from "next/link";
import Logo from "@/components/Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
          <Link href="/" className="hover:text-brand-600">
            Việc làm
          </Link>
          <Link href="/company" className="hover:text-brand-600">
            Giới thiệu công ty
          </Link>
          <Link href="/admin" className="hover:text-brand-600">
            Quản trị
          </Link>
        </nav>
      </div>
    </header>
  );
}
