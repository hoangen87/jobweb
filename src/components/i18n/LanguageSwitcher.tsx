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
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => handleSelect(l)}
          disabled={isPending}
          aria-current={l === locale}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
            l === locale
              ? "bg-brand-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {LOCALE_SHORT_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
