import JobForm from "@/components/admin/JobForm";

export default function NewJobPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Đăng tin tuyển dụng mới</h1>
      <div className="mt-6 w-full max-w-6xl rounded-[var(--radius-app)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-6 shadow-sm">
        <JobForm />
      </div>
    </div>
  );
}
