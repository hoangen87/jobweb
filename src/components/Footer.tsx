import { COMPANY } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2">
        <div>
          <div className="text-sm font-bold text-gray-900">{COMPANY.tradeName}</div>
          <div className="mt-1 text-sm text-gray-600">{COMPANY.legalName}</div>
          <div className="mt-3 text-sm text-gray-600">{COMPANY.address}</div>
          <div className="mt-1 text-sm text-gray-600">MST: {COMPANY.taxCode}</div>
        </div>
        <div className="text-sm text-gray-600 sm:text-right">
          <div>Lĩnh vực: {COMPANY.industry}</div>
          <div className="mt-4 text-xs text-gray-400">
            © {new Date().getFullYear()} {COMPANY.shortName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
