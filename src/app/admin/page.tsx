import Link from "next/link";
import { prisma } from "@/lib/prisma";
import JobsTable from "@/components/admin/JobsTable";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  const totalApplications = await prisma.application.count();
  const openJobs = jobs.filter((j) => j.status === "OPEN").length;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản trị tuyển dụng</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý tin tuyển dụng và hồ sơ ứng viên.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/applications" className="btn-secondary">
            Tất cả hồ sơ ({totalApplications})
          </Link>
          <Link href="/admin/jobs/new" className="btn-primary">
            + Đăng tin mới
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase text-gray-500">Tổng số tin</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{jobs.length}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase text-gray-500">Đang tuyển</div>
          <div className="mt-2 text-2xl font-bold text-green-600">{openJobs}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase text-gray-500">Hồ sơ đã nhận</div>
          <div className="mt-2 text-2xl font-bold text-brand-600">{totalApplications}</div>
        </div>
      </div>

      <div className="mt-8">
        <JobsTable
          jobs={jobs.map((j) => ({ ...j, createdAt: j.createdAt.toISOString() }))}
        />
      </div>
    </div>
  );
}
