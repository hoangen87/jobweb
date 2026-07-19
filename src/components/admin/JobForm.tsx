"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EDUCATION_LEVELS } from "@/lib/format";

type JobFormValues = {
  id?: string;
  title: string;
  department: string;
  location: string;
  type: string;
  level: string;
  quantity: number;
  salaryMin: number | "";
  salaryMax: number | "";
  description: string;
  requirements: string;
  benefits: string;
  deadline: string;
  status: "OPEN" | "CLOSED";
  reqEducationMin: string;
  reqExperienceYearsMin: number | "";
  reqAgeMin: number | "";
  reqAgeMax: number | "";
  reqField: string;
};

const DEFAULTS: JobFormValues = {
  title: "",
  department: "",
  location: "",
  type: "Toàn thời gian",
  level: "",
  quantity: 1,
  salaryMin: "",
  salaryMax: "",
  description: "",
  requirements: "",
  benefits: "",
  deadline: "",
  status: "OPEN",
  reqEducationMin: "",
  reqExperienceYearsMin: "",
  reqAgeMin: "",
  reqAgeMax: "",
  reqField: "",
};

export default function JobForm({ initial }: { initial?: Partial<JobFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<JobFormValues>({ ...DEFAULTS, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const LOCALE_NAME: Record<string, string> = { en: "Tiếng Anh", zh: "Tiếng Trung" };

  function update<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setWarning("");

    const payload = {
      ...values,
      salaryMin: values.salaryMin === "" ? null : Number(values.salaryMin),
      salaryMax: values.salaryMax === "" ? null : Number(values.salaryMax),
      deadline: values.deadline || null,
      reqExperienceYearsMin: values.reqExperienceYearsMin === "" ? null : Number(values.reqExperienceYearsMin),
      reqAgeMin: values.reqAgeMin === "" ? null : Number(values.reqAgeMin),
      reqAgeMax: values.reqAgeMax === "" ? null : Number(values.reqAgeMax),
    };

    const url = values.id ? `/api/jobs/${values.id}` : "/api/jobs";
    const method = values.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Không thể lưu tin tuyển dụng. Vui lòng kiểm tra lại thông tin.");
      return;
    }

    const data = await res.json().catch(() => null);
    const failedLocales: string[] | null = data?.translationWarning ?? null;

    if (failedLocales && failedLocales.length > 0) {
      const names = failedLocales.map((l) => LOCALE_NAME[l] ?? l).join(", ");
      setWarning(
        `Tin đã lưu, nhưng dịch tự động sang ${names} bị lỗi (do API dịch quá tải/mất mạng) — các trường lỗi đang tạm hiển thị bằng tiếng Việt. Anh có thể vào sửa lại tin để hệ thống dịch lại.`
      );
      return; // Không tự chuyển trang, để admin đọc cảnh báo rồi bấm tiếp.
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label-field">Tên vị trí *</label>
          <input
            required
            className="input-field"
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>
        <div>
          <label className="label-field">Phòng ban *</label>
          <input
            required
            className="input-field"
            value={values.department}
            onChange={(e) => update("department", e.target.value)}
          />
        </div>
        <div>
          <label className="label-field">Địa điểm *</label>
          <input
            required
            className="input-field"
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </div>
        <div>
          <label className="label-field">Loại hình *</label>
          <select
            className="input-field"
            value={values.type}
            onChange={(e) => update("type", e.target.value)}
          >
            <option>Toàn thời gian</option>
            <option>Bán thời gian</option>
            <option>Thời vụ</option>
            <option>Thực tập</option>
          </select>
        </div>
        <div>
          <label className="label-field">Cấp bậc</label>
          <input
            className="input-field"
            value={values.level}
            onChange={(e) => update("level", e.target.value)}
            placeholder="Nhân viên / Chuyên viên / Quản lý..."
          />
        </div>
        <div>
          <label className="label-field">Số lượng tuyển *</label>
          <input
            required
            type="number"
            min={1}
            className="input-field"
            value={values.quantity}
            onChange={(e) => update("quantity", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label-field">Trạng thái</label>
          <select
            className="input-field"
            value={values.status}
            onChange={(e) => update("status", e.target.value as "OPEN" | "CLOSED")}
          >
            <option value="OPEN">Đang tuyển</option>
            <option value="CLOSED">Đã đóng</option>
          </select>
        </div>
        <div>
          <label className="label-field">Lương tối thiểu (VNĐ)</label>
          <input
            type="number"
            className="input-field"
            value={values.salaryMin}
            onChange={(e) => update("salaryMin", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label-field">Lương tối đa (VNĐ)</label>
          <input
            type="number"
            className="input-field"
            value={values.salaryMax}
            onChange={(e) => update("salaryMax", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Hạn nộp hồ sơ</label>
          <input
            type="date"
            className="input-field"
            value={values.deadline}
            onChange={(e) => update("deadline", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label-field">Mô tả công việc *</label>
        <textarea
          required
          rows={5}
          className="input-field"
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>
      <div>
        <label className="label-field">Yêu cầu ứng viên *</label>
        <textarea
          required
          rows={5}
          className="input-field"
          value={values.requirements}
          onChange={(e) => update("requirements", e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
        <p className="text-sm font-semibold text-brand-900">
          Yêu cầu tuyển dụng cụ thể (để trống nếu không áp dụng)
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Hệ thống dùng các mục này để tự động chấm % phù hợp của từng hồ sơ ứng tuyển ở trang Hồ sơ ứng
          tuyển. Tiêu chí nào để trống sẽ không được tính vào % chấm điểm.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Học vấn tối thiểu</label>
            <select
              className="input-field"
              value={values.reqEducationMin}
              onChange={(e) => update("reqEducationMin", e.target.value)}
            >
              <option value="">Không yêu cầu</option>
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Kinh nghiệm tối thiểu (năm)</label>
            <input
              type="number"
              min={0}
              className="input-field"
              value={values.reqExperienceYearsMin}
              onChange={(e) =>
                update("reqExperienceYearsMin", e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
          <div>
            <label className="label-field">Độ tuổi</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                placeholder="Từ"
                className="input-field"
                value={values.reqAgeMin}
                onChange={(e) => update("reqAgeMin", e.target.value === "" ? "" : Number(e.target.value))}
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                min={0}
                placeholder="Đến"
                className="input-field"
                value={values.reqAgeMax}
                onChange={(e) => update("reqAgeMax", e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="label-field">Ngành nghề / chuyên môn yêu cầu</label>
            <input
              className="input-field"
              placeholder="VD: An toàn lao động, Cơ khí (cách nhau bằng dấu phẩy)"
              value={values.reqField}
              onChange={(e) => update("reqField", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label-field">Quyền lợi</label>
        <textarea
          rows={4}
          className="input-field"
          value={values.benefits}
          onChange={(e) => update("benefits", e.target.value)}
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {warning && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">⚠ {warning}</p>
          <button
            type="button"
            onClick={() => {
              router.push("/admin");
              router.refresh();
            }}
            className="btn-primary mt-3"
          >
            Đã hiểu, quay lại danh sách
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Đang lưu..." : values.id ? "Cập nhật tin" : "Đăng tin"}
        </button>
        <button type="button" onClick={() => router.push("/admin")} className="btn-secondary">
          Hủy
        </button>
      </div>
    </form>
  );
}
