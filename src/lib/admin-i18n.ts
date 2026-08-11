export const ADMIN_LOCALES = ["vi", "en", "zh-TW"] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];

export function normalizeAdminLocale(value?: string | null): AdminLocale {
  return ADMIN_LOCALES.includes(value as AdminLocale) ? (value as AdminLocale) : "vi";
}

export const ADMIN_LOCALE_LABELS: Record<AdminLocale, string> = {
  vi: "Tiếng Việt",
  en: "English",
  "zh-TW": "繁體中文",
};

export const AI_LANGUAGE_NAMES: Record<AdminLocale, string> = {
  vi: "tiếng Việt",
  en: "English",
  "zh-TW": "Traditional Chinese (繁體中文)",
};
