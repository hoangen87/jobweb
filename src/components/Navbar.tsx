import Link from "next/link";
import Logo from "@/components/Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--color-muted)] sm:flex">
          <Link href="/" className="hover:text-[var(--color-accent)]">
            Việc làm
          </Link>
          <Link href="/company" className="hover:text-[var(--color-accent)]">
            Giới thiệu công ty
          </Link>
          <Link href="/admin" className="hover:text-[var(--color-accent)]">
            Quản trị
          </Link>
        </nav>
      </div>
    </header>
  );
}
