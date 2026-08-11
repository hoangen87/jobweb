import { redirect } from "next/navigation";
import AiConfigurationManager from "@/components/admin/AiConfigurationManager";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export default async function AiSettingsPage() {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/admin/login");
  if (!hasPermission(admin.role, "AI_CONFIGURE")) redirect("/admin");

  return (
    <section className="container-page py-10">
      <div className="mb-6">
        <p className="kicker">Hệ thống AI</p>
        <h1 className="mt-2 text-3xl font-bold">Cấu hình AI</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
          Quản lý kết nối AI dùng để hỗ trợ HR đánh giá hồ sơ ứng viên. API key được mã hóa và không hiển thị lại.
        </p>
      </div>
      <AiConfigurationManager />
    </section>
  );
}
