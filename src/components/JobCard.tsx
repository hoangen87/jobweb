import Link from "next/link";
import { formatSalary, formatDate } from "@/lib/format";

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
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
        <span className="badge whitespace-nowrap">{job.department}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
        <span>📍 {job.location}</span>
        <span>🕒 {job.type}</span>
        {job.level && <span>🎯 {job.level}</span>}
        <span>👥 {job.quantity} chỉ tiêu</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-700">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
        <span className="text-xs text-gray-400">Đăng ngày {formatDate(job.createdAt)}</span>
      </div>
    </Link>
  );
}
