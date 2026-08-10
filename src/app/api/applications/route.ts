import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { randomUUID } from "crypto";
import path from "path";
import { saveUploadedFile, UploadStorageConfigurationError } from "@/lib/upload-storage";

const ALLOWED_EXT = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobId = req.nextUrl.searchParams.get("jobId");
  const applications = await prisma.application.findMany({
    where: jobId ? { jobId } : undefined,
    include: { job: { select: { title: true, location: true, level: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(applications);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const jobId = formData.get("jobId")?.toString();
    const fullName = formData.get("fullName")?.toString();
    const email = formData.get("email")?.toString();
    const phone = formData.get("phone")?.toString();
    const dateOfBirthRaw = formData.get("dateOfBirth")?.toString();
    const education = formData.get("education")?.toString();
    const experienceYearsRaw = formData.get("experienceYears")?.toString();
    const fieldOfExpertise = formData.get("fieldOfExpertise")?.toString();
    const coverLetter = formData.get("coverLetter")?.toString() || null;
    const cv = formData.get("cv") as File | null;

    if (
      !jobId ||
      !fullName ||
      !email ||
      !phone ||
      !dateOfBirthRaw ||
      !education ||
      !experienceYearsRaw ||
      !fieldOfExpertise ||
      !cv
    ) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin bắt buộc." }, { status: 400 });
    }

    const dateOfBirth = new Date(dateOfBirthRaw);
    if (Number.isNaN(dateOfBirth.getTime())) {
      return NextResponse.json({ error: "Ngày sinh không hợp lệ." }, { status: 400 });
    }

    const experienceYears = Number(experienceYearsRaw);
    if (!Number.isFinite(experienceYears) || experienceYears < 0) {
      return NextResponse.json({ error: "Số năm kinh nghiệm không hợp lệ." }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: "Vị trí tuyển dụng không tồn tại." }, { status: 404 });
    }

    const ext = path.extname(cv.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận file PDF, DOC hoặc DOCX." },
        { status: 400 }
      );
    }
    if (cv.size > MAX_SIZE) {
      return NextResponse.json({ error: "File CV vượt quá 5MB." }, { status: 400 });
    }

    const safeFileName = `${randomUUID()}${ext}`;
    const cvFilePath = await saveUploadedFile(cv, safeFileName, { blobFolder: "cv" });

    const application = await prisma.application.create({
      data: {
        jobId,
        fullName,
        email,
        phone,
        dateOfBirth,
        education,
        experienceYears,
        fieldOfExpertise,
        coverLetter,
        cvFileName: cv.name,
        cvFilePath,
      },
    });

    return NextResponse.json({ ok: true, id: application.id }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadStorageConfigurationError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra khi nộp hồ sơ." }, { status: 500 });
  }
}
