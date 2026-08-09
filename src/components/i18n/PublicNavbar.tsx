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
    <header className="sticky top-0 z-40 border-b border-[var(--color-ink)] bg-[var(--color-paper)]">
      <div className="container-page relative flex min-h-16 flex-wrap items-center justify-between gap-y-2 border-b border-[var(--color-rule)] py-3 lg:flex-nowrap">
        <Link href="/" className="shrink-0" aria-label="JHONSIN">
          <Logo className="h-7 max-w-[92px] sm:h-11 sm:max-w-none" />
        </Link>
        <div className="order-3 w-full px-1 text-center text-base font-bold uppercase leading-snug tracking-[0.08em] text-[var(--color-ink)] sm:text-lg lg:absolute lg:left-1/2 lg:order-none lg:w-auto lg:max-w-[52%] lg:-translate-x-1/2 lg:px-0">
          {t("companyName")}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center border border-[var(--color-rule)] text-[var(--color-ink)] lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              {open ? <path strokeLinecap="round" d="M6 6l12 12M18 6l-12 12" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <nav className="container-page hidden min-h-12 items-stretch justify-center text-xs font-bold uppercase tracking-[0.08em] lg:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center whitespace-nowrap border-x border-transparent px-4 transition hover:border-[var(--color-rule)] hover:text-[var(--color-accent)]">
            {link.label}
          </Link>
        ))}
        <NextLink href="/admin" className="flex items-center whitespace-nowrap border-x border-transparent px-4 transition hover:border-[var(--color-rule)] hover:text-[var(--color-accent)]">
          {t("admin")}
        </NextLink>
      </nav>

      {open && (
        <nav className="border-t border-[var(--color-rule)] bg-[var(--color-paper)] text-sm font-bold lg:hidden">
          <div className="container-page flex flex-col py-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center whitespace-nowrap border-b border-[var(--color-rule)]">
                {link.label}
              </Link>
            ))}
            <NextLink href="/admin" onClick={() => setOpen(false)} className="flex min-h-11 items-center whitespace-nowrap">
              {t("admin")}
            </NextLink>
          </div>
        </nav>
      )}
    </header>
  );
}
