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

// Dịch 1 đoạn text (có thể nhiều chunk). Ném lỗi nếu bất kỳ chunk nào thất bại,
// để phía gọi (translateJobFields) quyết định fallback + đánh dấu cảnh báo.
async function translateChunkedText(text: string, targetLang: string): Promise<string> {
  const chunks = splitIntoChunks(text);
  const translatedChunks: string[] = [];
  // Dịch tuần tự để tránh vượt rate-limit của API miễn phí.
  for (const chunk of chunks) {
    translatedChunks.push(await translateChunk(chunk, targetLang));
  }
  return translatedChunks.join("\n");
}

/**
 * Dịch 1 chuỗi văn bản, luôn trả về kết quả (không ném lỗi). Nếu dịch thất
 * bại thì trả về nguyên văn gốc. Dùng cho các trường hợp không cần theo dõi
 * trạng thái thành công/thất bại chi tiết.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text;

  try {
    return await translateChunkedText(text, targetLang);
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

export type JobTranslationResult = {
  translations: JobTranslations;
  /** Các ngôn ngữ dịch bị lỗi ít nhất 1 trường (đã fallback về tiếng Việt cho trường đó). */
  failedLocales: Exclude<Locale, "vi">[];
};

const TARGET_LOCALES: Exclude<Locale, "vi">[] = ["en", "zh"];

export async function translateJobFields(job: JobTranslatable): Promise<JobTranslationResult> {
  const result: JobTranslations = {};
  const failedLocales: Exclude<Locale, "vi">[] = [];

  // Giữ 2 ngôn ngữ (en, zh) dịch song song — chỉ 2x số request cùng lúc, chấp
  // nhận được. Nhưng BÊN TRONG mỗi ngôn ngữ, dịch tuần tự từng trường thay vì
  // Promise.all cả 8 trường cùng lúc, để giảm nguy cơ bị MyMemory rate-limit.
  await Promise.all(
    TARGET_LOCALES.map(async (locale) => {
      const targetLang = TRANSLATE_LANG_CODE[locale];
      let hasFailure = false;

      async function translateField(text: string | null | undefined): Promise<string | null> {
        if (!text || !text.trim()) return text ?? null;
        try {
          return await translateChunkedText(text, targetLang);
        } catch (err) {
          hasFailure = true;
          console.error(`[translate] Failed field (locale ${locale}):`, err);
          return text; // fallback: giữ nguyên văn gốc cho riêng trường này
        }
      }

      const title = (await translateField(job.title)) ?? job.title;
      const department = (await translateField(job.department)) ?? job.department;
      const location = (await translateField(job.location)) ?? job.location;
      const type = (await translateField(job.type)) ?? job.type;
      const level = await translateField(job.level);
      const description = (await translateField(job.description)) ?? job.description;
      const requirements = (await translateField(job.requirements)) ?? job.requirements;
      const benefits = await translateField(job.benefits);

      result[locale] = { title, department, location, type, level, description, requirements, benefits };
      if (hasFailure) failedLocales.push(locale);
    })
  );

  return { translations: result, failedLocales };
}
