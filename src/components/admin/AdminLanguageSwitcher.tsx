"use client";

import { useEffect, useState } from "react";
import { normalizeAdminLocale, type AdminLocale } from "@/lib/admin-i18n";

const buttons: Array<{ locale: AdminLocale; label: string }> = [
  { locale: "vi", label: "VI" },
  { locale: "en", label: "EN" },
  { locale: "zh-TW", label: "繁中" },
];

export default function AdminLanguageSwitcher() {
  const [locale, setLocale] = useState<AdminLocale>("vi");

  useEffect(() => {
    setLocale(normalizeAdminLocale(localStorage.getItem("admin-locale")));
  }, []);

  function changeLocale(next: AdminLocale) {
    if (next === locale) return;
    localStorage.setItem("admin-locale", next);
    document.cookie = `admin-locale=${encodeURIComponent(next)}; path=/; max-age=31536000; samesite=lax`;
    setLocale(next);
    window.location.reload();
  }

  return (
    <div className="inline-flex overflow-hidden rounded-md border border-[var(--color-rule)] bg-[var(--color-paper)]" role="group" aria-label="Language">
      {buttons.map((item) => (
        <button
          key={item.locale}
          type="button"
          onClick={() => changeLocale(item.locale)}
          aria-pressed={locale === item.locale}
          className={`min-w-12 border-r border-[var(--color-rule)] px-3 py-1.5 text-sm font-semibold transition-colors last:border-r-0 ${
            locale === item.locale
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-muted)] hover:bg-[var(--color-paper-2)] hover:text-[var(--color-accent)]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
