import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission, USER_ROLES } from "@/lib/permissions";

const createSchema = z.object({
  username: z.string().trim().min(3).max(50),
  displayName: z.string().trim().max(100).optional().nullable(),
  password: z.string().min(8).max(100),
  role: z.enum(USER_ROLES),
});

async function authorized() {
  const current = await getCurrentAdminUser();
  return current && hasPermission(current.role, "USERS_MANAGE") ? current : null;
}

export async function GET() {
  const current = await authorized();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.admin.findMany({
    select: { id: true, username: true, displayName: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    orderBy: [{ isActive: "desc" }, { username: "asc" }],
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const current = await authorized();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Thông tin tài khoản chưa hợp lệ." }, { status: 400 });

  const exists = await prisma.admin.findUnique({ where: { username: parsed.data.username } });
  if (exists) return NextResponse.json({ error: "Tên đăng nhập đã tồn tại." }, { status: 409 });

  const user = await prisma.admin.create({
    data: {
      username: parsed.data.username,
      displayName: parsed.data.displayName || null,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: parsed.data.role,
      isActive: true,
    },
    select: { id: true, username: true, displayName: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
