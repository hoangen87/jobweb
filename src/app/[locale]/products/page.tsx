import { getTranslations } from "next-intl/server";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });

  const products = [
    { image: "/images/jhonsin-products/print-placemat.jpg", name: t("placemat") },
    { image: "/images/jhonsin-products/zipper-bags.jpg", name: t("zipperBags") },
    { image: "/images/jhonsin-products/food-saver.jpg", name: t("foodSaver") },
    { image: "/images/jhonsin-products/drawer-organizer.jpg", name: t("organizer") },
    { image: "/images/jhonsin-products/foldable-storage-box.jpg", name: t("storageBox") },
    { image: "/images/jhonsin-products/anti-slip-tape.png", name: t("antiSlip") },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b-4 border-brand-600 text-white">
        <img
          src="/images/banners/products.jpg"
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {products.map((product) => (
            <figure
              key={product.image}
              className="overflow-hidden rounded-sm border border-gray-200 bg-gray-50 transition hover:border-[#930000]"
            >
              <div className="aspect-square w-full overflow-hidden bg-white">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="border-t border-gray-200 bg-white p-3 text-center text-sm font-medium text-gray-800">
                {product.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
