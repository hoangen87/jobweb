"use client";

import type { AdminLocale } from "@/lib/admin-i18n";

type EvaluationResult = { applicationId: string; fullName: string; score: number; matchingExperience: string; matchingSkills: string; gaps: string; aiComment: string; rank: number };
type Props = { results: EvaluationResult[]; jobTitle?: string; department?: string; version?: number; locale?: AdminLocale };

function escapeHtml(value: string | number | undefined) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function safeFileName(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "evaluation-results"; }

const labels = {
  vi: { button: "Xuất Excel", title: "KẾT QUẢ ĐÁNH GIÁ VÀ XẾP HẠNG ỨNG VIÊN", department: "Phòng ban", version: "Phiên bản", exported: "Xuất lúc", note: "Kết quả AI chỉ hỗ trợ HR sàng lọc, không tự động quyết định tuyển dụng.", rank: "Xếp hạng", candidate: "Họ tên ứng viên", score: "Điểm phù hợp", experience: "Kinh nghiệm phù hợp", skills: "Kỹ năng phù hợp", gaps: "Điểm còn thiếu", comment: "Nhận xét của AI", file: "ket-qua-danh-gia" },
  en: { button: "Export Excel", title: "CANDIDATE EVALUATION AND RANKING RESULTS", department: "Department", version: "Version", exported: "Exported at", note: "AI results support HR screening only and do not make automatic hiring decisions.", rank: "Rank", candidate: "Candidate", score: "Fit Score", experience: "Matching Experience", skills: "Matching Skills", gaps: "Gaps", comment: "AI Evaluation", file: "candidate-evaluation" },
  "zh-TW": { button: "匯出 Excel", title: "應徵者評估與排名結果", department: "部門", version: "版本", exported: "匯出時間", note: "AI 結果僅供 HR 篩選參考，不會自動做出錄用決定。", rank: "排名", candidate: "應徵者", score: "符合度", experience: "符合經驗", skills: "符合技能", gaps: "不足項目", comment: "AI 評估", file: "candidate-evaluation" },
} as const;

export default function ExportEvaluationExcelButton({ results, jobTitle, department, version, locale = "vi" }: Props) {
  function exportExcel() {
    if (results.length === 0) return;
    const l = labels[locale];
    const fmtLocale = locale === "vi" ? "vi-VN" : locale === "zh-TW" ? "zh-TW" : "en-US";
    const generatedAt = new Intl.DateTimeFormat(fmtLocale, { dateStyle: "short", timeStyle: "short" }).format(new Date());
    const rows = results.slice().sort((a, b) => a.rank - b.rank).map((result) => `<tr><td>${result.rank}</td><td>${escapeHtml(result.fullName)}</td><td>${result.score}%</td><td>${escapeHtml(result.matchingExperience)}</td><td>${escapeHtml(result.matchingSkills)}</td><td>${escapeHtml(result.gaps)}</td><td>${escapeHtml(result.aiComment)}</td></tr>`).join("");
    const workbook = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8" /><style>table{border-collapse:collapse;font-family:Arial,sans-serif;font-size:11pt}th,td{border:1px solid #999;padding:7px;vertical-align:top;white-space:normal}th{background:#d9eaf7;font-weight:bold;text-align:center}.title{font-size:16pt;font-weight:bold}.meta{font-style:italic}</style></head><body><table><tr><td class="title" colspan="7">${l.title}</td></tr><tr><td colspan="7"><strong>Job Detail:</strong> ${escapeHtml(jobTitle || "—")}</td></tr><tr><td colspan="7"><strong>${l.department}:</strong> ${escapeHtml(department || "—")} &nbsp; <strong>${l.version}:</strong> v${escapeHtml(version ?? "—")}</td></tr><tr><td class="meta" colspan="7">${l.exported}: ${escapeHtml(generatedAt)}. ${l.note}</td></tr><tr><th>${l.rank}</th><th>${l.candidate}</th><th>${l.score}</th><th>${l.experience}</th><th>${l.skills}</th><th>${l.gaps}</th><th>${l.comment}</th></tr>${rows}</table></body></html>`;
    const blob = new Blob(["\ufeff", workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${safeFileName(`${l.file}-${jobTitle || "results"}`)}.xls`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  }
  return <button type="button" onClick={exportExcel} className="btn-secondary" title={labels[locale].button}>{labels[locale].button}</button>;
}
