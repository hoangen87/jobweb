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

  // Dùng toạ độ thật (do em cung cấp qua link Google Maps) để ghim đúng vị trí công ty.
  const mapLabel = encodeURIComponent(COMPANY.tradeName);
  const mapSrc = `https://maps.google.com/maps?q=${COMPANY.mapLat},${COMPANY.mapLng}(${mapLabel})&z=17&output=embed`;

  return (
    <div className="container-page py-12">
      <p className="section-kicker">{t("eyebrow")}</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-900 sm:text-3xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">{t("intro")}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-gray-200 bg-gray-50 p-6">
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

        <div className="overflow-hidden rounded-sm border border-gray-200 shadow-sm">
          <iframe
            src={mapSrc}
            className="h-full min-h-[280px] w-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={t("address")}
          />
          <a
            href={COMPANY.mapPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block border-t border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-brand-600 hover:text-[#930000]"
          >
            {t("openInMaps")}
          </a>
        </div>
      </div>
    </div>
  );
}
