import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { z } from "zod";

const jobUpdateSchema = z.object({
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
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = jobUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { deadline, ...rest } = parsed.data;
  const job = await prisma.job.update({
    where: { id: params.id },
    data: {
      ...rest,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
