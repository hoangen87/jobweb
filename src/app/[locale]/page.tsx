import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import SearchFilter from "@/components/SearchFilter";
import { COMPANY } from "@/lib/constants";
import { localizeJob } from "@/lib/i18n-job";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  department?: string;
  location?: string;
};

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }> | { locale: string };
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: "home" });
  const { q, department, location } = searchParams;

  // Tìm kiếm phải khớp cả tiêu đề gốc (vi) lẫn bản dịch của ngôn ngữ đang xem,
  // nếu không người dùng EN/ZH gõ từ khóa tiếng Anh/Trung sẽ không ra kết quả.
  const titleWhere: Prisma.JobWhereInput = q
    ? currentLocale === "vi"
      ? { title: { contains: q } }
      : {
          OR: [
            { title: { contains: q } },
            {
              translations: {
                path: [currentLocale, "title"],
                string_contains: q,
              },
            },
          ],
        }
    : {};

  const jobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
      ...titleWhere,
      ...(department ? { department } : {}),
      ...(location ? { location } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const allJobs = await prisma.job.findMany({ where: { status: "OPEN" } });

  // Giá trị lọc (value) giữ nguyên tiếng Việt gốc để khớp đúng dữ liệu trong DB,
  // nhưng nhãn hiển thị (label) trong dropdown được dịch theo ngôn ngữ đang xem.
  const departmentLabels = new Map<string, string>();
  const locationLabels = new Map<string, string>();
  for (const job of allJobs) {
    if (!departmentLabels.has(job.department)) {
      departmentLabels.set(job.department, localizeJob(job, currentLocale).department);
    }
    if (!locationLabels.has(job.location)) {
      locationLabels.set(job.location, localizeJob(job, currentLocale).location);
    }
  }
  const departments = Array.from(departmentLabels, ([value, label]) => ({ value, label })).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const locations = Array.from(locationLabels, ([value, label]) => ({ value, label })).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const localizedJobs = jobs.map((job) => localizeJob(job, currentLocale));

  return (
    <div>
      <section className="relative overflow-hidden border-b-4 border-brand-600 bg-gradient-to-br from-[#4a0000] via-[#930000] to-[#c23a3a] text-white">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 select-none text-[13rem] font-black italic leading-none text-white/10 sm:text-[17rem]"
        >
          J
        </span>
        <div className="container-page relative py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            {COMPANY.shortName}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">{t("heroTitle")}</h1>
          <p className="mt-4 max-w-2xl text-white/90">{t("heroSubtitle")}</p>
        </div>
      </section>

      <div className="container-page -mt-8 pb-16">
        <SearchFilter departments={departments} locations={locations} />

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("openPositions", { count: jobs.length })}
          </h2>
        </div>

        {localizedJobs.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            {t("noResults")}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {localizedJobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
