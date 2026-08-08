"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { EDUCATION_LEVELS } from "@/lib/format";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const t = useTranslations("applyForm");
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
        setErrorMsg(data.error || t("genericError"));
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg(t("networkError"));
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-[var(--color-success)]/30 bg-[var(--color-success-soft)] p-6 text-center">
        <p className="text-lg font-semibold text-[var(--color-success)]">{t("successTitle")}</p>
        <p className="mt-2 text-sm text-[var(--color-success)]">{t("successMessage")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">{t("fullName")} *</label>
          <input
            required
            name="fullName"
            className="input-field"
            placeholder={t("fullNamePlaceholder")}
          />
        </div>
        <div>
          <label className="label-field">{t("phone")} *</label>
          <input required name="phone" className="input-field" placeholder="09xxxxxxxx" />
        </div>
      </div>
      <div>
        <label className="label-field">{t("email")} *</label>
        <input required type="email" name="email" className="input-field" placeholder="ban@email.com" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">{t("dateOfBirth")} *</label>
          <input required type="date" name="dateOfBirth" className="input-field" />
        </div>
        <div>
          <label className="label-field">{t("education")} *</label>
          <select required name="education" className="input-field" defaultValue="">
            <option value="" disabled>
              {t("educationSelect")}
            </option>
            {EDUCATION_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">{t("experienceYears")} *</label>
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
          <label className="label-field">{t("fieldOfExpertise")} *</label>
          <input
            required
            name="fieldOfExpertise"
            className="input-field"
            placeholder={t("fieldOfExpertisePlaceholder")}
          />
        </div>
      </div>

      <div>
        <label className="label-field">{t("coverLetter")}</label>
        <textarea
          name="coverLetter"
          rows={4}
          className="input-field"
          placeholder={t("coverLetterPlaceholder")}
        />
      </div>
      <div>
        <label className="label-field">{t("cv")} *</label>
        <input
          required
          type="file"
          name="cv"
          accept=".pdf,.doc,.docx"
          className="block w-full text-sm text-[var(--color-muted)] file:mr-4 file:border-0 file:bg-[var(--color-accent-soft)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-accent)] hover:file:bg-[var(--color-accent-soft)]"
        />
      </div>

      {status === "error" && (
        <p className="text-sm font-medium text-[var(--color-error)]">{errorMsg}</p>
      )}

      <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
        {status === "loading" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
