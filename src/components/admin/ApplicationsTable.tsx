"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateAge, formatDate } from "@/lib/format";

type Application = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  education: string | null;
  experienceYears: number | null;
  fieldOfExpertise: string | null;
  cvFilePath: string;
  status: string;
  createdAt: string;
  job: { title: string; location?: string; level?: string | null };
};

type JobDescriptionOption = {
  id: string;
  title: string;
  department: string;
  version: number;
  updatedAt: string;
};

type EvaluationResult = {
  applicationId: string;
  fullName: string;
  score: number;
  matchingExperience: string;
  matchingSkills: string;
  gaps: string;
  aiComment: string;
  rank: number;
};

const STATUS_OPTIONS = ["NEW", "REVIEWING", "INTERVIEW", "REJECTED", "HIRED"];
const STATUS_LABEL: Record<string, string> = {
  NEW: "Mới",
  REVIEWING: "Đang xem xét",
  INTERVIEW: "Mời phỏng vấn",
  REJECTED: "Từ chối",
  HIRED: "Đã tuyển",
};

export default function ApplicationsTable({
  applications,
  jobDescriptions,
}: {
  applications: Application[];
  jobDescriptions: JobDescriptionOption[];
}) {
  const router = useRouter();
  const [selectedJdId, setSelectedJdId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [resultErrors, setResultErrors] = useState<Array<{ fullName: string; error: string }>>([]);

  const allSelected = applications.length > 0 && selectedIds.size === applications.length;
  const selectedJd = useMemo(
    () => jobDescriptions.find((jd) => jd.id === selectedJdId),
    [jobDescriptions, selectedJdId]
  );

  function toggleOne(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(applications.map((application) => application.id)));
  }

  async function evaluateSelected() {
    if (!selectedJdId || selectedIds.size === 0) return;
    setEvaluating(true);
    setError("");
    setResultErrors([]);
    try {
      const response = await fetch("/api/evaluations/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionId: selectedJdId,
          applicationIds: Array.from(selectedIds),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Không thể đánh giá hồ sơ.");
      setResults(data.results || []);
      setResultErrors(data.errors || []);
      router.refresh();
    } catch (evaluationError) {
      setError(evaluationError instanceof Error ? evaluationError.message : "Không thể đánh giá hồ sơ.");
    } finally {
      setEvaluating(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) router.refresh();
  }

  async function deleteApplication(id: string, fullName: string) {
    if (!confirm(`Xóa hồ sơ của "${fullName}"?`)) return;
    const response = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    if (response.ok) router.refresh();
  }

  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">JD dùng để đánh giá</span>
            <select
              value={selectedJdId}
              onChange={(event) => {
                setSelectedJdId(event.target.value);
                setResults([]);
                setResultErrors([]);
              }}
              className="input-field"
            >
              <option value="">-- Chọn 01 JD trong thư viện --</option>
              {jobDescriptions.map((jd) => (
                <option key={jd.id} value={jd.id}>
                  {jd.title} · {jd.department} · v{jd.version} · cập nhật {formatDate(jd.updatedAt)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={toggleAll} disabled={applications.length === 0} className="btn-secondary">
            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </button>
          <button
            type="button"
            onClick={evaluateSelected}
            disabled={!selectedJdId || selectedIds.size === 0 || evaluating}
            className="btn-primary"
          >
            {evaluating ? `Đang đánh giá ${selectedIds.size} HS...` : `Đánh giá HS (${selectedIds.size})`}
          </button>
        </div>

        {selectedJd && (
          <div className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-900">
            <strong>{selectedJd.title}</strong> · Phòng ban: {selectedJd.department} · Phiên bản: v
            {selectedJd.version} · Cập nhật: {formatDate(selectedJd.updatedAt)}
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Kết quả AI chỉ hỗ trợ HR sàng lọc, không tự động quyết định tuyển dụng.
        </p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {applications.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          Chưa có hồ sơ ứng viên hoặc không có hồ sơ nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Chọn tất cả hồ sơ" />
                </th>
                <th className="px-4 py-3">Ứng viên</th>
                <th className="px-4 py-3">Vị trí ứng tuyển</th>
                <th className="px-4 py-3">Thông tin sàng lọc</th>
                <th className="px-4 py-3">Liên hệ</th>
                <th className="px-4 py-3">CV</th>
                <th className="px-4 py-3">Ngày nộp</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((application) => (
                <tr key={application.id} className={selectedIds.has(application.id) ? "bg-brand-50/50" : ""}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(application.id)}
                      onChange={() => toggleOne(application.id)}
                      aria-label={`Chọn hồ sơ ${application.fullName}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{application.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{application.job.title}</div>
                    <div className="text-xs text-gray-400">
                      {application.job.location}
                      {application.job.level ? ` · ${application.job.level}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{application.education || "—"}</div>
                    <div className="text-xs text-gray-400">
                      {application.experienceYears ?? "—"} năm · {application.fieldOfExpertise || "—"} ·{" "}
                      {calculateAge(application.dateOfBirth) ?? "—"} tuổi
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{application.email}</div>
                    <div>{application.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={application.cvFilePath} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                      Xem CV
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(application.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                      value={application.status}
                      onChange={(event) => updateStatus(application.id, event.target.value)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{STATUS_LABEL[status]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteApplication(application.id, application.fullName)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Kết quả đánh giá và xếp hạng</h2>
              <p className="text-sm text-gray-500">
                {selectedJd?.title} · {selectedJd?.department} · v{selectedJd?.version}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Xếp hạng</th>
                  <th className="px-4 py-3">Họ tên ứng viên</th>
                  <th className="px-4 py-3">Điểm phù hợp</th>
                  <th className="px-4 py-3">Kinh nghiệm phù hợp</th>
                  <th className="px-4 py-3">Kỹ năng phù hợp</th>
                  <th className="px-4 py-3">Điểm còn thiếu</th>
                  <th className="px-4 py-3">Nhận xét của AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((result) => (
                  <tr key={result.applicationId}>
                    <td className="px-4 py-3 text-center text-lg font-bold text-brand-700">#{result.rank}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{result.fullName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-50 px-3 py-1 font-bold text-brand-700">{result.score}%</span>
                    </td>
                    <td className="min-w-[220px] px-4 py-3 text-gray-600">{result.matchingExperience}</td>
                    <td className="min-w-[220px] px-4 py-3 text-gray-600">{result.matchingSkills}</td>
                    <td className="min-w-[220px] px-4 py-3 text-gray-600">{result.gaps}</td>
                    <td className="min-w-[260px] px-4 py-3 text-gray-600">{result.aiComment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resultErrors.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="font-semibold">Một số hồ sơ chưa đánh giá được:</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {resultErrors.map((item) => <li key={item.fullName}>{item.fullName}: {item.error}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
