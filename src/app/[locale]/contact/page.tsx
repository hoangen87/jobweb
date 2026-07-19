import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/constants";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  const rows: [string, string][] = [
    [t("company"), COMPANY.tradeName],
    [t("address"), COMPANY.address],
    [t("taxCode"), COMPANY.taxCode],
  ];

  return (
    <div className="container-page py-12">
      <p className="section-kicker">{t("eyebrow")}</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-900 sm:text-3xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">{t("intro")}</p>

      <div className="mt-8 max-w-2xl rounded-sm border border-gray-200 bg-gray-50 p-6">
        <dl className="divide-y divide-gray-200 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-gray-500">{label}</dt>
              <dd className="col-span-2 font-medium text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>

        <Link
          href="/company"
          className="mt-6 inline-flex items-center text-sm font-semibold text-brand-600 hover:text-[#930000]"
        >
          {t("visitCompany")} →
        </Link>
      </div>
    </div>
  );
}
