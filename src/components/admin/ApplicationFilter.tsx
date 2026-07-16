"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { EDUCATION_LEVELS } from "@/lib/format";

type Props = {
  locations: string[];
  levels: string[];
  fields: string[];
};

export default function ApplicationFilter({ locations, levels, fields }: Props) {
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
    if (education) params.set("education", education);
    if (expMin) params.set("expMin", expMin);
    if (expMax) params.set("expMax", expMax);
    if (ageMin) params.set("ageMin", ageMin);
    if (ageMax) params.set("ageMax", ageMax);
    if (location) params.set("location", location);
    if (level) params.set("level", level);
    if (field) params.set("field", field);
    router.push(`/admin/applications?${params.toString()}`);
  }

  function reset() {
    setEducation("");
    setExpMin("");
    setExpMax("");
    setAgeMin("");
    setAgeMax("");
    setLocation("");
    setLevel("");
    setField("");
    router.push("/admin/applications");
  }

  return (
    <form
      onSubmit={applyFilters}
      className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-6"
    >
      <div>
        <label className="label-field">Bằng cấp</label>
        <select className="input-field" value={education} onChange={(e) => setEducation(e.target.value)}>
          <option value="">Tất cả</option>
          {EDUCATION_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Ngành nghề</label>
        <select className="input-field" value={field} onChange={(e) => setField(e.target.value)}>
          <option value="">Tất cả</option>
          {fields.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Khu vực</label>
        <select className="input-field" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Tất cả</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Cấp bậc</label>
        <select className="input-field" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Tất cả</option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Kinh nghiệm (năm)</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            placeholder="Từ"
            className="input-field"
            value={expMin}
            onChange={(e) => setExpMin(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min={0}
            placeholder="Đến"
            className="input-field"
            value={expMax}
            onChange={(e) => setExpMax(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label-field">Độ tuổi</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            placeholder="Từ"
            className="input-field"
            value={ageMin}
            onChange={(e) => setAgeMin(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min={0}
            placeholder="Đến"
            className="input-field"
            value={ageMax}
            onChange={(e) => setAgeMax(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 sm:col-span-3 lg:col-span-6">
        <button type="submit" className="btn-primary">
          Lọc hồ sơ
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          Xóa lọc
        </button>
      </div>
    </form>
  );
}
