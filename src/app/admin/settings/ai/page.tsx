import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AiConfigurationManager from "@/components/admin/AiConfigurationManager";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { normalizeAdminLocale } from "@/lib/admin-i18n";
import { adminT } from "@/lib/admin-translations";

export default async function AiSettingsPage() {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/admin/login");
  if (!hasPermission(admin.role, "AI_CONFIGURE")) redirect("/admin");
  const locale = normalizeAdminLocale(cookies().get("admin-locale")?.value);

  return <section className="container-page py-10">
    <div className="mb-6">
      <p className="kicker">AI</p>
      <h1 className="mt-2 text-3xl font-bold">{adminT(locale, "aiTitle")}</h1>
      <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">{adminT(locale, "aiDesc")}</p>
    </div>
    <AiConfigurationManager locale={locale} />
  </section>;
}
