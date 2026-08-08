# Design — JHONSIN Job Website

Hệ thiết kế khóa (locked design system) cho toàn bộ site. Mọi lần sửa/tạo trang mới đọc file
này trước khi viết code. Không tạo hệ thống mới cho từng trang — sửa/mở rộng file này khi cần
thay đổi.

## Genre
editorial (Newsprint — báo in/catalogue)

## Macrostructure family

Hai family, dùng chung token nhưng khác nhịp cấu trúc:

- **Marketing/Content pages** (`/`, `/company`, `/products`, `/capabilities`, `/contact`,
  `/jobs/[id]`): macrostructure **Catalogue** — lưới `gap-px border bg-[var(--color-rule)]`
  tạo hiệu ứng cột báo, hairline rule phân cách section (`.catalogue-rule`), không bo góc,
  không đổ bóng. Ảnh thật, không minh họa.
- **App pages** (`/admin/**`): macrostructure **Workbench** — bảng dữ liệu + form + card
  thống kê. Ưu tiên chức năng, không cần hero/enrichment. Đây là nhánh **duy nhất** được phép
  dùng `border-radius` (`--radius-app`) và `box-shadow` nhẹ (`shadow-sm`) — vì đây là dashboard
  nội bộ, không phải trang thương hiệu công khai.

## Theme

**Custom (tuned) — "Steel Navy".** Đổi từ palette đỏ trầm ban đầu sang xanh navy công nghiệp theo
yêu cầu trực tiếp của em Yến (không phải catalog theme có sẵn — anchor màu do người dùng chọn,
nên đi theo nhánh custom/tuned của Hallmark, giữ nguyên macrostructure/typography/spacing).
Dùng chung 1 bộ token OKLCH cho cả 2 family (định nghĩa tại `src/app/globals.css :root`):

- `--color-paper`        oklch(97% 0.008 250)
- `--color-paper-2`      oklch(93% 0.014 248)
- `--color-ink`          oklch(19% 0.035 255)
- `--color-ink-2`        oklch(34% 0.04 255)
- `--color-muted`        oklch(47% 0.03 250)
- `--color-rule`         oklch(80% 0.02 245)
- `--color-accent`       oklch(45% 0.135 258)  (xanh navy — Steel Navy)
- `--color-accent-dark`  oklch(35% 0.115 258)
- `--color-accent-soft`  oklch(92% 0.03 250)   (nền tint nhạt — callout/badge/selected row)
- `--color-accent-ink`   oklch(98% 0.006 250)
- `--color-focus`        oklch(47% 0.15 255)   (đã hợp tông sẵn với accent mới)
- `--color-success` / `--color-success-soft`
- `--color-warning` / `--color-warning-soft`
- `--color-error` / `--color-error-soft`

Không dùng bảng màu Tailwind mặc định (`gray-*`, `blue-*`...) hay palette `brand-*` cũ trong
`tailwind.config.ts` ở bất kỳ trang nào — mọi màu phải qua `var(--color-*)`.

## Typography

- Display: **Newsreader**, roman only, dùng cho `h1/h2/h3`
- Body: **IBM Plex Sans** 400/700
- Outlier: **IBM Plex Mono** — chỉ dùng cho số liệu/label kỹ thuật, tối đa 2 vị trí/trang
- Không italic ở heading. Nhấn mạnh bằng weight hoặc `--color-accent`.

## Spacing

Thang 4pt của Tailwind mặc định (`gap-4`, `p-6`, `py-12`...) — không dùng giá trị tự do.

## Motion

`motion-cut` — không cài thư viện animation. Chỉ `transition` ngắn (hover dịch nhẹ, đổi màu).
Tôn trọng `prefers-reduced-motion`.

## Microinteractions stance

- Silent success cho hành động rõ ràng nhìn thấy (VD: cập nhật trạng thái hồ sơ) — không toast
  ăn mừng.
- Icon: dùng **lucide-react** xuyên suốt (đã thêm vào `package.json`), không dùng emoji hay
  ký tự Unicode (✔, 📍...) làm icon chức năng.

## CTA voice

- Primary: `.btn-primary` — nền `--color-accent`, chữ `--color-accent-ink`, không bo góc.
- Secondary: `.btn-secondary` — viền `--color-rule`, nền trong suốt.
- Cả hai class dùng chung cho public site lẫn admin (đã có sẵn trong `globals.css`).

## Nav · Footer

- Public: `PublicNavbar`/`PublicFooter` — N6 Newspaper masthead / Ft1 Mast-headed.
- Admin: `Navbar`/`Footer` (`src/components/Navbar.tsx`, `Footer.tsx`) — thanh chức năng đơn
  giản, dùng chung token màu nhưng không bắt buộc theo N6/Ft1 (App family không cần masthead).
- `--banner-height: 7.25rem` — mọi phần tử `position: sticky` bên trong trang phải neo
  `top: var(--banner-height)` (không dùng số cứng như `top-24`) để không bị Navbar
  (`sticky top-0 z-40`) đè lên khi cuộn.

## Per-page allowances

- Marketing/Content pages: KHÔNG bo góc, KHÔNG đổ bóng, KHÔNG rounded pill trừ badge trạng thái
  ngôn ngữ (`LanguageSwitcher`).
- App pages (`/admin`): ĐƯỢC dùng `rounded-lg` (container/card) và `rounded-full` (badge trạng
  thái hồ sơ/tin tuyển dụng), `shadow-sm` cho card tĩnh, `shadow-lg` cho panel nổi (popover).
  Không dùng enrichment, không ảnh hero.

## What pages MUST share

- Token màu/font ở trên — không có ngoại lệ, không hardcode hex/oklch/gray-*/brand-* mới.
- `.btn-primary` / `.btn-secondary` / `.input-field` / `.label-field` / `.badge` (đã định nghĩa
  trong `globals.css`).
- Bộ icon lucide-react.

## What pages MAY differ on

- Bo góc + đổ bóng: chỉ App family được phép, khai rõ ở trên — không phải drift ngẫu nhiên.
- Cấu trúc lưới bên trong family (Catalogue vẫn có thể là lưới ảnh, lưới KPI, hay bảng dl tuỳ
  nội dung trang, miễn dùng chung ngôn ngữ hairline-rule + tokens).

## Ghi chú

File này được tạo sau khi `hallmark audit` phát hiện 4/6 trang public (Company, Capabilities,
Contact, Job Detail) và toàn bộ khu `/admin` lệch khỏi hệ token Newsprint đã chốt ban đầu
(dùng thẳng `gray-*`/`brand-*`, bo góc + đổ bóng không nhất quán, emoji làm icon, card-in-card
ở Capabilities, sticky sidebar bị Navbar đè ở Job Detail). `hallmark redesign` đã sửa các lỗi
này trong phạm vi file hiện có (không đổi route, không đổi logic nghiệp vụ), theo đúng hệ
thống khai ở trên.
