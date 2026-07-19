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

  const products = [
    { image: "/images/jhonsin-products/print-placemat.jpg", name: t("productPlacemat") },
    { image: "/images/jhonsin-products/zipper-bags.jpg", name: t("productZipperBags") },
    { image: "/images/jhonsin-products/food-saver.jpg", name: t("productFoodSaver") },
    { image: "/images/jhonsin-products/drawer-organizer.jpg", name: t("productOrganizer") },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b-4 border-brand-600 text-white">
        <img
          src="/images/banners/company.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4a0000]/95 via-[#930000]/85 to-[#930000]/50" />
        <div className="container-page relative py-12 sm:py-16">
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 text-white/85">{COMPANY.legalName}</p>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-3">
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
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{t("industryDetail")}</p>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {products.map((product) => (
                <figure key={product.image} className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="p-3 text-center text-xs font-medium text-gray-700">
                    {product.name}
                  </figcaption>
                </figure>
              ))}
            </div>
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
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">{t("heritageTitle")}</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{t("heritageDetail")}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
