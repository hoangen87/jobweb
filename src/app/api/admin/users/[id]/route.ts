import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission, USER_ROLES } from "@/lib/permissions";

const updateSchema = z.object({
  displayName: z.string().trim().max(100).optional().nullable(),
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(100).optional(),
});

async function authorized() {
  const current = await getCurrentAdminUser();
  return current && hasPermission(current.role, "USERS_MANAGE") ? current : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const current = await authorized();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const target = await prisma.admin.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu cập nhật chưa hợp lệ." }, { status: 400 });

  if (target.id === current.id && parsed.data.isActive === false) {
    return NextResponse.json({ error: "Không thể tự khóa tài khoản đang đăng nhập." }, { status: 400 });
  }
  if (target.id === current.id && parsed.data.role && parsed.data.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Không thể tự hạ quyền Super Admin của tài khoản đang đăng nhập." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.displayName !== undefined) data.displayName = parsed.data.displayName || null;
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;
  if (parsed.data.password) data.passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.admin.update({
    where: { id: params.id },
    data,
    select: { id: true, username: true, displayName: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const current = await authorized();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (params.id === current.id) {
    return NextResponse.json({ error: "Không thể tự xóa tài khoản đang đăng nhập." }, { status: 400 });
  }

  const target = await prisma.admin.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
  await prisma.admin.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
