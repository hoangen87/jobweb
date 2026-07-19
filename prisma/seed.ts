import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { translateJobFields } from "../src/lib/translate";

const prisma = new PrismaClient();

const SAMPLE_JOBS: Omit<Prisma.JobCreateInput, "translations">[] = [
  {
    title: "Nhân viên HSE (An toàn - Sức khỏe - Môi trường)",
    department: "HSE",
    location: "KCN An Phước, Long Thành, Đồng Nai",
    type: "Toàn thời gian",
    level: "Nhân viên",
    quantity: 2,
    salaryMin: 9000000,
    salaryMax: 13000000,
    description:
      "Thực hiện công tác an toàn lao động, phòng cháy chữa cháy, quản lý môi trường và chất thải tại nhà máy. Kiểm tra hiện trường, huấn luyện an toàn cho người lao động, tham gia điều tra tai nạn lao động và sự cố môi trường.",
    requirements:
      "Tốt nghiệp Cao đẳng/Đại học chuyên ngành An toàn lao động, Môi trường hoặc liên quan. Có chứng chỉ huấn luyện an toàn lao động nhóm 2/3. Ưu tiên có kinh nghiệm trong ngành sản xuất nhựa.",
    benefits:
      "Lương thỏa thuận theo năng lực, BHXH đầy đủ, thưởng lễ Tết, phụ cấp ăn trưa, xe đưa đón, môi trường làm việc chuyên nghiệp.",
    status: "OPEN",
  },
  {
    title: "Quản lý hệ thống ISO/IWAY/C-TPAT",
    department: "QA/HSE",
    location: "KCN An Phước, Long Thành, Đồng Nai",
    type: "Toàn thời gian",
    level: "Chuyên viên",
    quantity: 1,
    salaryMin: 14000000,
    salaryMax: 20000000,
    description:
      "Xây dựng, duy trì và cải tiến hệ thống quản lý ISO 9001, IWAY, C-TPAT. Chuẩn bị hồ sơ đánh giá nội bộ và đánh giá bên ngoài. Phối hợp các phòng ban đảm bảo tuân thủ tiêu chuẩn khách hàng.",
    requirements:
      "Tốt nghiệp Đại học, có kinh nghiệm quản lý hệ thống ISO tối thiểu 2 năm. Ưu tiên hiểu biết về IWAY (IKEA) hoặc C-TPAT. Tiếng Anh giao tiếp tốt.",
    benefits: "Thu nhập cạnh tranh, xét tăng lương hàng năm, chế độ phúc lợi đầy đủ theo luật định.",
    status: "OPEN",
  },
  {
    title: "Công nhân sản xuất (Ép nhựa/Đóng gói)",
    department: "Sản xuất",
    location: "KCN An Phước, Long Thành, Đồng Nai",
    type: "Toàn thời gian",
    level: "Nhân viên",
    quantity: 10,
    salaryMin: 7500000,
    salaryMax: 10000000,
    description:
      "Vận hành máy ép nhựa, đóng gói sản phẩm túi zip, thảm lót sàn, thớt nhựa theo tiêu chuẩn chất lượng.",
    requirements: "Không yêu cầu kinh nghiệm, được đào tạo tại chỗ. Chăm chỉ, chịu được áp lực công việc theo ca.",
    benefits: "Lương cơ bản + phụ cấp chuyên cần + tăng ca, hỗ trợ chỗ ở, ăn ca miễn phí.",
    status: "OPEN",
  },
];

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "Jhonsin@2026";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  const count = await prisma.job.count();
  if (count === 0) {
    for (const jobData of SAMPLE_JOBS) {
      console.log(`Đang tạo và dịch tin: ${jobData.title}...`);
      const translations = await translateJobFields({
        title: jobData.title,
        department: jobData.department,
        location: jobData.location,
        type: jobData.type,
        level: jobData.level as string | null | undefined,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits as string | null | undefined,
      });
      await prisma.job.create({ data: { ...jobData, translations } });
    }
  }

  // Dịch bổ sung cho các tin cũ chưa có bản dịch (vd tạo trước khi có tính năng này).
  const untranslated = await prisma.job.findMany({ where: { translations: { equals: Prisma.DbNull } } });
  for (const job of untranslated) {
    console.log(`Đang bổ sung bản dịch cho tin: ${job.title}...`);
    const translations = await translateJobFields({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      level: job.level,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
    });
    await prisma.job.update({ where: { id: job.id }, data: { translations } });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
