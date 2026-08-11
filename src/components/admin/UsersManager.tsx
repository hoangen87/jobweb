"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABELS, USER_ROLES, permissionsForRole, type UserRole } from "@/lib/permissions";

type UserRow = {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const PERMISSION_LABELS: Record<string, string> = {
  JOBS_MANAGE: "Quản lý tin tuyển dụng",
  APPLICATIONS_VIEW: "Xem hồ sơ",
  APPLICATIONS_MANAGE: "Xử lý hồ sơ",
  AI_EVALUATE: "Đánh giá AI",
  AI_CONFIGURE: "Cấu hình AI",
  EXPORT_RESULTS: "Xuất kết quả",
  USERS_MANAGE: "Quản lý người dùng",
};

export default function UsersManager({ initialUsers, currentUserId }: { initialUsers: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: "", displayName: "", password: "", role: "HR_USER" as UserRole });

  const roleSummary = useMemo(() => USER_ROLES.map((role) => ({ role, permissions: permissionsForRole(role) })), []);

  async function createUser() {
    setSaving(true);
    setError("");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) return setError(data.error || "Không thể tạo người dùng.");

    setUsers((current) => [...current, data.user]);
    setForm({ username: "", displayName: "", password: "", role: "HR_USER" });
    setShowCreate(false);
    router.refresh();
  }

  async function patchUser(id: string, patch: Record<string, unknown>) {
    setError("");
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setError(data.error || "Không thể cập nhật người dùng.");

    setUsers((current) => current.map((user) => (user.id === id ? data.user : user)));
    router.refresh();
  }

  async function resetPassword(id: string, username: string) {
    const password = prompt(`Nhập mật khẩu mới cho ${username} (tối thiểu 8 ký tự):`);
    if (!password) return;
    await patchUser(id, { password });
  }

  async function deleteUser(id: string, username: string) {
    if (!confirm(`Xóa tài khoản "${username}"?`)) return;
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setError(data.error || "Không thể xóa người dùng.");
    setUsers((current) => current.filter((user) => user.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" className="btn-primary" onClick={() => setShowCreate((value) => !value)}>
          + Thêm người dùng
        </button>
      </div>

      {showCreate && (
        <div className="rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-5 shadow-sm">
          <h2 className="text-lg font-bold">Tạo tài khoản mới</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Tên đăng nhập</span>
              <input className="input-field" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Họ tên / tên hiển thị</span>
              <input className="input-field" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Mật khẩu ban đầu</span>
              <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Vai trò</span>
              <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                {USER_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn-primary" disabled={saving} onClick={createUser}>{saving ? "Đang tạo..." : "Tạo tài khoản"}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Hủy</button>
          </div>
        </div>
      )}

      {error && <div className="rounded-md border border-[var(--color-error)]/30 bg-red-50 p-3 text-sm text-[var(--color-error)]">{error}</div>}

      <div className="overflow-x-auto rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] shadow-sm">
        <table className="min-w-full divide-y divide-[var(--color-rule)] text-sm">
          <thead className="bg-[var(--color-paper-2)] text-left text-xs font-semibold uppercase text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Quyền chính</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-rule)]">
            {users.map((user) => {
              const role = USER_ROLES.includes(user.role as UserRole) ? (user.role as UserRole) : "VIEWER";
              return (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{user.displayName || user.username}</div>
                    <div className="text-xs text-[var(--color-muted)]">@{user.username}{user.id === currentUserId ? " · Bạn" : ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-md border border-[var(--color-rule)] bg-[var(--color-paper)] px-2 py-1"
                      value={role}
                      disabled={user.id === currentUserId}
                      onChange={(e) => patchUser(user.id, { role: e.target.value })}
                    >
                      {USER_ROLES.map((item) => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={user.id === currentUserId}
                      onClick={() => patchUser(user.id, { isActive: !user.isActive })}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${user.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                    >
                      {user.isActive ? "Đang hoạt động" : "Đã khóa"}
                    </button>
                  </td>
                  <td className="max-w-[360px] px-4 py-3 text-xs text-[var(--color-muted)]">
                    {permissionsForRole(role).map((permission) => PERMISSION_LABELS[permission]).join(" · ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button className="text-[var(--color-accent)] hover:underline" onClick={() => resetPassword(user.id, user.username)}>Đặt lại MK</button>
                      {user.id !== currentUserId && <button className="text-[var(--color-error)] hover:underline" onClick={() => deleteUser(user.id, user.username)}>Xóa</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-5">
        <h2 className="font-bold">Ma trận quyền mặc định</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {roleSummary.map(({ role, permissions }) => (
            <div key={role} className="rounded-md border border-[var(--color-rule)] p-3">
              <div className="font-semibold">{ROLE_LABELS[role]}</div>
              <div className="mt-1 text-xs text-[var(--color-muted)]">{permissions.map((permission) => PERMISSION_LABELS[permission]).join(" · ")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
