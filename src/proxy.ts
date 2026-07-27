import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/constants";

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname !== "/admin/login" &&
    !request.cookies.has(ADMIN_SESSION_COOKIE)
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
