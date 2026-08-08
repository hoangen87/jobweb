import { getTranslations } from "next-intl/server";
import { COMPANY } from "@/lib/constants";
import { formatArea } from "@/lib/format";
import type { Locale } from "@/i18n/routing";
import { Check } from "lucide-react";

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
    [t("landArea"), formatArea(COMPANY.landAreaSqm, locale as Locale)],
    [t("industry"), COMPANY.industry],
  ];

  const products = [
    { image: "/images/jhonsin-products/print-placemat.jpg", name: t("productPlacemat") },
    { image: "/images/jhonsin-products/zipper-bags.jpg", name: t("productZipperBags") },
    { image: "/images/jhonsin-products/food-saver.jpg", name: t("productFoodSaver") },
    { image: "/images/jhonsin-products/drawer-organizer.jpg", name: t("productOrganizer") },
  ];

  const timeline = [t("timelineTaiwan"), t("timelineStage1"), t("timelineStage2")];

  return (
    <div>
      <section className="page-mast">
        <img
          src="/images/banners/company.jpg"
          alt=""
          aria-hidden
          className="page-mast__image"
        />
        <div className="container-page page-mast__content">
          <h1 className="page-mast__title">{t("title")}</h1>
          <p className="mt-2 text-white/85">{COMPANY.legalName}</p>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="border-y border-[var(--color-rule)] py-6">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("businessInfo")}</h2>
            <dl className="mt-4 divide-y divide-[var(--color-rule)] text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-[var(--color-muted)]">{label}</dt>
                  <dd className="col-span-2 font-medium text-[var(--color-ink)]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-10 border-y border-[var(--color-rule)] py-6">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("productsTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-2)]">{t("industryDetail")}</p>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {products.map((product) => (
                <figure key={product.image} className="overflow-hidden border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="p-3 text-center text-xs font-medium text-[var(--color-ink-2)]">
                    {product.name}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="border-t-4 border-[var(--color-accent)] bg-[var(--color-paper-2)] p-6">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("whyTitle")}</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-ink)]">
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden /> {t("why1")}</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden /> {t("why2")}</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden /> {t("why3")}</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden /> {t("why4")}</li>
            </ul>
          </div>
        </div>
      </div>

        <div className="mt-10 border-y border-[var(--color-rule)] py-6">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("timelineTitle")}</h2>
          <ol className="mt-5 space-y-5 border-l-2 border-[var(--color-rule)] pl-6">
            {timeline.map((item, index) => (
              <li key={index} className="relative text-sm leading-relaxed text-[var(--color-ink-2)]">
                <span className="absolute -left-[1.95rem] top-1 h-3 w-3 rounded-full border-2 border-[var(--color-paper)] bg-[var(--color-accent)]" />
                {item}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
