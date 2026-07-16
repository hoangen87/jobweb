import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import SearchFilter from "@/components/SearchFilter";
import { COMPANY } from "@/lib/constants";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  department?: string;
  location?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, department, location } = searchParams;

  const jobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
      ...(q ? { title: { contains: q } } : {}),
      ...(department ? { department } : {}),
      ...(location ? { location } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const allJobs = await prisma.job.findMany({ where: { status: "OPEN" } });
  const departments = Array.from(new Set(allJobs.map((j) => j.department))).sort();
  const locations = Array.from(new Set(allJobs.map((j) => j.location))).sort();

  return (
    <div>
      <section className="border-b border-gray-200 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
        <div className="container-page py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-100">
            {COMPANY.shortName}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
            Cơ hội nghề nghiệp tại Jhonsin Việt Nam
          </h1>
          <p className="mt-4 max-w-2xl text-brand-50">
            Chúng tôi đang tìm kiếm những ứng viên tận tâm, trách nhiệm để cùng phát triển
            trong lĩnh vực sản xuất sản phẩm nhựa gia dụng tại KCN An Phước, Đồng Nai.
          </p>
        </div>
      </section>

      <div className="container-page -mt-8 pb-16">
        <SearchFilter departments={departments} locations={locations} />

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Vị trí đang tuyển ({jobs.length})
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            Hiện chưa có vị trí phù hợp với bộ lọc của bạn.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
