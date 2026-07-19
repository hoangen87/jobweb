import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatSalary, formatDate } from "@/lib/format";
import { localizeJob } from "@/lib/i18n-job";
import ApplyForm from "@/components/ApplyForm";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/routing";

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
          <h1 className="mt-3 text-2xl font-bold text-gray-900">{job.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
            <span>📍 {job.location}</span>
            <span>🕒 {job.type}</span>
            {job.level && <span>🎯 {job.level}</span>}
            <span>
              👥 {job.quantity} {t("positions")}
            </span>
            <span>💰 {formatSalary(job.salaryMin, job.salaryMax, locale as Locale)}</span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {t("postedOn", { date: formatDate(job.createdAt, locale as Locale) })}
            {job.deadline && <> · {t("deadline", { date: formatDate(job.deadline, locale as Locale) })}</>}
          </div>

          <div className="mt-8 space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <section>
              <h2 className="text-base font-semibold text-gray-900">{t("jobDescription")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {job.description}
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-gray-900">{t("requirements")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {job.requirements}
              </p>
            </section>
            {job.benefits && (
              <section>
                <h2 className="text-base font-semibold text-gray-900">{t("benefits")}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {job.benefits}
                </p>
              </section>
            )}
          </div>
        </div>

        <div>
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">{t("applyNow")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("applyHint")}</p>
            <div className="mt-4">
              <ApplyForm jobId={job.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
