import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Inject the current pathname so server components
  // (e.g. app/admin/layout.tsx) can read it via headers().
  response.headers.set(
    "x-next-pathname",
    request.nextUrl.pathname,
  );

  return response;
}

export const config = {
  // Run on admin routes so the admin layout can detect
  // /admin/login and skip the auth guard.
  matcher: ["/admin/:path*"],
};
