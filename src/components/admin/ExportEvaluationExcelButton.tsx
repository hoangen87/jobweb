"use client";

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

type Props = {
  results: EvaluationResult[];
  jobTitle?: string;
  department?: string;
  version?: number;
};

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "ket-qua-danh-gia";
}

export default function ExportEvaluationExcelButton({ results, jobTitle, department, version }: Props) {
  function exportExcel() {
    if (results.length === 0) return;

    const generatedAt = new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());

    const rows = results
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map(
        (result) => `
          <tr>
            <td>${result.rank}</td>
            <td>${escapeHtml(result.fullName)}</td>
            <td>${result.score}%</td>
            <td>${escapeHtml(result.matchingExperience)}</td>
            <td>${escapeHtml(result.matchingSkills)}</td>
            <td>${escapeHtml(result.gaps)}</td>
            <td>${escapeHtml(result.aiComment)}</td>
          </tr>`
      )
      .join("");

    const workbook = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
  <meta charset="UTF-8" />
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt; }
    th, td { border: 1px solid #999; padding: 7px; vertical-align: top; white-space: normal; }
    th { background: #d9eaf7; font-weight: bold; text-align: center; }
    .title { font-size: 16pt; font-weight: bold; }
    .meta { font-style: italic; }
  </style>
</head>
<body>
  <table>
    <tr><td class="title" colspan="7">KẾT QUẢ ĐÁNH GIÁ VÀ XẾP HẠNG ỨNG VIÊN</td></tr>
    <tr><td colspan="7"><strong>Job Detail:</strong> ${escapeHtml(jobTitle || "—")}</td></tr>
    <tr><td colspan="7"><strong>Phòng ban:</strong> ${escapeHtml(department || "—")} &nbsp; <strong>Phiên bản:</strong> v${escapeHtml(version ?? "—")}</td></tr>
    <tr><td class="meta" colspan="7">Xuất lúc: ${escapeHtml(generatedAt)}. Kết quả AI chỉ hỗ trợ HR sàng lọc, không tự động quyết định tuyển dụng.</td></tr>
    <tr>
      <th>Xếp hạng</th>
      <th>Họ tên ứng viên</th>
      <th>Điểm phù hợp</th>
      <th>Kinh nghiệm phù hợp</th>
      <th>Kỹ năng phù hợp</th>
      <th>Điểm còn thiếu</th>
      <th>Nhận xét của AI</th>
    </tr>
    ${rows}
  </table>
</body>
</html>`;

    const blob = new Blob(["\ufeff", workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeFileName(`ket-qua-${jobTitle || "danh-gia"}`)}.xls`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={exportExcel} className="btn-secondary" title="Xuất bảng kết quả đánh giá ra Excel">
      Xuất Excel
    </button>
  );
}
