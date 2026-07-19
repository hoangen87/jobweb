import { TRANSLATE_LANG_CODE, type Locale } from "@/i18n/routing";

// Dịch tự động nội dung tin tuyển dụng bằng MyMemory Translation API (miễn phí,
// không cần API key). Nếu dịch lỗi (mất mạng, vượt hạn mức...), trả về nguyên
// văn tiếng Việt để không chặn việc đăng/sửa tin.

const MAX_CHUNK_LENGTH = 480; // MyMemory giới hạn ~500 ký tự / request khi không có "de" param
const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";

function splitIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHUNK_LENGTH) return [text];

  const chunks: string[] = [];
  const paragraphs = text.split(/\n+/);

  let current = "";
  for (const paragraph of paragraphs) {
    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      if ((current + " " + sentence).trim().length > MAX_CHUNK_LENGTH) {
        if (current.trim()) chunks.push(current.trim());
        current = sentence;
        // Nếu 1 câu vẫn quá dài, cắt cứng theo ký tự.
        while (current.length > MAX_CHUNK_LENGTH) {
          chunks.push(current.slice(0, MAX_CHUNK_LENGTH));
          current = current.slice(MAX_CHUNK_LENGTH);
        }
      } else {
        current = (current + " " + sentence).trim();
      }
    }
    current += "\n";
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.length > 0 ? chunks : [text];
}

async function translateChunk(text: string, targetLang: string): Promise<string> {
  if (!text.trim()) return text;

  const url = `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=vi|${targetLang}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);

  const data = await res.json();
  const translated = data?.responseData?.translatedText;

  if (!translated || typeof translated !== "string") {
    throw new Error("MyMemory: no translation returned");
  }
  // MyMemory trả lỗi hạn mức dưới dạng chuỗi văn bản thường (không phải HTTP error).
  if (translated.toUpperCase().includes("MYMEMORY WARNING")) {
    throw new Error("MyMemory: quota warning");
  }

  return translated;
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text;

  try {
    const chunks = splitIntoChunks(text);
    const translatedChunks: string[] = [];
    // Dịch tuần tự để tránh vượt rate-limit của API miễn phí.
    for (const chunk of chunks) {
      translatedChunks.push(await translateChunk(chunk, targetLang));
    }
    return translatedChunks.join("\n");
  } catch (err) {
    console.error(`[translate] Failed to translate to ${targetLang}:`, err);
    return text; // fallback: giữ nguyên tiếng Việt
  }
}

export type JobTranslatable = {
  title: string;
  department: string;
  location: string;
  type: string;
  level?: string | null;
  description: string;
  requirements: string;
  benefits?: string | null;
};

export type JobTranslations = Partial<Record<Exclude<Locale, "vi">, JobTranslatable>>;

const TARGET_LOCALES: Exclude<Locale, "vi">[] = ["en", "zh"];

export async function translateJobFields(job: JobTranslatable): Promise<JobTranslations> {
  const result: JobTranslations = {};

  await Promise.all(
    TARGET_LOCALES.map(async (locale) => {
      const targetLang = TRANSLATE_LANG_CODE[locale];
      try {
        const [title, department, location, type, level, description, requirements, benefits] =
          await Promise.all([
            translateText(job.title, targetLang),
            translateText(job.department, targetLang),
            translateText(job.location, targetLang),
            translateText(job.type, targetLang),
            job.level ? translateText(job.level, targetLang) : Promise.resolve(job.level ?? null),
            translateText(job.description, targetLang),
            translateText(job.requirements, targetLang),
            job.benefits
              ? translateText(job.benefits, targetLang)
              : Promise.resolve(job.benefits ?? null),
          ]);

        result[locale] = { title, department, location, type, level, description, requirements, benefits };
      } catch (err) {
        console.error(`[translate] Failed job translation for locale ${locale}:`, err);
        result[locale] = { ...job };
      }
    })
  );

  return result;
}
