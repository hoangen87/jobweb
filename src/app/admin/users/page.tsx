import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import UsersManager from "@/components/admin/UsersManager";
import { normalizeAdminLocale } from "@/lib/admin-i18n";
import { adminT } from "@/lib/admin-translations";

export default async function UsersPage() {
  const current = await getCurrentAdminUser();
  if (!current) redirect("/admin/login");
  if (!hasPermission(current.role, "USERS_MANAGE")) redirect("/admin");
  const locale = normalizeAdminLocale(cookies().get("admin-locale")?.value);
  const users = await prisma.admin.findMany({ select: { id: true, username: true, displayName: true, role: true, isActive: true, createdAt: true, updatedAt: true }, orderBy: [{ isActive: "desc" }, { username: "asc" }] });
  return <section className="container-page py-10"><div className="mb-6"><p className="kicker">Admin</p><h1 className="mt-2 text-3xl font-bold">{adminT(locale, "usersTitle")}</h1><p className="mt-2 max-w-4xl text-sm text-[var(--color-muted)]">{adminT(locale, "usersDesc")}</p></div><UsersManager locale={locale} initialUsers={JSON.parse(JSON.stringify(users))} currentUserId={current.id} /></section>;
}
