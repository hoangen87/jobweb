"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

type Option = { value: string; label: string };

type Props = {
  departments: Option[];
  locations: Option[];
};

export default function SearchFilter({ departments, locations }: Props) {
  const t = useTranslations("home");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [department, setDepartment] = useState(searchParams.get("department") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (department) params.set("department", department);
    if (location) params.set("location", location);
    router.push(`/?${params.toString()}`);
  }

  function reset() {
    setQ("");
    setDepartment("");
    setLocation("");
    router.push("/");
  }

  return (
    <form
      onSubmit={applyFilters}
      className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-4"
    >
      <input
        className="input-field sm:col-span-2"
        placeholder={t("searchPlaceholder")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="input-field"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        <option value="">{t("allDepartments")}</option>
        {departments.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
      <select
        className="input-field"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      >
        <option value="">{t("allLocations")}</option>
        {locations.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
      <div className="flex gap-2 sm:col-span-4">
        <button type="submit" className="btn-primary">
          {t("search")}
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          {t("clear")}
        </button>
      </div>
    </form>
  );
}
