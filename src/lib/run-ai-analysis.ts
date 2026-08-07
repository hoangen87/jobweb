import { prisma } from "./prisma";
import { screenApplication } from "./screening";
import { extractCvText } from "./cv-extract";
import { analyzeApplicationWithAI, AiScreeningUnavailableError } from "./ai-screening";

// Hướng 3 (kết hợp): lọc nhanh bằng dữ liệu cấu trúc trước (screening.ts) —
// chỉ hồ sơ "lọt vòng đầu" (đạt ≥ 70% theo tiêu chí cụ thể của tin tuyển
// dụng), hoặc tin chưa đặt yêu cầu cấu trúc nào, mới được đưa qua vòng phân
// tích AI đọc CV thật để chấm % sâu hơn kèm nhận xét. Việc này giúp tiết
// kiệm chi phí gọi AI cho các hồ sơ rõ ràng không phù hợp ngay từ vòng 1.
export async function runAiAnalysisForApplication(
  applicationId: string,
  origin: string,
  force = false,
  jobDescriptionId?: string
): Promise<void> {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!app) throw new Error("Không tìm thấy hồ sơ ứng tuyển.");

  const selectedJd = jobDescriptionId
    ? await prisma.jobDescription.findUnique({ where: { id: jobDescriptionId } })
    : null;
  if (jobDescriptionId && !selectedJd) {
    throw new Error("Không tìm thấy JD đã chọn.");
  }

  const structured = screenApplication(app, app.job);
  const failedFirstRound = structured.score !== null && structured.qualified === false;

  if (failedFirstRound && !force) {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        aiStatus: "SKIPPED",
        aiScore: null,
        aiSummary:
          "Chưa đạt vòng sàng lọc theo tiêu chí cụ thể của tin tuyển dụng (< 70%) nên hệ thống bỏ qua phân tích AI để tiết kiệm chi phí. Admin có thể bấm \"Phân tích lại bằng AI\" nếu vẫn muốn xem đánh giá chi tiết.",
        aiAnalyzedAt: new Date(),
      },
    });
    return;
  }

  const extracted = await extractCvText(app.cvFilePath, origin);
  if ("error" in extracted) {
    await prisma.application.update({
      where: { id: applicationId },
      data: { aiStatus: "ERROR", aiScore: null, aiSummary: extracted.error, aiAnalyzedAt: new Date() },
    });
    return;
  }

  try {
    const result = await analyzeApplicationWithAI({
      jobTitle: selectedJd?.title ?? app.job.title,
      jobDescription: selectedJd?.content ?? app.job.description,
      jobRequirements: selectedJd ? "Đánh giá theo toàn bộ nội dung JD đã tải lên." : app.job.requirements,
      reqEducationMin: app.job.reqEducationMin,
      reqExperienceYearsMin: app.job.reqExperienceYearsMin,
      reqAgeMin: app.job.reqAgeMin,
      reqAgeMax: app.job.reqAgeMax,
      reqField: app.job.reqField,
      cvText: extracted.text,
    });

    const providerLabel = result.provider === "gemini" ? "[Gemini - free]" : "[Claude]";
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        aiStatus: "DONE",
        aiScore: result.score,
        aiSummary: `${providerLabel} ${result.summary}`,
        aiAnalyzedAt: new Date(),
        aiJobDescriptionId: selectedJd?.id ?? null,
      },
    });
  } catch (err) {
    const message =
      err instanceof AiScreeningUnavailableError
        ? "Chưa cấu hình ANTHROPIC_API_KEY hoặc GEMINI_API_KEY trên server nên không thể phân tích AI. Xem hướng dẫn thêm API key trong tài liệu triển khai."
        : err instanceof Error
          ? err.message
          : "Lỗi không xác định khi phân tích AI.";

    await prisma.application.update({
      where: { id: applicationId },
      data: { aiStatus: "ERROR", aiScore: null, aiSummary: message, aiAnalyzedAt: new Date() },
    });
  }
}
