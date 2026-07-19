import { prisma } from "@/lib/prisma";
import JobForm from "@/components/admin/JobForm";
import { notFound } from "next/navigation";

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) notFound();

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa tin tuyển dụng</h1>
      <div className="mt-6 max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <JobForm
          initial={{
            id: job.id,
            title: job.title,
            department: job.department,
            location: job.location,
            type: job.type,
            level: job.level || "",
            quantity: job.quantity,
            salaryMin: job.salaryMin ?? "",
            salaryMax: job.salaryMax ?? "",
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits || "",
            deadline: job.deadline ? job.deadline.toISOString().slice(0, 10) : "",
            status: job.status as "OPEN" | "CLOSED",
            reqEducationMin: job.reqEducationMin || "",
            reqExperienceYearsMin: job.reqExperienceYearsMin ?? "",
            reqAgeMin: job.reqAgeMin ?? "",
            reqAgeMax: job.reqAgeMax ?? "",
            reqField: job.reqField || "",
          }}
        />
      </div>
    </div>
  );
}
