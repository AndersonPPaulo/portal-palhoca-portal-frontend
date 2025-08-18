import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("user:token");

  if (!token && req.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  if (token && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    token &&
    (req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/postagens") ||
      req.nextUrl.pathname.startsWith("/autores") ||
      req.nextUrl.pathname.startsWith("/minha-conta") ||
      req.nextUrl.pathname.startsWith("/portais") ||
      req.nextUrl.pathname.startsWith("/tags") ||
      req.nextUrl.pathname.startsWith("/comercio") ||
      req.nextUrl.pathname.startsWith("/banners") ||
      req.nextUrl.pathname.startsWith("/usuários") ||
      req.nextUrl.pathname.startsWith("/comercios"))
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/minha-conta/:path*",
    "/autores/:path*",
    "/postagens/:path*",
    "/portais/:path*",
    "/tags/:path*",
    "/comercio/:path*",
    "/banners/:path*",
    "/usuários/:path*",
    "/comercios/:path*",
  ],
};
