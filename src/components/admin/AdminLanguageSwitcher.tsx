"use client";

import { useEffect, useState } from "react";
import { ADMIN_LOCALES, ADMIN_LOCALE_LABELS, normalizeAdminLocale, type AdminLocale } from "@/lib/admin-i18n";

export default function AdminLanguageSwitcher() {
  const [locale, setLocale] = useState<AdminLocale>("vi");

  useEffect(() => {
    setLocale(normalizeAdminLocale(localStorage.getItem("admin-locale")));
  }, []);

  function changeLocale(next: AdminLocale) {
    localStorage.setItem("admin-locale", next);
    document.cookie = `admin-locale=${encodeURIComponent(next)}; path=/; max-age=31536000; samesite=lax`;
    setLocale(next);
    window.location.reload();
  }

  return (
    <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
      <span aria-hidden="true">🌐</span>
      <select
        aria-label="Language"
        className="rounded-md border border-[var(--color-rule)] bg-[var(--color-paper)] px-2 py-1.5 text-[var(--color-ink)]"
        value={locale}
        onChange={(event) => changeLocale(event.target.value as AdminLocale)}
      >
        {ADMIN_LOCALES.map((item) => <option key={item} value={item}>{ADMIN_LOCALE_LABELS[item]}</option>)}
      </select>
    </label>
  );
}
