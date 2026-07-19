"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

export default function PublicNavbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("jobs") },
    { href: "/company", label: t("company") },
    { href: "/products", label: t("products") },
    { href: "/capabilities", label: t("capabilities") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b-4 border-brand-600 bg-white shadow-sm">
      <div className="container-page flex min-h-20 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo className="h-10" />
        </Link>

        <nav className="hidden items-center self-stretch bg-[#930000] px-3 text-xs font-semibold text-white lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-3 transition hover:bg-brand-600"
            >
              {link.label}
            </Link>
          ))}
          {/* Khu vực quản trị không đa ngôn ngữ, luôn ở đường dẫn /admin cố định */}
          <NextLink href="/admin" className="flex items-center px-3 transition hover:bg-brand-600">
            {t("admin")}
          </NextLink>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-gray-300 text-brand-900 lg:hidden"
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6l-12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-gray-200 bg-[#930000] text-sm font-semibold text-white lg:hidden">
          <div className="container-page flex flex-col py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-3 transition hover:text-brand-100"
              >
                {link.label}
              </Link>
            ))}
            <NextLink
              href="/admin"
              onClick={() => setOpen(false)}
              className="py-3 transition hover:text-brand-100"
            >
              {t("admin")}
            </NextLink>
          </div>
        </nav>
      )}
    </header>
  );
}
