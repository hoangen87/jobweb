"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { EDUCATION_LEVELS } from "@/lib/format";
import type { AdminLocale } from "@/lib/admin-i18n";
import { adminT } from "@/lib/admin-translations";

type Props = { locations: string[]; levels: string[]; fields: string[]; locale?: AdminLocale };

export default function ApplicationFilter({ locations, levels, fields, locale = "vi" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [education, setEducation] = useState(searchParams.get("education") || "");
  const [expMin, setExpMin] = useState(searchParams.get("expMin") || "");
  const [expMax, setExpMax] = useState(searchParams.get("expMax") || "");
  const [ageMin, setAgeMin] = useState(searchParams.get("ageMin") || "");
  const [ageMax, setAgeMax] = useState(searchParams.get("ageMax") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [level, setLevel] = useState(searchParams.get("level") || "");
  const [field, setField] = useState(searchParams.get("field") || "");

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const jobId = searchParams.get("jobId");
    if (jobId) params.set("jobId", jobId);
    if (education) params.set("education", education); if (expMin) params.set("expMin", expMin); if (expMax) params.set("expMax", expMax); if (ageMin) params.set("ageMin", ageMin); if (ageMax) params.set("ageMax", ageMax); if (location) params.set("location", location); if (level) params.set("level", level); if (field) params.set("field", field);
    router.push(`/admin/applications?${params.toString()}`);
  }

  function reset() {
    setEducation(""); setExpMin(""); setExpMax(""); setAgeMin(""); setAgeMax(""); setLocation(""); setLevel(""); setField(""); router.push("/admin/applications");
  }

  const selectAll = adminT(locale, "all");
  return <form onSubmit={applyFilters} className="grid gap-3 rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-6">
    <div><label className="label-field">{adminT(locale, "degree")}</label><select className="input-field" value={education} onChange={(e) => setEducation(e.target.value)}><option value="">{selectAll}</option>{EDUCATION_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}</select></div>
    <div><label className="label-field">{adminT(locale, "field")}</label><select className="input-field" value={field} onChange={(e) => setField(e.target.value)}><option value="">{selectAll}</option>{fields.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
    <div><label className="label-field">{adminT(locale, "area")}</label><select className="input-field" value={location} onChange={(e) => setLocation(e.target.value)}><option value="">{selectAll}</option>{locations.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
    <div><label className="label-field">{adminT(locale, "level")}</label><select className="input-field" value={level} onChange={(e) => setLevel(e.target.value)}><option value="">{selectAll}</option>{levels.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
    <div><label className="label-field">{adminT(locale, "experienceYears")}</label><div className="flex items-center gap-1.5"><input type="number" min={0} placeholder={adminT(locale, "from")} className="input-field" value={expMin} onChange={(e) => setExpMin(e.target.value)} /><span className="text-[var(--color-muted)]">-</span><input type="number" min={0} placeholder={adminT(locale, "to")} className="input-field" value={expMax} onChange={(e) => setExpMax(e.target.value)} /></div></div>
    <div><label className="label-field">{adminT(locale, "age")}</label><div className="flex items-center gap-1.5"><input type="number" min={0} placeholder={adminT(locale, "from")} className="input-field" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} /><span className="text-[var(--color-muted)]">-</span><input type="number" min={0} placeholder={adminT(locale, "to")} className="input-field" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} /></div></div>
    <div className="flex gap-2 sm:col-span-3 lg:col-span-6"><button type="submit" className="btn-primary">{adminT(locale, "filter")}</button><button type="button" onClick={reset} className="btn-secondary">{adminT(locale, "clearFilter")}</button></div>
  </form>;
}
