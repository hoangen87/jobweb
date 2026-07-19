"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, calculateAge } from "@/lib/format";
import { screenApplication, SCREENING_PASS_THRESHOLD, type ScreeningResult } from "@/lib/screening";

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
  job: {
    title: string;
    location?: string;
    level?: string | null;
    reqEducationMin?: string | null;
    reqExperienceYearsMin?: number | null;
    reqAgeMin?: number | null;
    reqAgeMax?: number | null;
    reqField?: string | null;
  };
};

const STATUS_OPTIONS = ["NEW", "REVIEWING", "INTERVIEW", "REJECTED", "HIRED"];
const STATUS_LABEL: Record<string, string> = {
  NEW: "Mới",
  REVIEWING: "Đang xem xét",
  INTERVIEW: "Mời phỏng vấn",
  REJECTED: "Từ chối",
  HIRED: "Đã tuyển",
};

type Bucket = "all" | "qualified" | "unqualified" | "unset";

function scoreBadgeClass(result: ScreeningResult) {
  if (result.score === null) return "bg-gray-100 text-gray-500";
  if (result.qualified) return "bg-green-100 text-green-700";
  return "bg-red-100 text-red-700";
}

export default function ApplicationsTable({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [bucket, setBucket] = useState<Bucket>("all");

  const scored = useMemo(
    () => applications.map((app) => ({ app, result: screenApplication(app, app.job) })),
    [applications]
  );

  const summary = useMemo(() => {
    let qualified = 0;
    let unqualified = 0;
    let unset = 0;
    for (const { result } of scored) {
      if (result.score === null) unset++;
      else if (result.qualified) qualified++;
      else unqualified++;
    }
    return { qualified, unqualified, unset, total: scored.length };
  }, [scored]);

  const filtered = useMemo(() => {
    if (bucket === "all") return scored;
    if (bucket === "qualified") return scored.filter((s) => s.result.qualified === true);
    if (bucket === "unqualified") return scored.filter((s) => s.result.qualified === false);
    return scored.filter((s) => s.result.score === null);
  }, [scored, bucket]);

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
    <div>
      <div className="grid gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setBucket("all")}
          className={`rounded-xl border p-4 text-left transition ${
            bucket === "all" ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white hover:border-brand-300"
          }`}
        >
          <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
          <div className="text-xs text-gray-500">Tổng số hồ sơ</div>
        </button>
        <button
          type="button"
          onClick={() => setBucket("qualified")}
          className={`rounded-xl border p-4 text-left transition ${
            bucket === "qualified" ? "border-green-600 bg-green-50" : "border-gray-200 bg-white hover:border-green-300"
          }`}
        >
          <div className="text-2xl font-bold text-green-700">{summary.qualified}</div>
          <div className="text-xs text-gray-500">Đạt yêu cầu (≥ {SCREENING_PASS_THRESHOLD}%)</div>
        </button>
        <button
          type="button"
          onClick={() => setBucket("unqualified")}
          className={`rounded-xl border p-4 text-left transition ${
            bucket === "unqualified" ? "border-red-600 bg-red-50" : "border-gray-200 bg-white hover:border-red-300"
          }`}
        >
          <div className="text-2xl font-bold text-red-700">{summary.unqualified}</div>
          <div className="text-xs text-gray-500">Không đạt yêu cầu</div>
        </button>
        <button
          type="button"
          onClick={() => setBucket("unset")}
          className={`rounded-xl border p-4 text-left transition ${
            bucket === "unset" ? "border-gray-500 bg-gray-100" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="text-2xl font-bold text-gray-500">{summary.unset}</div>
          <div className="text-xs text-gray-500">Tin chưa đặt yêu cầu chấm điểm</div>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          Không có hồ sơ nào trong nhóm này.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Ứng viên</th>
                <th className="px-4 py-3">Tuổi</th>
                <th className="px-4 py-3">Vị trí ứng tuyển</th>
                <th className="px-4 py-3">Bằng cấp</th>
                <th className="px-4 py-3">Kinh nghiệm</th>
                <th className="px-4 py-3">Ngành nghề</th>
                <th className="px-4 py-3">% Phù hợp</th>
                <th className="px-4 py-3">Liên hệ</th>
                <th className="px-4 py-3">CV</th>
                <th className="px-4 py-3">Ngày nộp</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(({ app, result }) => {
                const age = calculateAge(app.dateOfBirth);
                const tooltip = result.criteria.map((c) => `${c.label}: ${c.detail}`).join("\n");
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
                    <td className="px-4 py-3">
                      {result.score === null ? (
                        <span
                          className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-500"
                          title="Tin tuyển dụng chưa đặt yêu cầu cụ thể để chấm điểm"
                        >
                          Chưa có yêu cầu
                        </span>
                      ) : (
                        <span
                          className={`inline-flex flex-col items-start rounded-full px-2.5 py-1 text-xs font-semibold ${scoreBadgeClass(
                            result
                          )}`}
                          title={tooltip}
                        >
                          {result.score}% · {result.qualified ? "Đạt yêu cầu" : "Không đạt"}
                        </span>
                      )}
                    </td>
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
      )}
    </div>
  );
}
