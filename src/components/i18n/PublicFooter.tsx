import { useTranslations } from "next-intl";
import { COMPANY } from "@/lib/constants";

export default function PublicFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-16 border-t border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]">
      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-8 border-b border-white/20 pb-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <div className="font-[var(--font-display)] text-3xl font-bold leading-none">JHONSIN</div>
            <div className="mt-3 text-sm text-white/75">{COMPANY.tradeName}</div>
            <div className="mt-1 text-sm text-white/75">{COMPANY.legalName}</div>
            <div className="mt-4 max-w-xl text-sm text-white/75">{COMPANY.address}</div>
            <div className="mt-1 text-sm text-white/75">{t("taxCode")}: {COMPANY.taxCode}</div>
          </div>
          <div className="text-sm text-white/75 sm:text-right">
            {t("field")}: {COMPANY.industry}
          </div>
        </div>
        <div className="pt-5 text-xs text-white/55">
          © {new Date().getFullYear()} {COMPANY.shortName}. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
