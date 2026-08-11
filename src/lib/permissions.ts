export const USER_ROLES = ["SUPER_ADMIN", "MANAGER", "HR_ADMIN", "HR_USER", "VIEWER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type Permission =
  | "JOBS_MANAGE"
  | "APPLICATIONS_VIEW"
  | "APPLICATIONS_MANAGE"
  | "AI_EVALUATE"
  | "AI_CONFIGURE"
  | "EXPORT_RESULTS"
  | "USERS_MANAGE";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  MANAGER: "Manager",
  HR_ADMIN: "HR Admin",
  HR_USER: "HR User",
  VIEWER: "Viewer",
};

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: ["JOBS_MANAGE", "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "AI_EVALUATE", "AI_CONFIGURE", "EXPORT_RESULTS", "USERS_MANAGE"],
  MANAGER: ["JOBS_MANAGE", "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "AI_EVALUATE", "EXPORT_RESULTS"],
  HR_ADMIN: ["JOBS_MANAGE", "APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "AI_EVALUATE", "EXPORT_RESULTS"],
  HR_USER: ["APPLICATIONS_VIEW", "APPLICATIONS_MANAGE", "AI_EVALUATE", "EXPORT_RESULTS"],
  VIEWER: ["APPLICATIONS_VIEW", "EXPORT_RESULTS"],
};

export function normalizeRole(role?: string | null): UserRole {
  return USER_ROLES.includes(role as UserRole) ? (role as UserRole) : "VIEWER";
}

export function hasPermission(role: string | null | undefined, permission: Permission) {
  return ROLE_PERMISSIONS[normalizeRole(role)].includes(permission);
}

export function permissionsForRole(role: string | null | undefined) {
  return ROLE_PERMISSIONS[normalizeRole(role)];
}
