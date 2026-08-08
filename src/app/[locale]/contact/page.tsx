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
      <section className="page-mast">
        <img
          src="/images/banners/contact.jpg"
          alt=""
          aria-hidden
          className="page-mast__image"
        />
        <div className="container-page page-mast__content">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{t("eyebrow")}</p>
          <h1 className="page-mast__title mt-2">{t("title")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90">{t("intro")}</p>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6">
            <dl className="divide-y divide-[var(--color-rule)] text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-[var(--color-muted)]">{label}</dt>
                  <dd className="col-span-2 font-medium text-[var(--color-ink)]">{value}</dd>
                </div>
              ))}
              {contactLinks.map((item) => (
                <div key={item.label} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-[var(--color-muted)]">{item.label}</dt>
                  <dd className="col-span-2 font-medium text-[var(--color-accent)]">
                    <a href={item.href} className="hover:text-[var(--color-accent-dark)] hover:underline">
                      {item.value}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href="/company"
              className="mt-6 inline-flex items-center whitespace-nowrap text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-dark)]"
            >
              {t("visitCompany")} →
            </Link>
          </div>

          <div className="overflow-hidden border border-[var(--color-rule)]">
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
              className="block whitespace-nowrap border-t border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-3 text-center text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-dark)]"
            >
              {t("openInMaps")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
