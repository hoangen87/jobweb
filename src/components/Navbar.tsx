import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            JV
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-gray-900">JHONSIN VIETNAM</div>
            <div className="text-[11px] text-gray-500">Tuyển dụng</div>
          </div>
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
