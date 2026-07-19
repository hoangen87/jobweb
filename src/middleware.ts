import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { verifySessionToken, getSessionCookieName } from "@/lib/session";

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Khu vực quản trị: không đa ngôn ngữ, chỉ kiểm tra đăng nhập.
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const token = req.cookies.get(getSessionCookieName())?.value;
    const username = await verifySessionToken(token);
    if (!username) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Các trang công khai còn lại: xử lý định tuyến đa ngôn ngữ (vi/en/zh).
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
