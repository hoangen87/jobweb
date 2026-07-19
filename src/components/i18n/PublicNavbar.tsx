import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

export default function PublicNavbar() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo className="h-8" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
          <Link href="/" className="hover:text-brand-600">
            {t("jobs")}
          </Link>
          <Link href="/company" className="hover:text-brand-600">
            {t("company")}
          </Link>
          {/* Khu vực quản trị không đa ngôn ngữ, luôn ở đường dẫn /admin cố định */}
          <NextLink href="/admin" className="hover:text-brand-600">
            {t("admin")}
          </NextLink>
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
