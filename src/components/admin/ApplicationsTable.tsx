"use client";

import { useRouter } from "next/navigation";
import { formatDate, calculateAge } from "@/lib/format";

type Application = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  education: string | null;
  experienceYears: number | null;
  fieldOfExpertise: string | null;
  cvFileName: string;
  cvFilePath: string;
  status: string;
  createdAt: string;
  job: { title: string; location?: string; level?: string | null };
};

const STATUS_OPTIONS = ["NEW", "REVIEWING", "INTERVIEW", "REJECTED", "HIRED"];
const STATUS_LABEL: Record<string, string> = {
  NEW: "Mới",
  REVIEWING: "Đang xem xét",
  INTERVIEW: "Mời phỏng vấn",
  REJECTED: "Từ chối",
  HIRED: "Đã tuyển",
};

export default function ApplicationsTable({ applications }: { applications: Application[] }) {
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Xóa hồ sơ của "${name}"?`)) return;
    const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
        Không có hồ sơ nào khớp với bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Ứng viên</th>
            <th className="px-4 py-3">Tuổi</th>
            <th className="px-4 py-3">Vị trí ứng tuyển</th>
            <th className="px-4 py-3">Bằng cấp</th>
            <th className="px-4 py-3">Kinh nghiệm</th>
            <th className="px-4 py-3">Ngành nghề</th>
            <th className="px-4 py-3">Liên hệ</th>
            <th className="px-4 py-3">CV</th>
            <th className="px-4 py-3">Ngày nộp</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((app) => {
            const age = calculateAge(app.dateOfBirth);
            return (
              <tr key={app.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{app.fullName}</td>
                <td className="px-4 py-3 text-gray-600">{age ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  <div>{app.job.title}</div>
                  {app.job.location && (
                    <div className="text-xs text-gray-400">
                      {app.job.location}
                      {app.job.level ? ` · ${app.job.level}` : ""}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{app.education ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {app.experienceYears !== null ? `${app.experienceYears} năm` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{app.fieldOfExpertise ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  <div>{app.email}</div>
                  <div>{app.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <a href={app.cvFilePath} target="_blank" className="text-brand-600 hover:underline">
                    Xem CV
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(app.createdAt)}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(app.id, app.fullName)}
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
