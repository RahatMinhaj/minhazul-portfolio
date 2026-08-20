import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Soft gate for `/admin/*`: redirects to login when the session cookie is
 * missing. Cookie *presence* is not proof of a valid session — that is
 * enforced by `requireAdmin()` in the protected layout and every Server Action.
 *
 * Edge middleware cannot cheaply verify the hashed DB session without a round
 * trip; keep this check lightweight and treat layout/actions as authoritative.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const hasSessionCookie = request.cookies.has(ADMIN_SESSION_COOKIE);

  if (!isLogin && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Cookie present but session may be expired/revoked — still allow through;
  // protected layout will redirect after DB verification.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
