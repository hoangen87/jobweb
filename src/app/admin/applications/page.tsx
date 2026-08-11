import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import ApplicationsTable from "@/components/admin/ApplicationsTable";
import ApplicationFilter from "@/components/admin/ApplicationFilter";
import JobDescriptionManager from "@/components/admin/JobDescriptionManager";
import { ageRangeToDobRange } from "@/lib/format";
import { normalizeAdminLocale } from "@/lib/admin-i18n";
import { adminT } from "@/lib/admin-translations";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = { jobId?: string; education?: string; expMin?: string; expMax?: string; ageMin?: string; ageMax?: string; location?: string; level?: string; field?: string };

export default async function ApplicationsPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = normalizeAdminLocale(cookies().get("admin-locale")?.value);
  const { jobId, education, expMin, expMax, ageMin, ageMax, location, level, field } = searchParams;
  const experienceYears: Prisma.IntNullableFilter | undefined = expMin || expMax ? { ...(expMin ? { gte: Number(expMin) } : {}), ...(expMax ? { lte: Number(expMax) } : {}) } : undefined;
  const dobRange = ageRangeToDobRange(ageMin ? Number(ageMin) : undefined, ageMax ? Number(ageMax) : undefined);
  const dateOfBirth: Prisma.DateTimeNullableFilter | undefined = dobRange.gte || dobRange.lte ? dobRange : undefined;
  const where: Prisma.ApplicationWhereInput = {
    ...(jobId ? { jobId } : {}), ...(education ? { education } : {}), ...(field ? { fieldOfExpertise: field } : {}), ...(experienceYears ? { experienceYears } : {}), ...(dateOfBirth ? { dateOfBirth } : {}),
    ...(location || level ? { job: { ...(location ? { location } : {}), ...(level ? { level } : {}) } } : {}),
  };

  const [applications, jobDescriptions, jobLocations, jobLevels, applicationFields] = await Promise.all([
    prisma.application.findMany({ where, include: { job: { select: { title: true, location: true, level: true, reqEducationMin: true, reqExperienceYearsMin: true, reqAgeMin: true, reqAgeMax: true, reqField: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.jobDescription.findMany({ select: { id: true, title: true, department: true, version: true, fileName: true, filePath: true, createdAt: true, updatedAt: true }, orderBy: { updatedAt: "desc" } }),
    prisma.job.findMany({ distinct: ["location"], select: { location: true } }),
    prisma.job.findMany({ distinct: ["level"], select: { level: true }, where: { level: { not: null } } }),
    prisma.application.findMany({ distinct: ["fieldOfExpertise"], select: { fieldOfExpertise: true }, where: { fieldOfExpertise: { not: null } } }),
  ]);

  const locations = jobLocations.map((j) => j.location).sort();
  const levels = jobLevels.map((j) => j.level as string).sort();
  const fields = applicationFields.map((a) => a.fieldOfExpertise as string).sort();

  return <div className="container-page py-10">
    <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[var(--color-ink)]">{adminT(locale, "appTitle")}</h1><div className="relative flex items-center gap-2"><JobDescriptionManager locale={locale} jobDescriptions={jobDescriptions.map((jd) => ({ ...jd, createdAt: jd.createdAt.toISOString(), updatedAt: jd.updatedAt.toISOString() }))} /></div></div>
    <p className="mt-1 text-sm text-[var(--color-muted)]">{adminT(locale, "appDesc")}</p>
    <div className="mt-4"><ApplicationFilter locations={locations} levels={levels} fields={fields} locale={locale} /></div>
    <div className="mt-4 text-sm text-[var(--color-muted)]">{adminT(locale, "found")} {applications.length} {adminT(locale, "records")}</div>
    <div className="mt-2"><ApplicationsTable locale={locale} jobDescriptions={jobDescriptions.map((jd) => ({ id: jd.id, title: jd.title, department: jd.department, version: jd.version, fileName: jd.fileName, filePath: jd.filePath, updatedAt: jd.updatedAt.toISOString() }))} applications={applications.map((a) => ({ ...a, createdAt: a.createdAt.toISOString(), dateOfBirth: a.dateOfBirth ? a.dateOfBirth.toISOString() : null, aiAnalyzedAt: a.aiAnalyzedAt ? a.aiAnalyzedAt.toISOString() : null }))} /></div>
  </div>;
}
