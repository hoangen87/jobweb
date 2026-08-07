// Gọi AI để đối chiếu nội dung CV thật với JD và chấm % phù hợp kèm nhận xét
// — đây là vòng phân tích sâu (Hướng 3), chạy SAU vòng lọc nhanh theo dữ
// liệu cấu trúc ở src/lib/screening.ts để tiết kiệm chi phí (chỉ phân tích
// hồ sơ đã "lọt vòng đầu").
//
// Hỗ trợ 2 nhà cung cấp AI, tự động chọn theo biến môi trường có sẵn:
// - ANTHROPIC_API_KEY (Claude, trả phí ~150đ/hồ sơ, cần nạp tối thiểu $5
//   tại console.anthropic.com) — ưu tiên dùng nếu có.
// - GEMINI_API_KEY (Google Gemini, MIỄN PHÍ trong hạn mức ~250 lượt/ngày,
//   lấy tại aistudio.google.com/apikey, không cần thẻ) — dùng khi chưa
//   cấu hình Claude, phù hợp giai đoạn test chưa muốn nạp tiền.
//
// Thêm vào Vercel: Project Settings -> Environment Variables.
// Thêm local: file .env -> ANTHROPIC_API_KEY=... hoặc GEMINI_API_KEY=...

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_CV_CHARS = 6000; // Giới hạn để kiểm soát chi phí/độ trễ mỗi lần gọi.

export class AiScreeningUnavailableError extends Error {}

export type AiScreeningInput = {
  jobTitle: string;
  jobDescription: string;
  jobRequirements: string;
  reqEducationMin?: string | null;
  reqExperienceYearsMin?: number | null;
  reqAgeMin?: number | null;
  reqAgeMax?: number | null;
  reqField?: string | null;
  cvText: string;
};

export type AiScreeningResult = {
  score: number;
  summary: string;
  matchingExperience: string;
  matchingSkills: string;
  gaps: string;
  /** Nhà cung cấp AI đã dùng để phân tích — hiển thị cho admin biết. */
  provider: "claude" | "gemini";
};

function buildPrompt(input: AiScreeningInput): string {
  const cvText = input.cvText.slice(0, MAX_CV_CHARS);

  const requirementLines = [
    input.reqEducationMin ? `- Học vấn tối thiểu: ${input.reqEducationMin}` : null,
    input.reqExperienceYearsMin != null ? `- Kinh nghiệm tối thiểu: ${input.reqExperienceYearsMin} năm` : null,
    input.reqAgeMin != null || input.reqAgeMax != null
      ? `- Độ tuổi: ${input.reqAgeMin ?? "?"}-${input.reqAgeMax ?? "?"} tuổi`
      : null,
    input.reqField ? `- Ngành nghề/chuyên môn: ${input.reqField}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `Bạn là chuyên viên tuyển dụng nhân sự giàu kinh nghiệm tại nhà máy sản xuất. Hãy đối chiếu nội dung CV của ứng viên với mô tả công việc (JD) bên dưới và chấm % mức độ phù hợp tổng thể (0-100), xét cả kinh nghiệm, kỹ năng, học vấn lẫn mức độ liên quan thực tế của công việc đã làm trước đây.

=== MÔ TẢ CÔNG VIỆC: ${input.jobTitle} ===
${input.jobDescription}

=== YÊU CẦU ỨNG VIÊN ===
${input.jobRequirements}
${requirementLines ? `\nYêu cầu cụ thể (dữ liệu có cấu trúc, đã qua vòng lọc sơ bộ):\n${requirementLines}` : ""}

=== NỘI DUNG CV ỨNG VIÊN (trích xuất tự động từ file, có thể lỗi định dạng/thiếu dấu) ===
${cvText}

Chỉ trả lời bằng JSON hợp lệ duy nhất, không kèm bất kỳ văn bản nào khác ngoài JSON, đúng cấu trúc:
{"score": <số nguyên 0-100>, "matchingExperience": "<kinh nghiệm phù hợp, tiếng Việt>", "matchingSkills": "<kỹ năng phù hợp, tiếng Việt>", "gaps": "<điểm còn thiếu hoặc chưa có bằng chứng, tiếng Việt>", "summary": "<nhận xét tổng hợp 3-5 câu bằng tiếng Việt>"}

Không được suy đoán thông tin không có trong CV. Kết quả chỉ hỗ trợ HR sàng lọc, không được tự động đưa ra quyết định tuyển dụng.`;
}

function parseAiJson(raw: string): Omit<AiScreeningResult, "provider"> {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI không trả về đúng định dạng JSON như yêu cầu.");
  }

  let parsed: {
    score?: unknown;
    summary?: unknown;
    matchingExperience?: unknown;
    matchingSkills?: unknown;
    gaps?: unknown;
  };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Không phân tích được JSON do AI trả về.");
  }

  const score = Math.round(Number(parsed.score));
  const summary = String(parsed.summary ?? "").trim();
  const matchingExperience = String(parsed.matchingExperience ?? "").trim();
  const matchingSkills = String(parsed.matchingSkills ?? "").trim();
  const gaps = String(parsed.gaps ?? "").trim();

  if (!Number.isFinite(score) || !summary || !matchingExperience || !matchingSkills || !gaps) {
    throw new Error("AI trả về dữ liệu không hợp lệ hoặc thiếu các trường đánh giá.");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    summary,
    matchingExperience,
    matchingSkills,
    gaps,
  };
}

async function analyzeWithClaude(input: AiScreeningInput, apiKey: string): Promise<AiScreeningResult> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 700,
      messages: [{ role: "user", content: buildPrompt(input) }],
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gọi Claude API thất bại (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw: string = data?.content?.[0]?.text ?? "";
  return { ...parseAiJson(raw), provider: "claude" };
}

async function analyzeWithGemini(input: AiScreeningInput, apiKey: string): Promise<AiScreeningResult> {
  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(input) }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gọi Gemini API thất bại (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { ...parseAiJson(raw), provider: "gemini" };
}

/**
 * Ưu tiên Gemini theo luồng đánh giá hồ sơ của trang quản trị. Claude chỉ là
 * phương án dự phòng để không làm gián đoạn hệ thống cũ.
 */
export async function analyzeApplicationWithAI(input: AiScreeningInput): Promise<AiScreeningResult> {
  const geminiKey = await getGeminiApiKey();
  if (geminiKey) {
    return analyzeWithGemini(input, geminiKey);
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return analyzeWithClaude(input, anthropicKey);
  }

  throw new AiScreeningUnavailableError(
    "Chưa cấu hình ANTHROPIC_API_KEY hoặc GEMINI_API_KEY trên server."
  );
}
import { getGeminiApiKey } from "./secure-settings";
