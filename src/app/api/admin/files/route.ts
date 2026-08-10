import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

type AdminFile = {
  fileName: string;
  filePath: string;
};

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  const type = request.nextUrl.searchParams.get("type");

  if (!id || (type !== "cv" && type !== "jd")) {
    return NextResponse.json({ error: "Yêu cầu file không hợp lệ." }, { status: 400 });
  }

  let file: AdminFile | null;
  if (type === "cv") {
    const application = await prisma.application.findUnique({
      where: { id },
      select: { cvFileName: true, cvFilePath: true },
    });
    file = application
      ? { fileName: application.cvFileName, filePath: application.cvFilePath }
      : null;
  } else {
    const jobDescription = await prisma.jobDescription.findUnique({
      where: { id },
      select: { fileName: true, filePath: true },
    });
    file = jobDescription;
  }

  if (!file) return NextResponse.json({ error: "Không tìm thấy file." }, { status: 404 });

  if (file.filePath.startsWith("/")) {
    return NextResponse.redirect(new URL(file.filePath, request.url));
  }

  let blobUrl: URL;
  try {
    blobUrl = new URL(file.filePath);
  } catch {
    return NextResponse.json({ error: "Đường dẫn file không hợp lệ." }, { status: 400 });
  }

  if (blobUrl.protocol !== "https:" || !blobUrl.hostname.endsWith(".blob.vercel-storage.com")) {
    return NextResponse.json({ error: "Đường dẫn file không hợp lệ." }, { status: 400 });
  }

  const access = blobUrl.hostname.includes(".public.blob.vercel-storage.com") ? "public" : "private";
  const result = await get(file.filePath, { access });
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "Không tìm thấy file." }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
      "Content-Type": result.blob.contentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
