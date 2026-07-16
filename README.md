# Web tuyển dụng - JHONSIN VIETNAM CO.,LTD

Web đăng tin tuyển dụng full-stack, viết bằng TypeScript trên nền Next.js 14 (App Router) + Prisma (PostgreSQL) + Tailwind CSS.

## Tính năng
- Trang chủ: danh sách vị trí đang tuyển, tìm kiếm theo tên, lọc theo phòng ban/địa điểm
- Trang chi tiết vị trí + form ứng viên nộp CV (upload PDF/DOC/DOCX, tối đa 5MB)
- Trang giới thiệu công ty (thông tin JHONSIN VIETNAM CO.,LTD)
- Trang quản trị (`/admin`) có đăng nhập: thêm/sửa/xóa tin tuyển dụng, xem & xử lý hồ sơ ứng tuyển
- Sàng lọc hồ sơ ứng viên theo: bằng cấp, kinh nghiệm, khu vực, cấp bậc, độ tuổi, ngành nghề

## Yêu cầu môi trường
- Node.js 20.x LTS trở lên (bắt buộc, vì mã xác thực admin dùng Web Crypto API toàn cục)
- npm
- Một database PostgreSQL (dùng miễn phí qua [Neon](https://neon.tech) — xem `DEPLOY.md`)

## Cài đặt (chạy trên máy của bạn)

```bash
cd job-website
npm install
```

Mở file `.env`, thay `DATABASE_URL` bằng connection string PostgreSQL thật (lấy từ Neon — xem hướng dẫn tạo trong `DEPLOY.md`).

```bash
npx prisma migrate dev --name init   # tạo bảng trong database
npm run seed                         # tạo tài khoản admin + 3 tin mẫu
npm run dev                          # chạy http://localhost:3000
```

> Muốn public web thật cho mọi người truy cập (không chỉ chạy trên máy mình)? Xem hướng dẫn đầy đủ trong **`DEPLOY.md`**: đẩy code lên GitHub + deploy miễn phí lên Vercel.

## Tài khoản quản trị mặc định
Xem/đổi trong file `.env`:
```
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="Jhonsin@2026"
```
Sau khi đổi mật khẩu trong `.env`, chạy lại `npm run seed` để cập nhật tài khoản.
**Nên đổi mật khẩu mặc định trước khi đưa vào sử dụng thật.**

Đăng nhập tại: `http://localhost:3000/admin/login`

## Lưu trữ CV ứng viên
- Khi chạy local: CV được lưu vào thư mục `public/uploads`.
- Khi deploy lên Vercel: tự động chuyển sang lưu ở **Vercel Blob Storage** (nếu đã bật, xem `DEPLOY.md`) vì Vercel không cho ghi file vào ổ đĩa cục bộ.

## Cấu trúc chính
```
src/app/               # Các trang (App Router)
  page.tsx             # Trang chủ - danh sách + tìm kiếm việc làm
  jobs/[id]/page.tsx   # Chi tiết vị trí + form ứng tuyển
  company/page.tsx     # Giới thiệu công ty
  admin/               # Khu vực quản trị (được bảo vệ bởi middleware)
  api/                 # API routes (jobs, applications, admin auth)
src/components/        # Component dùng chung
src/lib/                # Prisma client, xác thực admin, hằng số công ty, format
prisma/schema.prisma    # Schema database (Job, Application, Admin)
prisma/seed.ts          # Dữ liệu khởi tạo (tài khoản admin + tin mẫu)
DEPLOY.md               # Hướng dẫn đẩy lên GitHub + deploy web thật lên Vercel
```

## Lệnh hữu ích
```bash
npm run dev      # chạy dev server
npm run build    # build production (tự chạy prisma generate + migrate deploy)
npm run start    # chạy bản build production
npm run seed     # seed lại admin + dữ liệu mẫu
npx prisma studio  # xem/sửa dữ liệu trực quan
```
