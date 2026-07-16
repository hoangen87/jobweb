"use client";

import { useState } from "react";
import { EDUCATION_LEVELS } from "@/lib/format";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("jobId", jobId);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg("Không thể kết nối máy chủ. Vui lòng thử lại.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">Nộp hồ sơ thành công!</p>
        <p className="mt-2 text-sm text-green-700">
          Cảm ơn bạn đã ứng tuyển. Bộ phận Nhân sự sẽ liên hệ khi hồ sơ phù hợp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Họ và tên *</label>
          <input required name="fullName" className="input-field" placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className="label-field">Số điện thoại *</label>
          <input required name="phone" className="input-field" placeholder="09xxxxxxxx" />
        </div>
      </div>
      <div>
        <label className="label-field">Email *</label>
        <input required type="email" name="email" className="input-field" placeholder="ban@email.com" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Ngày sinh *</label>
          <input required type="date" name="dateOfBirth" className="input-field" />
        </div>
        <div>
          <label className="label-field">Trình độ học vấn *</label>
          <select required name="education" className="input-field" defaultValue="">
            <option value="" disabled>
              Chọn trình độ
            </option>
            {EDUCATION_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Số năm kinh nghiệm *</label>
          <input
            required
            type="number"
            min={0}
            name="experienceYears"
            className="input-field"
            placeholder="0"
          />
        </div>
        <div>
          <label className="label-field">Ngành nghề / Chuyên môn *</label>
          <input
            required
            name="fieldOfExpertise"
            className="input-field"
            placeholder="VD: An toàn lao động, Cơ khí, Kế toán..."
          />
        </div>
      </div>

      <div>
        <label className="label-field">Thư giới thiệu (không bắt buộc)</label>
        <textarea
          name="coverLetter"
          rows={4}
          className="input-field"
          placeholder="Vài dòng giới thiệu bản thân..."
        />
      </div>
      <div>
        <label className="label-field">Tải lên CV (PDF, DOC, DOCX - tối đa 5MB) *</label>
        <input
          required
          type="file"
          name="cv"
          accept=".pdf,.doc,.docx"
          className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
        />
      </div>

      {status === "error" && (
        <p className="text-sm font-medium text-red-600">{errorMsg}</p>
      )}

      <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
        {status === "loading" ? "Đang gửi..." : "Nộp hồ sơ ứng tuyển"}
      </button>
    </form>
  );
}
