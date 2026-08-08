import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatSalary, formatDate } from "@/lib/format";
import { localizeJob } from "@/lib/i18n-job";
import ApplyForm from "@/components/ApplyForm";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { MapPin, Clock, Target, Users, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }> | { locale: string; id: string };
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "jobDetail" });

  const rawJob = await prisma.job.findUnique({ where: { id } });
  if (!rawJob) notFound();

  const job = localizeJob(rawJob, locale as Locale);

  return (
    <div className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <span className="badge">{job.department}</span>
          <h1 className="mt-3 text-2xl font-bold text-[var(--color-ink)]">{job.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden /> {job.location}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden /> {job.type}</span>
            {job.level && <span className="inline-flex items-center gap-1.5"><Target className="h-4 w-4" aria-hidden /> {job.level}</span>}
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden /> {job.quantity} {t("positions")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-4 w-4" aria-hidden /> {formatSalary(job.salaryMin, job.salaryMax, locale as Locale)}
            </span>
          </div>
          <div className="mt-1 text-xs text-[var(--color-muted)]">
            {t("postedOn", { date: formatDate(job.createdAt, locale as Locale) })}
            {job.deadline && <> · {t("deadline", { date: formatDate(job.deadline, locale as Locale) })}</>}
          </div>

          <div className="mt-8 space-y-6 border border-[var(--color-rule)] bg-[var(--color-paper)] p-6">
            <section>
              <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("jobDescription")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink-2)]">
                {job.description}
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("requirements")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink-2)]">
                {job.requirements}
              </p>
            </section>
            {job.benefits && (
              <section>
                <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("benefits")}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink-2)]">
                  {job.benefits}
                </p>
              </section>
            )}
          </div>
        </div>

        <div>
          <div className="sticky top-[var(--banner-height)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-6">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("applyNow")}</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{t("applyHint")}</p>
            <div className="mt-4">
              <ApplyForm jobId={job.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
