import { getActiveGeminiConfiguration } from "./secure-settings";
import { AI_LANGUAGE_NAMES, normalizeAdminLocale, type AdminLocale } from "./admin-i18n";

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const MAX_CV_CHARS = 6000;

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
  locale?: AdminLocale;
};

export type AiScreeningResult = {
  score: number;
  summary: string;
  matchingExperience: string;
  matchingSkills: string;
  gaps: string;
  provider: "claude" | "gemini";
};

function localizedSystemInstruction(locale: AdminLocale) {
  if (locale === "en") return "Write all human-readable evaluation text in English.";
  if (locale === "zh-TW") return "請將所有可讀的評估文字完整使用繁體中文撰寫，禁止使用簡體中文。";
  return "Viết toàn bộ nội dung đánh giá có thể đọc được bằng tiếng Việt.";
}

function buildPrompt(input: AiScreeningInput): string {
  const cvText = input.cvText.slice(0, MAX_CV_CHARS);
  const locale = normalizeAdminLocale(input.locale);
  const language = AI_LANGUAGE_NAMES[locale];
  const requirementLines = [
    input.reqEducationMin ? `- Minimum education: ${input.reqEducationMin}` : null,
    input.reqExperienceYearsMin != null ? `- Minimum experience: ${input.reqExperienceYearsMin} years` : null,
    input.reqAgeMin != null || input.reqAgeMax != null ? `- Age range: ${input.reqAgeMin ?? "?"}-${input.reqAgeMax ?? "?"}` : null,
    input.reqField ? `- Required field/expertise: ${input.reqField}` : null,
  ].filter(Boolean).join("\n");

  return `You are an experienced recruitment specialist for a manufacturing company. Compare the candidate CV with the Job Detail and score overall fit from 0 to 100 based on relevant experience, skills, education and actual similarity of prior work.

OUTPUT LANGUAGE: ${language}
${localizedSystemInstruction(locale)}
Keep JSON property names exactly as specified below. Only translate the string values.

=== JOB DETAIL: ${input.jobTitle} ===
${input.jobDescription}

=== CANDIDATE REQUIREMENTS ===
${input.jobRequirements}
${requirementLines ? `\nStructured requirements:\n${requirementLines}` : ""}

=== CANDIDATE CV TEXT ===
${cvText}

Return exactly one valid JSON object and no other text:
{"score": <integer 0-100>, "matchingExperience": "<relevant matching experience in ${language}>", "matchingSkills": "<relevant matching skills in ${language}>", "gaps": "<missing points or evidence gaps in ${language}>", "summary": "<3-5 sentence overall assessment in ${language}>"}

Do not invent information not present in the CV. The result is only decision support for HR and must not make an automatic hiring decision.`;
}

function parseAiJson(raw: string): Omit<AiScreeningResult, "provider"> {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON.");
  let parsed: { score?: unknown; summary?: unknown; matchingExperience?: unknown; matchingSkills?: unknown; gaps?: unknown };
  try { parsed = JSON.parse(jsonMatch[0]); } catch { throw new Error("Could not parse AI JSON response."); }
  const score = Math.round(Number(parsed.score));
  const summary = String(parsed.summary ?? "").trim();
  const matchingExperience = String(parsed.matchingExperience ?? "").trim();
  const matchingSkills = String(parsed.matchingSkills ?? "").trim();
  const gaps = String(parsed.gaps ?? "").trim();
  if (!Number.isFinite(score) || !summary || !matchingExperience || !matchingSkills || !gaps) throw new Error("AI returned incomplete evaluation data.");
  return { score: Math.max(0, Math.min(100, score)), summary, matchingExperience, matchingSkills, gaps };
}

async function analyzeWithClaude(input: AiScreeningInput, apiKey: string): Promise<AiScreeningResult> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 700, messages: [{ role: "user", content: buildPrompt(input) }] }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) { const text = await res.text().catch(() => ""); throw new Error(`Claude API failed (HTTP ${res.status}): ${text.slice(0, 300)}`); }
  const data = await res.json();
  const raw: string = data?.content?.[0]?.text ?? "";
  return { ...parseAiJson(raw), provider: "claude" };
}

async function analyzeWithGemini(input: AiScreeningInput, apiKey: string, model: string): Promise<AiScreeningResult> {
  const res = await fetch(`${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(input) }] }],
      generationConfig: {
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          required: ["score", "matchingExperience", "matchingSkills", "gaps", "summary"],
          properties: {
            score: { type: "INTEGER", minimum: 0, maximum: 100 },
            matchingExperience: { type: "STRING" },
            matchingSkills: { type: "STRING" },
            gaps: { type: "STRING" },
            summary: { type: "STRING" },
          },
        },
      },
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) { const text = await res.text().catch(() => ""); throw new Error(`Gemini API failed (HTTP ${res.status}): ${text.slice(0, 300)}`); }
  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const raw: string = candidate?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? "";
  if (!raw.trim()) {
    const finishReason = candidate?.finishReason || data?.promptFeedback?.blockReason || "unknown";
    throw new Error(`Gemini returned no evaluation content (${finishReason}).`);
  }
  return { ...parseAiJson(raw), provider: "gemini" };
}

export async function analyzeApplicationWithAI(input: AiScreeningInput): Promise<AiScreeningResult> {
  const normalizedInput = { ...input, locale: normalizeAdminLocale(input.locale) };
  const geminiConfig = await getActiveGeminiConfiguration();
  if (geminiConfig) return analyzeWithGemini(normalizedInput, geminiConfig.apiKey, geminiConfig.model);
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) return analyzeWithClaude(normalizedInput, anthropicKey);
  throw new AiScreeningUnavailableError("No AI provider is configured on the server.");
}
