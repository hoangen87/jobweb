import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatSalary, formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

type JobCardProps = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  level?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  quantity: number;
  createdAt: Date | string;
};

export default function JobCard(job: JobCardProps) {
  const t = useTranslations("jobCard");
  const locale = useLocale() as Locale;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex min-h-64 min-w-0 flex-col bg-[var(--color-paper)] p-5 transition sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold leading-tight text-[var(--color-ink)]">{job.title}</h3>
        <span className="badge whitespace-nowrap">{job.department}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-muted)]">
        <span>📍 {job.location}</span>
        <span>🕒 {job.type}</span>
        {job.level && <span>🎯 {job.level}</span>}
        <span>
          👥 {job.quantity} {t("positions")}
        </span>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--color-rule)] pt-5">
        <span className="text-sm font-bold text-[var(--color-accent)]">
          {formatSalary(job.salaryMin, job.salaryMax, locale)}
        </span>
        <span className="text-right text-xs text-[var(--color-muted)]">
          {t("postedOn", { date: formatDate(job.createdAt, locale) })}
        </span>
      </div>
    </Link>
  );
}
