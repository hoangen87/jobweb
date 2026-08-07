import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractDocumentText } from "@/lib/document-extract";

export const maxDuration = 60;

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function saveJdFile(file: File, safeFileName: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`jd/${safeFileName}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "jd");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, safeFileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/jd/${safeFileName}`;
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.jobDescription.findMany({
    select: {
      id: true,
      title: true,
      department: true,
      version: true,
      fileName: true,
      filePath: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title")?.toString().trim();
    const department = formData.get("department")?.toString().trim();

    if (!file || !title || !department) {
      return NextResponse.json({ error: "Vui lòng nhập tên vị trí, phòng ban và chọn file JD." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "JD chỉ hỗ trợ PDF, DOCX hoặc TXT." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File JD không được vượt quá 10 MB." }, { status: 400 });
    }

    const content = await extractDocumentText(file);
    const safeFileName = `${randomUUID()}${ext}`;
    const filePath = await saveJdFile(file, safeFileName);
    const document = await prisma.jobDescription.create({
      data: { title, department, fileName: file.name, filePath, content },
      select: {
        id: true,
        title: true,
        department: true,
        version: true,
        fileName: true,
        filePath: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải JD.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
