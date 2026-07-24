import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAiAnalysisForApplication } from "@/lib/run-ai-analysis";

// Admin bấm "Phân tích lại bằng AI" — luôn chạy AI (force = true) bất kể kết
// quả lọc vòng đầu, dùng khi muốn xem đánh giá chi tiết cho 1 hồ sơ cụ thể
// hoặc thử lại sau khi phân tích trước đó bị lỗi.
export const maxDuration = 60;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await runAiAnalysisForApplication(params.id, _req.nextUrl.origin, true);
  } catch (err) {
    console.error("[ai-analyze]", err);
    return NextResponse.json({ error: "Không thể chạy phân tích AI." }, { status: 500 });
  }

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    select: { id: true, aiScore: true, aiSummary: true, aiStatus: true, aiAnalyzedAt: true },
  });

  return NextResponse.json(application);
}
