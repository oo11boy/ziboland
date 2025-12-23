// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const SECRET_KEY =
  process.env.JWT_SECRET ||
  "5b139e5c95598b17e8a6064a7f972f4f2b5970801f4cd4118a35cd7d782fa370";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const pathname = request.nextUrl.pathname;

  // مسیرهای عمومی
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  let decoded: { userId: number; email: string; role: string } | null = null;

  if (token) {
    try {
      const secret = new TextEncoder().encode(SECRET_KEY);
      const { payload } = await jose.jwtVerify(token, secret);
      decoded = payload as { userId: number; email: string; role: string };
    } catch (error) {
      console.error("JWT verification error:", error);
      const response = NextResponse.redirect(
        new URL("/myaccount", request.url)
      );
      response.cookies.delete("authToken");
      return response;
    }
  }

  // مسیر checkout نیاز به لاگین دارد
  if (pathname.startsWith("/checkout")) {
    if (!decoded) {
      // ذخیره مسیر مقصد برای بعد از لاگین
      const loginUrl = new URL("/myaccount", request.url);
      loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // صفحه myaccount
  if (pathname === "/myaccount") {
    if (decoded) {
      const redirectUrl =
        decoded.role === "admin" ? "/admindashboard" : "/userdashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // محافظت از admin
  if (pathname.startsWith("/admindashboard")) {
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/myaccount", request.url));
    }
    return NextResponse.next();
  }

  // محافظت از userdashboard
  if (pathname === "/userdashboard") {
    if (!decoded || decoded.role !== "customer") {
      return NextResponse.redirect(new URL("/myaccount", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/myaccount",
    "/admindashboard/:path*",
    "/userdashboard",
    "/checkout",
  ],
};
