import JobForm from "@/components/admin/JobForm";

export default function NewJobPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-gray-900">Đăng tin tuyển dụng mới</h1>
      <div className="mt-6 max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <JobForm />
      </div>
    </div>
  );
}
