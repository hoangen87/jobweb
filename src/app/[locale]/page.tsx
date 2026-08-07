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
      <section className="editorial-hero">
        <img
          src="/images/banners/home.jpg"
          alt=""
          aria-hidden
          className="editorial-hero__image"
        />
        <div className="container-page editorial-hero__content">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">
            {COMPANY.shortName}
          </p>
          <h1 className="editorial-hero__title">{t("heroTitle")}</h1>
          <p className="editorial-hero__lede">{t("heroSubtitle")}</p>
        </div>
      </section>

      <div className="container-page py-10 sm:py-14">
        <SearchFilter departments={departments} locations={locations} />

        <div className="catalogue-rule mt-12 flex items-end justify-between gap-4 pt-5">
          <h2 className="text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            {t("openPositions", { count: jobs.length })}
          </h2>
        </div>

        {localizedJobs.length === 0 ? (
          <div className="mt-6 border-y border-[var(--color-rule)] py-16 text-center text-[var(--color-muted)]">
            {t("noResults")}
          </div>
        ) : (
          <div className="mt-6 grid min-w-0 gap-px border border-[var(--color-rule)] bg-[var(--color-rule)] sm:grid-cols-2 lg:grid-cols-3">
            {localizedJobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
