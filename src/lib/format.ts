export function formatSalary(min?: number | null, max?: number | null) {
  const fmt = (n: number) => `${(n / 1000000).toLocaleString("vi-VN")} triệu`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `Từ ${fmt(min)}`;
  if (max) return `Đến ${fmt(max)}`;
  return "Thỏa thuận";
}

export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function calculateAge(dateOfBirth: Date | string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function ageRangeToDobRange(ageMin?: number | null, ageMax?: number | null) {
  const range: { gte?: Date; lte?: Date } = {};
  const today = new Date();

  // Older person (higher age) => earlier (smaller) date of birth.
  // age >= ageMin  =>  dateOfBirth <= today - ageMin years
  if (ageMin !== null && ageMin !== undefined && !Number.isNaN(ageMin)) {
    range.lte = new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate());
  }
  // age <= ageMax  =>  dateOfBirth >= today - (ageMax + 1) years + 1 day
  if (ageMax !== null && ageMax !== undefined && !Number.isNaN(ageMax)) {
    const d = new Date(today.getFullYear() - ageMax - 1, today.getMonth(), today.getDate());
    d.setDate(d.getDate() + 1);
    range.gte = d;
  }

  return range;
}

export const EDUCATION_LEVELS = [
  "THPT",
  "Trung cấp",
  "Cao đẳng",
  "Đại học",
  "Sau đại học",
  "Khác",
];
