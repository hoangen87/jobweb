import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import UsersManager from "@/components/admin/UsersManager";

export default async function UsersPage() {
  const current = await getCurrentAdminUser();
  if (!current) redirect("/admin/login");
  if (!hasPermission(current.role, "USERS_MANAGE")) redirect("/admin");

  const users = await prisma.admin.findMany({
    select: { id: true, username: true, displayName: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    orderBy: [{ isActive: "desc" }, { username: "asc" }],
  });

  return (
    <section className="container-page py-10">
      <div className="mb-6">
        <p className="kicker">Quản trị hệ thống</p>
        <h1 className="mt-2 text-3xl font-bold">Người dùng & Phân quyền</h1>
        <p className="mt-2 max-w-4xl text-sm text-[var(--color-muted)]">
          Tạo tài khoản, gán vai trò, khóa/mở người dùng và đặt lại mật khẩu. Chỉ Super Admin được truy cập khu vực này.
        </p>
      </div>
      <UsersManager initialUsers={JSON.parse(JSON.stringify(users))} currentUserId={current.id} />
    </section>
  );
}
