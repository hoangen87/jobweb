import type { Locale } from "@/i18n/routing";

export const INTL_LOCALE: Record<Locale, string> = {
  vi: "vi-VN",
  en: "en-US",
  zh: "zh-TW",
};

export function formatArea(sqm: number, locale: Locale = "vi") {
  const intlLocale = INTL_LOCALE[locale] ?? INTL_LOCALE.vi;
  return `${sqm.toLocaleString(intlLocale)} m²`;
}

const SALARY_WORDS: Record<Locale, { million: string; from: string; to: string; negotiable: string }> = {
  vi: { million: "triệu", from: "Từ", to: "Đến", negotiable: "Thỏa thuận" },
  en: { million: "million", from: "From", to: "Up to", negotiable: "Negotiable" },
  zh: { million: "百萬", from: "從", to: "至", negotiable: "面議" },
};

export function formatSalary(min?: number | null, max?: number | null, locale: Locale = "vi") {
  const words = SALARY_WORDS[locale] ?? SALARY_WORDS.vi;
  const intlLocale = INTL_LOCALE[locale] ?? INTL_LOCALE.vi;
  const fmt = (n: number) => `${(n / 1000000).toLocaleString(intlLocale)} ${words.million}`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `${words.from} ${fmt(min)}`;
  if (max) return `${words.to} ${fmt(max)}`;
  return words.negotiable;
}

export function formatDate(date: Date | string, locale: Locale = "vi") {
  const d = new Date(date);
  const intlLocale = INTL_LOCALE[locale] ?? INTL_LOCALE.vi;
  return d.toLocaleDateString(intlLocale, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function calculateAge(dateOfBirth: Date | string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function ageRangeToDobRange(ageMin?: number | null, ageMax?: number | null) {
  const range: { gte?: Date; lte?: Date } = {};
  const today = new Date();

  // Older person (higher age) => earlier (smaller) date of birth.
  // age >= ageMin  =>  dateOfBirth <= today - ageMin years
  if (ageMin !== null && ageMin !== undefined && !Number.isNaN(ageMin)) {
    range.lte = new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate());
  }
  // age <= ageMax  =>  dateOfBirth >= today - (ageMax + 1) years + 1 day
  if (ageMax !== null && ageMax !== undefined && !Number.isNaN(ageMax)) {
    const d = new Date(today.getFullYear() - ageMax - 1, today.getMonth(), today.getDate());
    d.setDate(d.getDate() + 1);
    range.gte = d;
  }

  return range;
}

export const EDUCATION_LEVELS = [
  "THPT",
  "Trung cấp",
  "Cao đẳng",
  "Đại học",
  "Sau đại học",
  "Khác",
];
