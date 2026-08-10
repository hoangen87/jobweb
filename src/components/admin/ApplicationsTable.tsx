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
  fileName: string;
  filePath: string;
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

  async function deleteJobDescription(id: string, title: string) {
    if (!confirm(`Xóa Job Detail "${title}"? Các kết quả đánh giá AI đã chấm theo Job Detail này cũng sẽ bị xóa.`)) return;
    const response = await fetch(`/api/job-descriptions/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.error || "Không thể xóa Job Detail.");
      return;
    }
    if (selectedJdId === id) setSelectedJdId("");
    router.refresh();
  }

  return (
    <div>
      <div className="rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[var(--color-ink-2)]">Job Detail dùng để đánh giá</span>
            <select
              value={selectedJdId}
              onChange={(event) => {
                setSelectedJdId(event.target.value);
                setResults([]);
                setResultErrors([]);
              }}
              className="input-field"
            >
              <option value="">-- Chọn 01 Job Detail trong thư viện --</option>
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
          <div className="mt-3 rounded-[var(--radius-app)] bg-[var(--color-accent-soft)] px-3 py-2 text-sm text-[var(--color-ink)]">
            <strong>{selectedJd.title}</strong> · Phòng ban: {selectedJd.department} · Phiên bản: v
            {selectedJd.version} · Cập nhật: {formatDate(selectedJd.updatedAt)}
          </div>
        )}
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Kết quả AI chỉ hỗ trợ HR sàng lọc, không tự động quyết định tuyển dụng.
        </p>
        {error && <p className="mt-3 text-sm text-[var(--color-error)]">{error}</p>}

        {jobDescriptions.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-[var(--radius-app)] border border-[var(--color-rule)]">
            <table className="min-w-full divide-y divide-[var(--color-rule)] text-sm">
              <thead className="bg-[var(--color-paper-2)] text-left text-xs font-semibold uppercase text-[var(--color-muted)]">
                <tr>
                  <th className="px-4 py-2.5">Tên Job Detail</th>
                  <th className="px-4 py-2.5">Phòng ban</th>
                  <th className="px-4 py-2.5">Phiên bản</th>
                  <th className="px-4 py-2.5">Cập nhật</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-rule)]">
                {jobDescriptions.map((jd) => (
                  <tr key={jd.id} className={jd.id === selectedJdId ? "bg-[var(--color-accent-soft)]/60" : ""}>
                    <td className="px-4 py-2.5 font-medium text-[var(--color-ink)]">{jd.title}</td>
                    <td className="px-4 py-2.5 text-[var(--color-muted)]">{jd.department}</td>
                    <td className="px-4 py-2.5 text-[var(--color-muted)]">v{jd.version}</td>
                    <td className="px-4 py-2.5 text-[var(--color-muted)]">{formatDate(jd.updatedAt)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-3">
                        <a
                          href={`/api/admin/files?type=jd&id=${jd.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--color-accent)] hover:underline"
                        >
                          Xem
                        </a>
                        <button
                          type="button"
                          onClick={() => deleteJobDescription(jd.id, jd.title)}
                          className="text-[var(--color-error)] hover:underline"
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
        )}
      </div>

      {applications.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-app)] border border-dashed border-[var(--color-rule)] bg-[var(--color-paper)] p-10 text-center text-[var(--color-muted)]">
          Chưa có hồ sơ ứng viên hoặc không có hồ sơ nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] shadow-sm">
          <table className="min-w-full divide-y divide-[var(--color-rule)] text-sm">
            <thead className="bg-[var(--color-paper-2)] text-left text-xs font-semibold uppercase text-[var(--color-muted)]">
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
            <tbody className="divide-y divide-[var(--color-rule)]">
              {applications.map((application) => (
                <tr key={application.id} className={selectedIds.has(application.id) ? "bg-[var(--color-accent-soft)]/60" : ""}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(application.id)}
                      onChange={() => toggleOne(application.id)}
                      aria-label={`Chọn hồ sơ ${application.fullName}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{application.fullName}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    <div>{application.job.title}</div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {application.job.location}
                      {application.job.level ? ` · ${application.job.level}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    <div>{application.education || "—"}</div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {application.experienceYears ?? "—"} năm · {application.fieldOfExpertise || "—"} ·{" "}
                      {calculateAge(application.dateOfBirth) ?? "—"} tuổi
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    <div>{application.email}</div>
                    <div>{application.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/api/admin/files?type=cv&id=${application.id}`} target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline">
                      Xem CV
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{formatDate(application.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-md border border-[var(--color-rule)] bg-[var(--color-paper)] px-2 py-1 text-xs"
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
                      className="text-[var(--color-error)] hover:underline"
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
              <h2 className="text-xl font-bold text-[var(--color-ink)]">Kết quả đánh giá và xếp hạng</h2>
              <p className="text-sm text-[var(--color-muted)]">
                {selectedJd?.title} · {selectedJd?.department} · v{selectedJd?.version}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] shadow-sm">
            <table className="min-w-full divide-y divide-[var(--color-rule)] text-sm">
              <thead className="bg-[var(--color-paper-2)] text-left text-xs font-semibold uppercase text-[var(--color-muted)]">
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
              <tbody className="divide-y divide-[var(--color-rule)]">
                {results.map((result) => (
                  <tr key={result.applicationId}>
                    <td className="px-4 py-3 text-center text-lg font-bold text-[var(--color-accent)]">#{result.rank}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--color-ink)]">{result.fullName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 font-bold text-[var(--color-accent)]">{result.score}%</span>
                    </td>
                    <td className="min-w-[220px] px-4 py-3 text-[var(--color-muted)]">{result.matchingExperience}</td>
                    <td className="min-w-[220px] px-4 py-3 text-[var(--color-muted)]">{result.matchingSkills}</td>
                    <td className="min-w-[220px] px-4 py-3 text-[var(--color-muted)]">{result.gaps}</td>
                    <td className="min-w-[260px] px-4 py-3 text-[var(--color-muted)]">{result.aiComment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resultErrors.length > 0 && (
        <div className="mt-4 rounded-[var(--radius-app)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] p-4 text-sm text-[var(--color-warning)]">
          <div className="font-semibold">Một số hồ sơ chưa đánh giá được:</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {resultErrors.map((item) => <li key={item.fullName}>{item.fullName}: {item.error}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
