"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";
import type { AdminLocale } from "@/lib/admin-i18n";
import { adminT } from "@/lib/admin-translations";

type Job = { id: string; title: string; department: string; location: string; status: string; createdAt: string; _count?: { applications: number } };

export default function JobsTable({ jobs, locale = "vi" }: { jobs: Job[]; locale?: AdminLocale }) {
  const router = useRouter();
  async function handleDelete(id: string, title: string) {
    const question = locale === "en" ? `Delete job \"${title}\"? Related applications will also be deleted.` : locale === "zh-TW" ? `確定刪除職缺「${title}」嗎？相關履歷也會一併刪除。` : `Xóa tin \"${title}\"? Hồ sơ ứng tuyển liên quan cũng sẽ bị xóa.`;
    if (!confirm(question)) return;
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh(); else alert(locale === "en" ? "Could not delete the job." : locale === "zh-TW" ? "無法刪除職缺。" : "Không thể xóa tin tuyển dụng.");
  }

  if (jobs.length === 0) return <div className="rounded-[var(--radius-app)] border border-dashed border-[var(--color-rule)] bg-[var(--color-paper)] p-10 text-center text-[var(--color-muted)]">{adminT(locale, "noJobs")}</div>;

  return (
    <div className="overflow-x-auto rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] shadow-sm">
      <table className="min-w-full divide-y divide-[var(--color-rule)] text-sm">
        <thead className="bg-[var(--color-paper-2)] text-left text-xs font-semibold uppercase text-[var(--color-muted)]"><tr><th className="px-4 py-3">{adminT(locale, "position")}</th><th className="px-4 py-3">{adminT(locale, "department")}</th><th className="px-4 py-3">{adminT(locale, "location")}</th><th className="px-4 py-3">{adminT(locale, "status")}</th><th className="px-4 py-3">{adminT(locale, "postedAt")}</th><th className="px-4 py-3">{adminT(locale, "applications")}</th><th className="px-4 py-3 text-right">{adminT(locale, "actions")}</th></tr></thead>
        <tbody className="divide-y divide-[var(--color-rule)]">
          {jobs.map((job) => <tr key={job.id}>
            <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{job.title}</td>
            <td className="px-4 py-3 text-[var(--color-muted)]">{job.department}</td>
            <td className="px-4 py-3 text-[var(--color-muted)]">{job.location}</td>
            <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${job.status === "OPEN" ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-paper-2)] text-[var(--color-muted)]"}`}>{job.status === "OPEN" ? adminT(locale, "openJobs") : adminT(locale, "closed")}</span></td>
            <td className="px-4 py-3 text-[var(--color-muted)]">{formatDate(job.createdAt)}</td>
            <td className="px-4 py-3"><Link href={`/admin/applications?jobId=${job.id}`} className="text-[var(--color-accent)] hover:underline">{job._count?.applications ?? 0} {adminT(locale, "records")}</Link></td>
            <td className="px-4 py-3 text-right"><div className="flex justify-end gap-3"><Link href={`/admin/jobs/${job.id}/edit`} className="text-[var(--color-accent)] hover:underline">{adminT(locale, "edit")}</Link><button onClick={() => handleDelete(job.id, job.title)} className="text-[var(--color-error)] hover:underline">{adminT(locale, "delete")}</button></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}
