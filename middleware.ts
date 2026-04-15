import { NextRequest, NextResponse } from "next/server";

/**
 * Deduplicates the Origin request header before Next.js processes it.
 *
 * Problem: When OLS (OpenLiteSpeed) reverse proxy sits behind Cloudflare, the
 * Origin header can be forwarded twice — resulting in a comma-joined value like
 * "https://01.qrbir.com, https://01.qrbir.com". Next.js's Server Action CSRF
 * check calls `new URL(originHeader)` on the raw value, which throws
 * `TypeError: Invalid URL` for comma-separated strings and silently drops the
 * action.
 *
 * Fix: if the Origin value contains a comma, keep only the first (leftmost)
 * origin and discard the duplicates.
 */
export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin.includes(",")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("origin", origin.split(",")[0].trim());
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)"
};
