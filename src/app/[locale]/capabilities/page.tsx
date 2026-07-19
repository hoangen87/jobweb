import { getTranslations } from "next-intl/server";

export default async function CapabilitiesPage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "capabilities" });

  const items = [
    { no: "01", title: t("commitmentTitle"), text: t("commitmentText") },
    { no: "02", title: t("qmsTitle"), text: t("qmsText") },
    { no: "03", title: t("policyTitle"), text: t("policyText") },
  ];

  const kpis = [
    { label: t("kpi1Label"), value: t("kpi1Value") },
    { label: t("kpi2Label"), value: t("kpi2Value") },
    { label: t("kpi3Label"), value: t("kpi3Value") },
    { label: t("kpi4Label"), value: t("kpi4Value") },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b-4 border-brand-600 text-white">
        <img
          src="/images/banners/capabilities.jpg"
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
        <div className="grid gap-4 sm:grid-cols-3">
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

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">{t("objectivesTitle")}</h2>
          <p className="mt-2 text-sm text-gray-600">{t("objectivesIntro")}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-sm border border-gray-200 bg-gray-50 p-5 text-center transition hover:border-[#930000] hover:bg-white"
              >
                <div className="text-2xl font-bold text-[#930000]">{kpi.value}</div>
                <div className="mt-2 text-xs leading-relaxed text-gray-600">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-xs text-gray-400">{t("sourceNote")}</p>
      </div>
    </div>
  );
}
