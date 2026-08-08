import path from "path";

export async function extractDocumentText(file: File): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === ".pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    const text = data.text.trim();
    if (!text) throw new Error("Không đọc được nội dung PDF. File có thể là bản scan ảnh.");
    return text;
  }

  if (ext === ".docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    if (!text) throw new Error("Không đọc được nội dung DOCX.");
    return text;
  }

  if (ext === ".txt") {
    const text = buffer.toString("utf8").trim();
    if (!text) throw new Error("File TXT không có nội dung.");
    return text;
  }

  throw new Error("Chỉ hỗ trợ Job Detail dạng PDF, DOCX hoặc TXT.");
}
