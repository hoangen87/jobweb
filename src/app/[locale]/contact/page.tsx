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

  const contactLinks = [
    { label: t("phone"), value: COMPANY.phone, href: `tel:${COMPANY.phone}` },
    { label: t("email"), value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  ];

  // Ghi chú quan trọng: dùng thẳng toạ độ (lat,lng) chỉ thả một pin trống —
  // Google không gắn được nó với địa điểm doanh nghiệp thật nên báo "Không tải
  // được thông tin về địa điểm" khi bấm vào pin. Công ty đã có sẵn hồ sơ doanh
  // nghiệp trên Google Maps dưới đúng tên tiếng Việt "CÔNG TY TNHH JHONSIN VIỆT
  // NAM" (xác nhận qua link Maps em gửi) — tìm theo đúng tên này thì Google trả
  // về địa điểm thật kèm đầy đủ thông tin, thay vì một pin toạ độ vô danh.
  const mapQuery = encodeURIComponent(COMPANY.legalName);
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&z=17&output=embed`;

  return (
    <div>
      <section className="relative overflow-hidden border-b-4 border-brand-600 text-white">
        <img
          src="/images/banners/contact.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4a0000]/95 via-[#930000]/85 to-[#930000]/50" />
        <div className="container-page relative py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{t("eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90">{t("intro")}</p>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-sm border border-gray-200 bg-gray-50 p-6">
            <dl className="divide-y divide-gray-200 text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="col-span-2 font-medium text-gray-900">{value}</dd>
                </div>
              ))}
              {contactLinks.map((item) => (
                <div key={item.label} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-gray-500">{item.label}</dt>
                  <dd className="col-span-2 font-medium text-brand-600">
                    <a href={item.href} className="hover:text-[#930000] hover:underline">
                      {item.value}
                    </a>
                  </dd>
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
    </div>
  );
}
