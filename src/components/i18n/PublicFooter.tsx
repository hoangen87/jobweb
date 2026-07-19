import { useTranslations } from "next-intl";
import { COMPANY } from "@/lib/constants";

export default function PublicFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-16 border-t-4 border-brand-600 bg-[#930000] text-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2">
        <div>
          <div className="text-sm font-bold text-white">{COMPANY.tradeName}</div>
          <div className="mt-1 text-sm text-white/80">{COMPANY.legalName}</div>
          <div className="mt-3 text-sm text-white/80">{COMPANY.address}</div>
          <div className="mt-1 text-sm text-white/80">
            {t("taxCode")}: {COMPANY.taxCode}
          </div>
        </div>
        <div className="text-sm text-white/80 sm:text-right">
          <div>
            {t("field")}: {COMPANY.industry}
          </div>
          <div className="mt-4 text-xs text-white/60">
            © {new Date().getFullYear()} {COMPANY.shortName}. {t("rights")}
          </div>
        </div>
      </div>
    </footer>
  );
}
