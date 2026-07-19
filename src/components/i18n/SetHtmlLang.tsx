"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

// Layout gốc (src/app/layout.tsx) là nơi duy nhất được khai báo thẻ <html>,
// nên không thể set lang="vi/en/zh" động ở đó theo route [locale]. Component
// này chạy phía client để đồng bộ document.documentElement.lang với ngôn ngữ
// đang xem, phục vụ SEO/accessibility (trình đọc màn hình, Google...).
export default function SetHtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
