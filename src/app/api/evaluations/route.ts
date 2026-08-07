import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobDescriptionId = req.nextUrl.searchParams.get("jobDescriptionId");
  if (!jobDescriptionId) {
    return NextResponse.json({ error: "Thiếu jobDescriptionId." }, { status: 400 });
  }

  const results = await prisma.applicationEvaluation.findMany({
    where: { jobDescriptionId },
    include: { application: { select: { fullName: true } } },
    orderBy: [{ rank: "asc" }, { score: "desc" }],
  });
  return NextResponse.json(results);
}
