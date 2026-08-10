import { get } from "@vercel/blob";
import path from "path";

// Trích xuất nội dung text từ file CV đã nộp (PDF hoặc DOCX) để đưa vào phân
// tích AI. File .doc (định dạng Word cũ, nhị phân) chưa có thư viện thuần
// JS nào đọc được ổn định trên môi trường serverless (Vercel) — trường hợp
// này trả về lỗi rõ ràng để hệ thống bỏ qua phân tích AI, hồ sơ vẫn xem/tải
// CV bình thường qua đường dẫn gốc, chỉ không chấm được điểm AI.

export type CvExtractResult = { text: string } | { error: string };

async function fetchCvBuffer(cvFilePath: string, origin: string): Promise<Buffer> {
  if (cvFilePath.startsWith("http")) {
    const blobUrl = new URL(cvFilePath);
    if (blobUrl.hostname.endsWith(".blob.vercel-storage.com")) {
      const access = blobUrl.hostname.includes(".public.blob.vercel-storage.com") ? "public" : "private";
      const result = await get(cvFilePath, { access });
      if (!result || result.statusCode !== 200 || !result.stream) {
        throw new Error("Không tải được file CV từ kho lưu trữ để đọc nội dung.");
      }
      return Buffer.from(await new Response(result.stream).arrayBuffer());
    }
  }

  const url = cvFilePath.startsWith("http") ? cvFilePath : `${origin}${cvFilePath}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) {
    throw new Error(`Không tải được file CV để đọc nội dung (HTTP ${res.status}).`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function extractCvText(cvFilePath: string, origin: string): Promise<CvExtractResult> {
  const pathname = cvFilePath.startsWith("http") ? new URL(cvFilePath).pathname : cvFilePath;
  const ext = path.extname(pathname).toLowerCase();

  try {
    if (ext === ".pdf") {
      const buffer = await fetchCvBuffer(cvFilePath, origin);
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      const text = data.text.trim();
      if (!text) return { error: "Không trích xuất được nội dung từ file PDF (có thể là bản scan ảnh)." };
      return { text };
    }

    if (ext === ".docx") {
      const buffer = await fetchCvBuffer(cvFilePath, origin);
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value.trim();
      if (!text) return { error: "Không trích xuất được nội dung từ file DOCX." };
      return { text };
    }

    return {
      error:
        "File CV định dạng .doc (Word cũ) — hệ thống chưa đọc tự động được định dạng này để phân tích AI. Chấm điểm cấu trúc (học vấn/kinh nghiệm/tuổi/ngành nghề) vẫn hoạt động bình thường; nếu cần điểm AI, yêu cầu ứng viên nộp lại CV dạng PDF hoặc DOCX.",
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Không đọc được nội dung CV." };
  }
}
