import { COMPANY } from "@/lib/constants";
import type { ReactNode } from "react";
import type { AdminLocale } from "@/lib/admin-i18n";

const footerCopy: Record<AdminLocale, { tax: string; industry: string; rights: string }> = {
  vi: { tax: "MST", industry: "Lĩnh vực", rights: "Đã đăng ký bản quyền." },
  en: { tax: "Tax code", industry: "Industry", rights: "All rights reserved." },
  "zh-TW": { tax: "稅號", industry: "產業", rights: "版權所有。" },
};

export default function Footer({ actions, locale = "vi" }: { actions?: ReactNode; locale?: AdminLocale }) {
  const t = footerCopy[locale];
  return (
    <footer className="mt-16 border-t border-[var(--color-rule)] bg-[var(--color-paper-2)]">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2">
        <div>
          <div className="text-sm font-bold text-[var(--color-ink)]">{COMPANY.tradeName}</div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">{COMPANY.legalName}</div>
          <div className="mt-3 text-sm text-[var(--color-muted)]">{COMPANY.address}</div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">{t.tax}: {COMPANY.taxCode}</div>
        </div>
        <div className="text-sm text-[var(--color-muted)] sm:text-right">
          <div>{t.industry}: {COMPANY.industry}</div>
          <div className="mt-4 text-xs text-[var(--color-muted)]">© {new Date().getFullYear()} {COMPANY.shortName}. {t.rights}</div>
          {actions}
        </div>
      </div>
    </footer>
  );
}
