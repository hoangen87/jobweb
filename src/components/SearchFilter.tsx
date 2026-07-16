"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  departments: string[];
  locations: string[];
};

export default function SearchFilter({ departments, locations }: Props) {
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
        placeholder="Tìm theo tên vị trí..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="input-field"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        <option value="">Tất cả phòng ban</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        className="input-field"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      >
        <option value="">Tất cả địa điểm</option>
        {locations.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <div className="flex gap-2 sm:col-span-4">
        <button type="submit" className="btn-primary">
          Tìm kiếm
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          Xóa lọc
        </button>
      </div>
    </form>
  );
}
