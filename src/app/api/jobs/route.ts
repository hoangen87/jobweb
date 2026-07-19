import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { translateJobFields } from "@/lib/translate";
import { z } from "zod";

// Cho phép nhiều thời gian hơn vì dịch tự động EN/ZH có thể mất vài giây.
export const maxDuration = 60;

const jobSchema = z.object({
  title: z.string().min(3),
  department: z.string().min(1),
  location: z.string().min(1),
  type: z.string().min(1),
  level: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  salaryMin: z.coerce.number().int().optional().nullable(),
  salaryMax: z.coerce.number().int().optional().nullable(),
  description: z.string().min(10),
  requirements: z.string().min(10),
  benefits: z.string().optional(),
  deadline: z.string().optional().nullable(),
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
  reqEducationMin: z.string().optional(),
  reqExperienceYearsMin: z.coerce.number().int().min(0).optional().nullable(),
  reqAgeMin: z.coerce.number().int().min(0).optional().nullable(),
  reqAgeMax: z.coerce.number().int().min(0).optional().nullable(),
  reqField: z.string().optional(),
});

export async function GET() {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { deadline, ...rest } = parsed.data;

  const { translations, failedLocales } = await translateJobFields({
    title: rest.title,
    department: rest.department,
    location: rest.location,
    type: rest.type,
    level: rest.level,
    description: rest.description,
    requirements: rest.requirements,
    benefits: rest.benefits,
  });

  const job = await prisma.job.create({
    data: {
      ...rest,
      translations,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  return NextResponse.json(
    { ...job, translationWarning: failedLocales.length > 0 ? failedLocales : null },
    { status: 201 }
  );
}
