import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionCookieName, verifySessionToken } from "@/lib/session";
import { hasPermission, normalizeRole, type Permission } from "@/lib/permissions";

export { createSessionToken, getSessionCookieName, verifySessionToken } from "@/lib/session";

export async function getCurrentAdminUser() {
  const store = cookies();
  const token = store.get(getSessionCookieName())?.value;
  const username = await verifySessionToken(token);
  if (!username) return null;

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !admin.isActive) return null;

  return { ...admin, role: normalizeRole(admin.role) };
}

export async function getCurrentAdmin(): Promise<string | null> {
  const admin = await getCurrentAdminUser();
  return admin?.username ?? null;
}

export async function currentAdminHasPermission(permission: Permission) {
  const admin = await getCurrentAdminUser();
  return !!admin && hasPermission(admin.role, permission);
}
