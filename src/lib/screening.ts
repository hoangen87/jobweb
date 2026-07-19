import { calculateAge } from "./format";

// Thứ hạng học vấn dùng để so sánh "đạt tối thiểu yêu cầu" — số càng cao càng
// cao hơn về bằng cấp. "Khác" không xếp hạng được nên đặt thấp nhất.
const EDU_RANK: Record<string, number> = {
  "THPT": 1,
  "Trung cấp": 2,
  "Cao đẳng": 3,
  "Đại học": 4,
  "Sau đại học": 5,
  "Khác": 0,
};

export const SCREENING_PASS_THRESHOLD = 70;

export type ScreeningJob = {
  reqEducationMin?: string | null;
  reqExperienceYearsMin?: number | null;
  reqAgeMin?: number | null;
  reqAgeMax?: number | null;
  reqField?: string | null;
};

export type ScreeningApplication = {
  education?: string | null;
  experienceYears?: number | null;
  dateOfBirth?: string | Date | null;
  fieldOfExpertise?: string | null;
};

export type CriterionResult = {
  key: "education" | "experience" | "age" | "field";
  label: string;
  /** true/false nếu so sánh được, null nếu thiếu dữ liệu ứng viên để so sánh */
  pass: boolean | null;
  detail: string;
};

export type ScreeningResult = {
  /** % phù hợp (0-100), null nếu tin tuyển dụng chưa đặt yêu cầu nào */
  score: number | null;
  matchedCount: number;
  totalCriteria: number;
  qualified: boolean | null;
  criteria: CriterionResult[];
};

/**
 * Tự động chấm % phù hợp của 1 hồ sơ ứng viên so với yêu cầu tuyển dụng của
 * tin đăng. Chỉ tính trên các tiêu chí mà (a) tin tuyển dụng có đặt yêu cầu
 * VÀ (b) ứng viên có khai thông tin tương ứng — tránh trừ điểm oan vì thiếu
 * dữ liệu. Các tiêu chí thiếu dữ liệu vẫn liệt kê trong `criteria` để admin
 * biết cần xem hồ sơ/CV thêm.
 */
export function screenApplication(app: ScreeningApplication, job: ScreeningJob): ScreeningResult {
  const criteria: CriterionResult[] = [];

  if (job.reqEducationMin) {
    const reqRank = EDU_RANK[job.reqEducationMin] ?? 0;
    const appRank = app.education ? EDU_RANK[app.education] ?? 0 : null;
    const pass = appRank !== null ? appRank >= reqRank : null;
    criteria.push({
      key: "education",
      label: "Học vấn",
      pass,
      detail: app.education
        ? `${app.education} (yêu cầu tối thiểu ${job.reqEducationMin})`
        : `Chưa khai học vấn (yêu cầu tối thiểu ${job.reqEducationMin})`,
    });
  }

  if (job.reqExperienceYearsMin !== null && job.reqExperienceYearsMin !== undefined) {
    const has = app.experienceYears !== null && app.experienceYears !== undefined;
    const pass = has ? (app.experienceYears as number) >= job.reqExperienceYearsMin : null;
    criteria.push({
      key: "experience",
      label: "Kinh nghiệm",
      pass,
      detail: has
        ? `${app.experienceYears} năm (yêu cầu ≥ ${job.reqExperienceYearsMin} năm)`
        : `Chưa khai kinh nghiệm (yêu cầu ≥ ${job.reqExperienceYearsMin} năm)`,
    });
  }

  const hasAgeMin = job.reqAgeMin !== null && job.reqAgeMin !== undefined;
  const hasAgeMax = job.reqAgeMax !== null && job.reqAgeMax !== undefined;
  if (hasAgeMin || hasAgeMax) {
    const age = calculateAge(app.dateOfBirth ?? null);
    const pass =
      age !== null
        ? (job.reqAgeMin ? age >= job.reqAgeMin : true) && (job.reqAgeMax ? age <= job.reqAgeMax : true)
        : null;
    const rangeText = `${job.reqAgeMin ?? "?"}-${job.reqAgeMax ?? "?"} tuổi`;
    criteria.push({
      key: "age",
      label: "Độ tuổi",
      pass,
      detail: age !== null ? `${age} tuổi (yêu cầu ${rangeText})` : `Chưa khai ngày sinh (yêu cầu ${rangeText})`,
    });
  }

  if (job.reqField && job.reqField.trim()) {
    const keywords = job.reqField
      .toLowerCase()
      .split(/[,;/]+/)
      .map((k) => k.trim())
      .filter(Boolean);
    const candidateField = (app.fieldOfExpertise ?? "").trim().toLowerCase();
    const has = candidateField.length > 0;
    const pass = has ? keywords.some((k) => candidateField.includes(k) || k.includes(candidateField)) : null;
    criteria.push({
      key: "field",
      label: "Ngành nghề",
      pass,
      detail: has
        ? `"${app.fieldOfExpertise}" (yêu cầu: ${job.reqField})`
        : `Chưa khai ngành nghề (yêu cầu: ${job.reqField})`,
    });
  }

  if (criteria.length === 0) {
    return { score: null, matchedCount: 0, totalCriteria: 0, qualified: null, criteria };
  }

  const evaluable = criteria.filter((c) => c.pass !== null);
  const matchedCount = evaluable.filter((c) => c.pass).length;
  const totalCriteria = evaluable.length;
  const score = totalCriteria > 0 ? Math.round((matchedCount / totalCriteria) * 100) : null;
  const qualified = score !== null ? score >= SCREENING_PASS_THRESHOLD : null;

  return { score, matchedCount, totalCriteria, qualified, criteria };
}
