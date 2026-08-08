import { COMPANY } from "@/lib/constants";
import type { ReactNode } from "react";

export default function Footer({ actions }: { actions?: ReactNode }) {
  return (
    <footer className="mt-16 border-t border-[var(--color-rule)] bg-[var(--color-paper-2)]">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2">
        <div>
          <div className="text-sm font-bold text-[var(--color-ink)]">{COMPANY.tradeName}</div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">{COMPANY.legalName}</div>
          <div className="mt-3 text-sm text-[var(--color-muted)]">{COMPANY.address}</div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">MST: {COMPANY.taxCode}</div>
        </div>
        <div className="text-sm text-[var(--color-muted)] sm:text-right">
          <div>Lĩnh vực: {COMPANY.industry}</div>
          <div className="mt-4 text-xs text-[var(--color-muted)]">
            © {new Date().getFullYear()} {COMPANY.shortName}. All rights reserved.
          </div>
          {actions}
        </div>
      </div>
    </footer>
  );
}
