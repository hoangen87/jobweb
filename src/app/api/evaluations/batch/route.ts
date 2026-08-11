import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractCvText } from "@/lib/cv-extract";
import { analyzeApplicationWithAI } from "@/lib/ai-screening";
import { normalizeAdminLocale } from "@/lib/admin-i18n";

export const maxDuration = 300;

const requestSchema = z.object({
  jobDescriptionId: z.string().min(1),
  applicationIds: z.array(z.string().min(1)).min(1).max(50),
  locale: z.enum(["vi", "en", "zh-TW"]).optional(),
});

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid evaluation request." }, { status: 400 });

  const { jobDescriptionId, applicationIds } = parsed.data;
  const locale = normalizeAdminLocale(parsed.data.locale);
  const [jd, applications] = await Promise.all([
    prisma.jobDescription.findUnique({ where: { id: jobDescriptionId } }),
    prisma.application.findMany({ where: { id: { in: applicationIds } }, include: { job: true } }),
  ]);
  if (!jd) return NextResponse.json({ error: "Job Detail not found." }, { status: 404 });
  if (applications.length !== new Set(applicationIds).size) return NextResponse.json({ error: "One or more applications no longer exist." }, { status: 404 });

  const completed: Array<{ applicationId: string; fullName: string; score: number; matchingExperience: string; matchingSkills: string; gaps: string; aiComment: string }> = [];
  const errors: Array<{ applicationId: string; fullName: string; error: string }> = [];

  for (const application of applications) {
    try {
      const extracted = await extractCvText(application.cvFilePath, req.nextUrl.origin);
      if ("error" in extracted) throw new Error(extracted.error);

      const result = await analyzeApplicationWithAI({
        jobTitle: jd.title,
        jobDescription: jd.content,
        jobRequirements: `Department: ${jd.department}. Job Detail version: ${jd.version}.`,
        cvText: extracted.text,
        locale,
      });

      await prisma.applicationEvaluation.upsert({
        where: { applicationId_jobDescriptionId: { applicationId: application.id, jobDescriptionId: jd.id } },
        create: {
          applicationId: application.id,
          jobDescriptionId: jd.id,
          jdVersion: jd.version,
          score: result.score,
          matchingExperience: result.matchingExperience,
          matchingSkills: result.matchingSkills,
          gaps: result.gaps,
          aiComment: result.summary,
          provider: result.provider,
        },
        update: {
          jdVersion: jd.version,
          score: result.score,
          matchingExperience: result.matchingExperience,
          matchingSkills: result.matchingSkills,
          gaps: result.gaps,
          aiComment: result.summary,
          provider: result.provider,
        },
      });

      await prisma.application.update({
        where: { id: application.id },
        data: {
          aiJobDescriptionId: jd.id,
          aiScore: result.score,
          aiSummary: `[${result.provider} · ${jd.title} v${jd.version} · ${locale}] ${result.summary}`,
          aiStatus: "DONE",
          aiAnalyzedAt: new Date(),
        },
      });

      completed.push({
        applicationId: application.id,
        fullName: application.fullName,
        score: result.score,
        matchingExperience: result.matchingExperience,
        matchingSkills: result.matchingSkills,
        gaps: result.gaps,
        aiComment: result.summary,
      });
    } catch (error) {
      errors.push({ applicationId: application.id, fullName: application.fullName, error: error instanceof Error ? error.message : "Evaluation failed." });
    }
  }

  const allResultsForJd = await prisma.applicationEvaluation.findMany({
    where: { jobDescriptionId: jd.id },
    include: { application: { select: { fullName: true } } },
    orderBy: [{ score: "desc" }, { updatedAt: "asc" }],
  });
  await Promise.all(allResultsForJd.map((item, index) => prisma.applicationEvaluation.update({ where: { id: item.id }, data: { rank: index + 1 } })));
  const rankByApplication = new Map(allResultsForJd.map((item, index) => [item.applicationId, index + 1]));
  completed.sort((a, b) => (rankByApplication.get(a.applicationId) ?? Number.MAX_SAFE_INTEGER) - (rankByApplication.get(b.applicationId) ?? Number.MAX_SAFE_INTEGER));

  return NextResponse.json({
    locale,
    jobDescription: { id: jd.id, title: jd.title, department: jd.department, version: jd.version, updatedAt: jd.updatedAt },
    results: completed.map((item) => ({ ...item, rank: rankByApplication.get(item.applicationId) ?? null })),
    errors,
  });
}
