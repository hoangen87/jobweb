import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en", "zh"],
  defaultLocale: "vi",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

// Mã ngôn ngữ dùng khi gọi API dịch thuật (MyMemory) — "zh" hiển thị trên URL
// nhưng dịch sang tiếng Trung phồn thể (Đài Loan).
export const TRANSLATE_LANG_CODE: Record<Locale, string> = {
  vi: "vi",
  en: "en",
  zh: "zh-TW",
};

export const LOCALE_LABEL: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
  zh: "繁體中文",
};
