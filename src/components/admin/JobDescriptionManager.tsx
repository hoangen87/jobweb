"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminLocale } from "@/lib/admin-i18n";

type JobDescription = { id: string; title: string; department: string; version: number; fileName: string; filePath: string; createdAt: string; updatedAt: string };

const copy = {
  vi: { update: "Cập nhật Job Detail", library: "Thư viện Job Detail", close: "Đóng", create: "Tạo Job Detail mới", replace: "Thay thế", title: "Tên Job Detail / vị trí tuyển dụng", department: "Phòng ban", uploading: "Đang tải...", updateVersion: "Cập nhật phiên bản Job Detail", save: "Lưu Job Detail mới", support: "Hỗ trợ PDF, DOCX, TXT; tối đa 10 MB.", view: "Xem Job Detail", error: "Không thể tải Job Detail." },
  en: { update: "Update Job Detail", library: "Job Detail Library", close: "Close", create: "Create new Job Detail", replace: "Replace", title: "Job Detail name / position", department: "Department", uploading: "Uploading...", updateVersion: "Update Job Detail version", save: "Save new Job Detail", support: "PDF, DOCX and TXT supported; maximum 10 MB.", view: "View Job Detail", error: "Unable to upload Job Detail." },
  "zh-TW": { update: "更新職缺說明", library: "職缺說明資料庫", close: "關閉", create: "新增職缺說明", replace: "取代", title: "職缺說明名稱／招聘職位", department: "部門", uploading: "上傳中...", updateVersion: "更新職缺說明版本", save: "儲存新職缺說明", support: "支援 PDF、DOCX、TXT；檔案上限 10 MB。", view: "查看職缺說明", error: "無法上傳職缺說明。" },
} satisfies Record<AdminLocale, Record<string, string>>;

export default function JobDescriptionManager({ jobDescriptions, locale = "vi" }: { jobDescriptions: JobDescription[]; locale?: AdminLocale }) {
  const router = useRouter();
  const t = copy[locale];
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [replaceId, setReplaceId] = useState("");

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setUploading(true); setError("");
    try {
      const response = await fetch(replaceId ? `/api/job-descriptions/${replaceId}` : "/api/job-descriptions", { method: replaceId ? "PATCH" : "POST", body: new FormData(event.currentTarget) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || t.error);
      setOpen(false); router.refresh();
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : t.error); }
    finally { setUploading(false); }
  }

  return <div>
    <button type="button" onClick={() => setOpen((value) => !value)} className="btn-secondary">{t.update}</button>
    {open && <div className="absolute right-0 top-full z-40 mt-2 w-[min(720px,calc(100vw-2rem))] rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-5 shadow-lg">
      <div className="flex items-center justify-between"><h2 className="font-semibold text-[var(--color-ink)]">{t.library}</h2><button type="button" onClick={() => setOpen(false)} className="text-sm text-[var(--color-muted)]">{t.close}</button></div>
      <form onSubmit={upload} className="mt-4 grid gap-3 sm:grid-cols-2">
        <select value={replaceId} onChange={(event) => setReplaceId(event.target.value)} className="input-field sm:col-span-2"><option value="">{t.create}</option>{jobDescriptions.map((jd) => <option key={jd.id} value={jd.id}>{t.replace}: {jd.title} · {jd.department} · v{jd.version}</option>)}</select>
        <input name="title" required className="input-field" placeholder={t.title} /><input name="department" required className="input-field" placeholder={t.department} /><input name="file" required type="file" accept=".pdf,.docx,.txt" className="input-field" />
        <button type="submit" disabled={uploading} className="btn-primary">{uploading ? t.uploading : replaceId ? t.updateVersion : t.save}</button>
      </form>
      <p className="mt-2 text-xs text-[var(--color-muted)]">{t.support}</p>{error && <p className="mt-3 text-sm text-[var(--color-error)]">{error}</p>}
      {jobDescriptions.length > 0 && <div className="mt-4 max-h-64 divide-y divide-[var(--color-rule)] overflow-y-auto rounded-[var(--radius-app)] border border-[var(--color-rule)]">{jobDescriptions.map((jd) => <div key={jd.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm"><div><div className="font-medium text-[var(--color-ink)]">{jd.title}</div><div className="text-xs text-[var(--color-muted)]">{jd.department} · v{jd.version} · {jd.fileName}</div></div><a href={`/api/admin/files?type=jd&id=${jd.id}`} target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline">{t.view}</a></div>)}</div>}
    </div>}
  </div>;
}
