import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import JobsTable from "@/components/admin/JobsTable";
import LogoutButton from "@/components/admin/LogoutButton";
import { normalizeAdminLocale } from "@/lib/admin-i18n";
import { adminT } from "@/lib/admin-translations";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const locale = normalizeAdminLocale(cookies().get("admin-locale")?.value);
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { applications: true } } } });
  const totalApplications = await prisma.application.count();
  const openJobs = jobs.filter((j) => j.status === "OPEN").length;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">{adminT(locale, "jobsTitle")}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{adminT(locale, "jobsDesc")}</p>
        </div>
        <div className="flex gap-3"><Link href="/admin/jobs/new" className="btn-primary">{adminT(locale, "newJob")}</Link><LogoutButton locale={locale} /></div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-5 shadow-sm"><div className="text-xs font-medium uppercase text-[var(--color-muted)]">{adminT(locale, "totalJobs")}</div><div className="mt-2 text-2xl font-bold text-[var(--color-ink)]">{jobs.length}</div></div>
        <div className="rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-5 shadow-sm"><div className="text-xs font-medium uppercase text-[var(--color-muted)]">{adminT(locale, "openJobs")}</div><div className="mt-2 text-2xl font-bold text-[var(--color-success)]">{openJobs}</div></div>
        <div className="rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-5 shadow-sm"><div className="text-xs font-medium uppercase text-[var(--color-muted)]">{adminT(locale, "applicationsReceived")}</div><div className="mt-2 text-2xl font-bold text-[var(--color-accent)]">{totalApplications}</div></div>
      </div>

      <div className="mt-8"><JobsTable jobs={jobs.map((j) => ({ ...j, createdAt: j.createdAt.toISOString() }))} locale={locale} /></div>
    </div>
  );
}
