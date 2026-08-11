import type { AdminLocale } from "./admin-i18n";

const dict = {
  vi: {
    tabsJobs: "Quản lý tin tuyển dụng", tabsApplications: "Quản lý hồ sơ ứng viên", tabsAi: "Cấu hình AI", tabsUsers: "Người dùng & Phân quyền",
    jobsTitle: "Quản lý tin tuyển dụng", jobsDesc: "Tạo mới, chỉnh sửa và theo dõi trạng thái các tin tuyển dụng.", newJob: "+ Đăng tin mới", logout: "Đăng xuất",
    totalJobs: "Tổng số tin", openJobs: "Đang tuyển", applicationsReceived: "Hồ sơ đã nhận", position: "Vị trí", department: "Phòng ban", location: "Địa điểm", status: "Trạng thái", postedAt: "Ngày đăng", applications: "Hồ sơ", actions: "Thao tác", edit: "Sửa", delete: "Xóa", closed: "Đã đóng", noJobs: "Chưa có tin tuyển dụng nào. Bấm \"Đăng tin mới\" để bắt đầu.",
    appTitle: "Quản lý hồ sơ ứng viên", appDesc: "Tiếp nhận và quản lý CV, lọc hồ sơ và dùng AI để so sánh, chấm điểm, xếp hạng.", found: "Tìm thấy", records: "hồ sơ",
    degree: "Bằng cấp", field: "Ngành nghề", area: "Khu vực", level: "Cấp bậc", experienceYears: "Kinh nghiệm (năm)", age: "Độ tuổi", all: "Tất cả", from: "Từ", to: "Đến", filter: "Lọc hồ sơ", clearFilter: "Xóa lọc",
    usersTitle: "Người dùng & Phân quyền", usersDesc: "Tạo tài khoản, gán vai trò, khóa/mở người dùng và đặt lại mật khẩu.", addUser: "+ Thêm người dùng",
    aiTitle: "Cấu hình AI", aiDesc: "Quản lý kết nối AI dùng để hỗ trợ HR đánh giá hồ sơ ứng viên.",
  },
  en: {
    tabsJobs: "Job Management", tabsApplications: "Candidate Applications", tabsAi: "AI Settings", tabsUsers: "Users & Permissions",
    jobsTitle: "Job Management", jobsDesc: "Create, edit and track recruitment postings.", newJob: "+ New Job", logout: "Log out",
    totalJobs: "Total jobs", openJobs: "Open jobs", applicationsReceived: "Applications received", position: "Position", department: "Department", location: "Location", status: "Status", postedAt: "Posted", applications: "Applications", actions: "Actions", edit: "Edit", delete: "Delete", closed: "Closed", noJobs: "No job postings yet. Click \"New Job\" to get started.",
    appTitle: "Candidate Applications", appDesc: "Manage CVs, filter candidates and use AI to compare, score and rank them.", found: "Found", records: "applications",
    degree: "Education", field: "Field", area: "Location", level: "Level", experienceYears: "Experience (years)", age: "Age", all: "All", from: "From", to: "To", filter: "Filter", clearFilter: "Clear filters",
    usersTitle: "Users & Permissions", usersDesc: "Create accounts, assign roles, enable or disable users, and reset passwords.", addUser: "+ Add user",
    aiTitle: "AI Settings", aiDesc: "Manage the AI connection used to support HR candidate evaluation.",
  },
  "zh-TW": {
    tabsJobs: "招聘職缺管理", tabsApplications: "應徵者履歷管理", tabsAi: "AI 設定", tabsUsers: "使用者與權限",
    jobsTitle: "招聘職缺管理", jobsDesc: "建立、編輯並追蹤招聘職缺狀態。", newJob: "+ 新增職缺", logout: "登出",
    totalJobs: "職缺總數", openJobs: "招聘中", applicationsReceived: "已收履歷", position: "職位", department: "部門", location: "地點", status: "狀態", postedAt: "發布日期", applications: "履歷", actions: "操作", edit: "編輯", delete: "刪除", closed: "已關閉", noJobs: "目前尚無招聘職缺。請點擊「新增職缺」開始。",
    appTitle: "應徵者履歷管理", appDesc: "管理履歷、篩選候選人，並使用 AI 進行比較、評分與排名。", found: "找到", records: "份履歷",
    degree: "學歷", field: "專業領域", area: "地區", level: "職級", experienceYears: "工作經驗（年）", age: "年齡", all: "全部", from: "從", to: "至", filter: "篩選履歷", clearFilter: "清除篩選",
    usersTitle: "使用者與權限", usersDesc: "建立帳號、指派角色、啟用或停用使用者，以及重設密碼。", addUser: "+ 新增使用者",
    aiTitle: "AI 設定", aiDesc: "管理用於協助 HR 評估應徵者履歷的 AI 連線。",
  },
} as const;

export type AdminTranslationKey = keyof typeof dict.vi;
export function adminT(locale: AdminLocale, key: AdminTranslationKey) { return dict[locale][key] ?? dict.vi[key]; }
