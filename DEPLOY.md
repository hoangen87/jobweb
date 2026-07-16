# Hướng dẫn: Đẩy code lên GitHub + Deploy web thật (miễn phí) lên Vercel

Làm theo đúng thứ tự A → B → C. Tất cả lệnh chạy trong PowerShell, tại thư mục `D:\Job Website\job-website`.

---

## A. Đẩy code lên GitHub (`github.com/hoangen87/jobweb`)

### A1. Cài Git (nếu máy chưa có)
Kiểm tra:
```powershell
git --version
```
Nếu báo lỗi "not recognized" → tải và cài tại https://git-scm.com/download/win (cứ Next liên tục là được), rồi mở lại PowerShell.

### A2. Khai báo tên/email cho Git (chỉ cần làm 1 lần trên máy)
```powershell
git config --global user.name "Hoang Yen"
git config --global user.email "yh21071987@gmail.com"
```

### A3. Tạo repo trên GitHub (nếu `hoangen87/jobweb` chưa tồn tại)
Vào https://github.com/new, đăng nhập tài khoản `hoangen87`, đặt Repository name = `jobweb`, để **Public** (để mọi người xem được code), **không** tích "Add a README" (vì mình đã có code sẵn) → bấm **Create repository**.

> Nếu repo đã có sẵn rồi thì bỏ qua bước này.

### A4. Đẩy code lên
Trong PowerShell, tại `D:\Job Website\job-website`:
```powershell
git init
git add .
git commit -m "Khoi tao web tuyen dung Jhonsin Vietnam"
git branch -M main
git remote add origin https://github.com/hoangen87/jobweb.git
git push -u origin main
```
Lần đầu push, Windows sẽ mở popup yêu cầu đăng nhập GitHub — đăng nhập bằng tài khoản `hoangen87` là xong.

**Lưu ý:** file `.env` (chứa mật khẩu admin) đã được `.gitignore` loại trừ sẵn nên sẽ **không** bị đẩy lên GitHub — an toàn.

Từ giờ, mỗi khi sửa code xong muốn cập nhật lên GitHub, chỉ cần:
```powershell
git add .
git commit -m "Mo ta thay doi"
git push
```

---

## B. Deploy web thật lên Vercel (link cho mọi người truy cập)

GitHub chỉ lưu **code**, không chạy được web (vì web cần server + database). Muốn có link web thật (kiểu `jobweb.vercel.app`) để ai cũng vào xem/nộp CV được, cần deploy qua **Vercel** — miễn phí, không cần thẻ tín dụng.

### B1. Tạo tài khoản Vercel
Vào https://vercel.com/signup → chọn **Continue with GitHub** → đăng nhập bằng tài khoản `hoangen87` → cho phép Vercel truy cập GitHub.

### B2. Import project
Trong Vercel Dashboard → **Add New → Project** → chọn repo **hoangen87/jobweb** → **Import**.
Ở bước cấu hình, **chưa bấm Deploy vội** — làm tiếp B3 và B4 trước.

### B3. Tạo database PostgreSQL miễn phí (Neon, tích hợp sẵn trong Vercel)
- Trong màn hình import (hoặc sau khi vào project) → mở tab **Storage** → **Create Database** → chọn **Neon (Postgres)** → **Continue** → **Create**.
- Vercel sẽ tự động thêm biến môi trường kết nối database vào project.
- Vào **Settings → Environment Variables**, kiểm tra có biến tên đúng là `DATABASE_URL` chưa:
  - Nếu Neon tạo ra tên khác (vd `POSTGRES_PRISMA_URL`), copy giá trị đó và tạo thêm 1 biến mới tên chính xác là `DATABASE_URL` với giá trị vừa copy (Prisma trong code đọc đúng tên biến `DATABASE_URL`).

### B4. Tạo Blob Storage để lưu file CV ứng viên
- Vẫn trong tab **Storage** → **Create Database** → chọn **Blob** → **Create**.
- Vercel tự thêm biến `BLOB_READ_WRITE_TOKEN` vào project — không cần làm gì thêm, code đã tự nhận diện biến này.

### B5. Thêm các biến môi trường còn lại
Vào **Settings → Environment Variables**, thêm (Environment: chọn cả Production + Preview + Development):
| Name | Value |
|---|---|
| `ADMIN_USERNAME` | `admin` (hoặc tên khác em muốn) |
| `ADMIN_PASSWORD` | đặt mật khẩu mạnh, khác mật khẩu mặc định |
| `SESSION_SECRET` | một chuỗi ký tự ngẫu nhiên dài, vd: `jhonsin-2026-xkq93ndlaoq83jd` |

### B6. Deploy
Bấm **Deploy**. Đợi 1-2 phút, Vercel sẽ tự chạy `npm install`, tạo bảng database (`prisma migrate deploy`), và build web.

Khi xong, Vercel cho một link dạng: `https://jobweb-xxxx.vercel.app` — **đây là link để chia sẻ cho mọi người xem web thật.**

### B7. Tạo tài khoản admin trên database thật (chỉ làm 1 lần)
Database production hiện chưa có tài khoản admin (vì `npm run seed` mới chỉ chạy trên máy em, chưa chạy trên DB thật). Làm như sau, ngay trên máy em:

1. Copy connection string Postgres thật từ Vercel: **Settings → Environment Variables → DATABASE_URL** → bấm xem/copy giá trị.
2. Mở file `.env` trên máy, dán giá trị đó đè lên `DATABASE_URL` hiện tại (tạm thời, để trỏ đúng vào DB thật).
3. Chạy:
   ```powershell
   npm run seed
   ```
   Lệnh này tạo tài khoản admin + 3 tin tuyển dụng mẫu trên database thật.
4. Từ giờ về sau, cứ dùng chung 1 database này cho cả local lẫn Vercel (đơn giản, khỏi quản lý 2 database) — không cần đổi `.env` lại nữa.

### B8. Kiểm tra
- Vào link Vercel vừa nhận được → xem trang chủ có hiện tin tuyển dụng chưa.
- Vào `/admin/login`, đăng nhập bằng `ADMIN_USERNAME`/`ADMIN_PASSWORD` đã đặt ở bước B5.

---

## C. Cập nhật web sau này

Mỗi khi sửa code trên máy và muốn cập nhật web thật:
```powershell
git add .
git commit -m "Mo ta thay doi"
git push
```
Vercel tự động phát hiện push mới lên GitHub và deploy lại — không cần làm gì thêm ở Vercel.

---

## Tóm tắt 2 loại link

| Link | Dùng để làm gì |
|---|---|
| `github.com/hoangen87/jobweb` | Nơi lưu **mã nguồn** (code), không chạy được như web thật |
| `https://jobweb-xxxx.vercel.app` (link Vercel cấp ở bước B6) | **Link web thật** — gửi link này cho ứng viên/mọi người để họ xem tin và nộp CV |
