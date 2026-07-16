import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: `Giới thiệu công ty - ${COMPANY.shortName}`,
};

export default function CompanyPage() {
  const rows: [string, string][] = [
    ["Tên giao dịch", COMPANY.tradeName],
    ["Tên viết tắt", COMPANY.shortName],
    ["Mã số thuế", COMPANY.taxCode],
    ["Người đại diện theo pháp luật", COMPANY.legalRepresentative],
    ["Địa chỉ", COMPANY.address],
    ["Lĩnh vực sản xuất kinh doanh", COMPANY.industry],
  ];

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold text-gray-900">Giới thiệu công ty</h1>
      <p className="mt-2 text-gray-600">{COMPANY.legalName}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Thông tin doanh nghiệp</h2>
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
            <h2 className="text-base font-semibold text-gray-900">Sản phẩm & chi tiết ngành nghề</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {COMPANY.industryDetail}
            </p>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-6">
            <h2 className="text-base font-semibold text-brand-900">Vì sao chọn Jhonsin Việt Nam?</h2>
            <ul className="mt-4 space-y-3 text-sm text-brand-900">
              <li>✔ Môi trường làm việc an toàn, tuân thủ ISO, IWAY, C-TPAT</li>
              <li>✔ Chế độ phúc lợi, BHXH đầy đủ theo quy định pháp luật</li>
              <li>✔ Cơ hội đào tạo và phát triển nghề nghiệp</li>
              <li>✔ Vị trí thuận tiện tại KCN An Phước, Đồng Nai</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
