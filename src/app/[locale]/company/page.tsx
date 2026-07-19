import { getTranslations } from "next-intl/server";
import { COMPANY } from "@/lib/constants";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });

  const rows: [string, string][] = [
    [t("tradeName"), COMPANY.tradeName],
    [t("shortName"), COMPANY.shortName],
    [t("taxCode"), COMPANY.taxCode],
    [t("legalRep"), COMPANY.legalRepresentative],
    [t("address"), COMPANY.address],
    [t("industry"), COMPANY.industry],
  ];

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
      <p className="mt-2 text-gray-600">{COMPANY.legalName}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">{t("businessInfo")}</h2>
            <dl className="mt-4 divide-y divide-gray-100 text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="col-span-2 font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">{t("productsTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{COMPANY.industryDetail}</p>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-6">
            <h2 className="text-base font-semibold text-brand-900">{t("whyTitle")}</h2>
            <ul className="mt-4 space-y-3 text-sm text-brand-900">
              <li>✔ {t("why1")}</li>
              <li>✔ {t("why2")}</li>
              <li>✔ {t("why3")}</li>
              <li>✔ {t("why4")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
