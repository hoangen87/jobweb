import type { Locale } from "@/i18n/routing";

export type JobLike = {
  title: string;
  department: string;
  location: string;
  type: string;
  level?: string | null;
  description: string;
  requirements: string;
  benefits?: string | null;
  translations?: unknown;
};

type TranslatedFields = {
  title?: string;
  department?: string;
  location?: string;
  type?: string;
  level?: string | null;
  description?: string;
  requirements?: string;
  benefits?: string | null;
};

/**
 * Trả về job với các trường văn bản đã thay bằng bản dịch tương ứng (nếu có
 * và locale khác "vi"). Nếu chưa có bản dịch (job cũ, hoặc dịch lỗi), giữ
 * nguyên nội dung tiếng Việt gốc.
 */
export function localizeJob<T extends JobLike>(job: T, locale: Locale): T {
  if (locale === "vi") return job;

  const translations = job.translations as Record<string, TranslatedFields> | null | undefined;
  const t = translations?.[locale];
  if (!t) return job;

  return {
    ...job,
    title: t.title || job.title,
    department: t.department || job.department,
    location: t.location || job.location,
    type: t.type || job.type,
    level: t.level ?? job.level,
    description: t.description || job.description,
    requirements: t.requirements || job.requirements,
    benefits: t.benefits ?? job.benefits,
  };
}
