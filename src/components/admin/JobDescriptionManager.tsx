"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type JobDescription = {
  id: string;
  title: string;
  department: string;
  version: number;
  fileName: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
};

export default function JobDescriptionManager({ jobDescriptions }: { jobDescriptions: JobDescription[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [replaceId, setReplaceId] = useState("");

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setError("");
    try {
      const response = await fetch(replaceId ? `/api/job-descriptions/${replaceId}` : "/api/job-descriptions", {
        method: replaceId ? "PATCH" : "POST",
        body: new FormData(event.currentTarget),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Không thể tải Job Detail.");
      setOpen(false);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Không thể tải Job Detail.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen((value) => !value)} className="btn-secondary">
        Cập nhật Job Detail
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(720px,calc(100vw-2rem))] rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-ink)]">Thư viện Job Detail</h2>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-[var(--color-muted)]">Đóng</button>
          </div>
          <form onSubmit={upload} className="mt-4 grid gap-3 sm:grid-cols-2">
            <select
              value={replaceId}
              onChange={(event) => setReplaceId(event.target.value)}
              className="input-field sm:col-span-2"
            >
              <option value="">Tạo Job Detail mới</option>
              {jobDescriptions.map((jd) => (
                <option key={jd.id} value={jd.id}>
                  Thay thế: {jd.title} · {jd.department} · v{jd.version}
                </option>
              ))}
            </select>
            <input name="title" required className="input-field" placeholder="Tên Job Detail / vị trí tuyển dụng" />
            <input name="department" required className="input-field" placeholder="Phòng ban" />
            <input name="file" required type="file" accept=".pdf,.docx,.txt" className="input-field" />
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? "Đang tải..." : replaceId ? "Cập nhật phiên bản Job Detail" : "Lưu Job Detail mới"}
            </button>
          </form>
          <p className="mt-2 text-xs text-[var(--color-muted)]">Hỗ trợ PDF, DOCX, TXT; tối đa 10 MB.</p>
          {error && <p className="mt-3 text-sm text-[var(--color-error)]">{error}</p>}
          {jobDescriptions.length > 0 && (
            <div className="mt-4 max-h-64 divide-y divide-[var(--color-rule)] overflow-y-auto rounded-[var(--radius-app)] border border-[var(--color-rule)]">
              {jobDescriptions.map((jd) => (
                <div key={jd.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium text-[var(--color-ink)]">{jd.title}</div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {jd.department} · v{jd.version} · {jd.fileName}
                    </div>
                  </div>
                  <a href={`/api/admin/files?type=jd&id=${jd.id}`} target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline">
                    Xem Job Detail
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
