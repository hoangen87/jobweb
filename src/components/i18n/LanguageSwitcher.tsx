"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_SHORT_LABEL: Record<(typeof routing.locales)[number], string> = {
  vi: "VN",
  en: "EN",
  zh: "中國",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSelect(nextLocale: (typeof routing.locales)[number]) {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div className="flex items-center border border-[var(--color-rule)] bg-[var(--color-paper)] p-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => handleSelect(l)}
          disabled={isPending}
          aria-current={l === locale}
          className={`min-h-9 whitespace-nowrap px-2 text-xs font-bold transition ${
            l === locale
              ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
              : "text-[var(--color-muted)] hover:bg-[var(--color-paper-2)]"
          }`}
        >
          {LOCALE_SHORT_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
