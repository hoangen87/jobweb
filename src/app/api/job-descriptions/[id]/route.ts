import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractDocumentText } from "@/lib/document-extract";

export const maxDuration = 60;

async function saveJdFile(file: File, safeFileName: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`jd/${safeFileName}`, file, { access: "public", addRandomSuffix: false });
    return blob.url;
  }
  const uploadDir = path.join(process.cwd(), "public", "uploads", "jd");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, safeFileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/jd/${safeFileName}`;
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const current = await prisma.jobDescription.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: "Không tìm thấy Job Detail." }, { status: 404 });

    // Xóa Job Detail sẽ cascade xóa luôn các ApplicationEvaluation liên quan (đã khai
    // onDelete: Cascade trong schema), và gỡ liên kết aiJobDescriptionId khỏi
    // các Application đã dùng Job Detail này để chấm (onDelete: SetNull) — không xóa hồ sơ ứng viên.
    await prisma.jobDescription.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể xóa Job Detail." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const current = await prisma.jobDescription.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: "Không tìm thấy Job Detail." }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title")?.toString().trim();
    const department = formData.get("department")?.toString().trim();
    if (!file || !title || !department) {
      return NextResponse.json({ error: "Vui lòng nhập đủ thông tin và chọn file Job Detail thay thế." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (![".pdf", ".docx", ".txt"].includes(ext)) {
      return NextResponse.json({ error: "Job Detail chỉ hỗ trợ PDF, DOCX hoặc TXT." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File Job Detail không được vượt quá 10 MB." }, { status: 400 });
    }

    const content = await extractDocumentText(file);
    const filePath = await saveJdFile(file, `${randomUUID()}${ext}`);
    const updated = await prisma.jobDescription.update({
      where: { id: params.id },
      data: {
        title,
        department,
        fileName: file.name,
        filePath,
        content,
        version: { increment: 1 },
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể cập nhật Job Detail." },
      { status: 500 }
    );
  }
}
