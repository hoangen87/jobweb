import { getTranslations } from "next-intl/server";

export default async function CapabilitiesPage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "capabilities" });

  const items = [
    { no: "01", title: t("materialsTitle"), text: t("materialsText") },
    { no: "02", title: t("designTitle"), text: t("designText") },
    { no: "03", title: t("manufacturingTitle"), text: t("manufacturingText") },
    { no: "04", title: t("qualityTitle"), text: t("qualityText") },
  ];

  return (
    <div className="container-page py-12">
      <p className="section-kicker">{t("eyebrow")}</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-900 sm:text-3xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">{t("intro")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.no}
            className="rounded-sm border border-gray-200 bg-gray-50 p-6 transition hover:border-[#930000] hover:bg-white"
          >
            <span className="text-xs font-bold tracking-widest text-[#930000]">{item.no}</span>
            <h2 className="mt-2 text-base font-semibold text-brand-900">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
