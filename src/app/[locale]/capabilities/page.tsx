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

  const stages = [
    { label: t("stage1Label"), capacity: t("stage1Capacity"), scope: t("stage1Scope") },
    { label: t("stage2Label"), capacity: t("stage2Capacity"), scope: t("stage2Scope") },
  ];

  return (
    <div>
      <section className="page-mast">
        <img
          src="/images/banners/capabilities.jpg"
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
        <div className="grid gap-px border border-[var(--color-rule)] bg-[var(--color-rule)] sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.no}
              className="bg-[var(--color-paper)] p-6 transition hover:bg-[var(--color-paper-2)]"
            >
              <span className="text-xs font-bold tracking-widest text-[var(--color-accent)]">{item.no}</span>
              <h2 className="mt-2 text-base font-semibold text-[var(--color-ink)]">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-2)]">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="catalogue-rule mt-10 pt-8">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("scaleTitle")}</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-2)]">{t("scaleIntro")}</p>
          <div className="mt-5 grid gap-px border border-[var(--color-rule)] bg-[var(--color-rule)] sm:grid-cols-2">
            {stages.map((stage) => (
              <div
                key={stage.label}
                className="bg-[var(--color-paper)] p-5 transition hover:bg-[var(--color-paper-2)]"
              >
                <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">{stage.label}</div>
                <div className="mt-2 text-xl font-bold text-[var(--color-ink)]">{stage.capacity}</div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">{stage.scope}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="catalogue-rule mt-10 pt-8">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("objectivesTitle")}</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-2)]">{t("objectivesIntro")}</p>
          <div className="mt-5 grid gap-px border border-[var(--color-rule)] bg-[var(--color-rule)] sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-[var(--color-paper)] p-5 text-center transition hover:bg-[var(--color-paper-2)]"
              >
                <div className="text-2xl font-bold text-[var(--color-accent)]">{kpi.value}</div>
                <div className="mt-2 text-xs leading-relaxed text-[var(--color-ink-2)]">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-xs text-[var(--color-muted)]">{t("sourceNote")}</p>
      </div>
    </div>
  );
}
