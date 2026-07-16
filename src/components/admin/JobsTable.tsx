"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  createdAt: string;
  _count?: { applications: number };
};

export default function JobsTable({ jobs }: { jobs: Job[] }) {
  const router = useRouter();

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Xóa tin "${title}"? Hồ sơ ứng tuyển liên quan cũng sẽ bị xóa.`)) return;
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Không thể xóa tin tuyển dụng.");
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
        Chưa có tin tuyển dụng nào. Bấm "Đăng tin mới" để bắt đầu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Vị trí</th>
            <th className="px-4 py-3">Phòng ban</th>
            <th className="px-4 py-3">Địa điểm</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Ngày đăng</th>
            <th className="px-4 py-3">Hồ sơ</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="px-4 py-3 font-medium text-gray-900">{job.title}</td>
              <td className="px-4 py-3 text-gray-600">{job.department}</td>
              <td className="px-4 py-3 text-gray-600">{job.location}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    job.status === "OPEN"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {job.status === "OPEN" ? "Đang tuyển" : "Đã đóng"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(job.createdAt)}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/applications?jobId=${job.id}`} className="text-brand-600 hover:underline">
                  {job._count?.applications ?? 0} hồ sơ
                </Link>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/jobs/${job.id}/edit`} className="text-brand-600 hover:underline">
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(job.id, job.title)}
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
