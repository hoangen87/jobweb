import type { AdminLocale } from "./admin-i18n";

export function formatAdminDate(value: string | Date, locale: AdminLocale) {
  const date = value instanceof Date ? value : new Date(value);
  const fmt = locale === "vi" ? "vi-VN" : locale === "zh-TW" ? "zh-TW" : "en-US";
  return new Intl.DateTimeFormat(fmt, { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
