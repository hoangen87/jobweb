import { prisma } from "@/lib/prisma";
import ApplicationsTable from "@/components/admin/ApplicationsTable";
import ApplicationFilter from "@/components/admin/ApplicationFilter";
import Link from "next/link";
import { ageRangeToDobRange } from "@/lib/format";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = {
  jobId?: string;
  education?: string;
  expMin?: string;
  expMax?: string;
  ageMin?: string;
  ageMax?: string;
  location?: string;
  level?: string;
  field?: string;
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { jobId, education, expMin, expMax, ageMin, ageMax, location, level, field } = searchParams;

  const experienceYears: Prisma.IntNullableFilter | undefined =
    expMin || expMax
      ? {
          ...(expMin ? { gte: Number(expMin) } : {}),
          ...(expMax ? { lte: Number(expMax) } : {}),
        }
      : undefined;

  const dobRange = ageRangeToDobRange(
    ageMin ? Number(ageMin) : undefined,
    ageMax ? Number(ageMax) : undefined
  );
  const dateOfBirth: Prisma.DateTimeNullableFilter | undefined =
    dobRange.gte || dobRange.lte ? dobRange : undefined;

  const where: Prisma.ApplicationWhereInput = {
    ...(jobId ? { jobId } : {}),
    ...(education ? { education } : {}),
    ...(field ? { fieldOfExpertise: field } : {}),
    ...(experienceYears ? { experienceYears } : {}),
    ...(dateOfBirth ? { dateOfBirth } : {}),
    ...(location || level
      ? {
          job: {
            ...(location ? { location } : {}),
            ...(level ? { level } : {}),
          },
        }
      : {}),
  };

  const [applications, jobLocations, jobLevels, applicationFields] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            title: true,
            location: true,
            level: true,
            reqEducationMin: true,
            reqExperienceYearsMin: true,
            reqAgeMin: true,
            reqAgeMax: true,
            reqField: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.findMany({ distinct: ["location"], select: { location: true } }),
    prisma.job.findMany({
      distinct: ["level"],
      select: { level: true },
      where: { level: { not: null } },
    }),
    prisma.application.findMany({
      distinct: ["fieldOfExpertise"],
      select: { fieldOfExpertise: true },
      where: { fieldOfExpertise: { not: null } },
    }),
  ]);

  const locations = jobLocations.map((j) => j.location).sort();
  const levels = jobLevels.map((j) => j.level as string).sort();
  const fields = applicationFields.map((a) => a.fieldOfExpertise as string).sort();

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ ứng tuyển</h1>
        <Link href="/admin" className="btn-secondary">
          ← Quay lại
        </Link>
      </div>

      <p className="mt-1 text-sm text-gray-500">
        Sàng lọc theo bằng cấp, kinh nghiệm, khu vực, cấp bậc, độ tuổi, ngành nghề. Hệ thống tự động chấm %
        phù hợp với yêu cầu tuyển dụng của từng tin (thiết lập yêu cầu khi đăng/sửa tin).
      </p>

      <div className="mt-4">
        <ApplicationFilter locations={locations} levels={levels} fields={fields} />
      </div>

      <div className="mt-4 text-sm text-gray-500">Tìm thấy {applications.length} hồ sơ</div>

      <div className="mt-2">
        <ApplicationsTable
          applications={applications.map((a) => ({
            ...a,
            createdAt: a.createdAt.toISOString(),
            dateOfBirth: a.dateOfBirth ? a.dateOfBirth.toISOString() : null,
          }))}
        />
      </div>
    </div>
  );
}
