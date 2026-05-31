import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies (multiple possible keys for Supabase)
  const hasAuthToken =
    request.cookies.has("sb-access-token") ||
    request.cookies.has("sb_jwt_token") ||
    request.cookies.has("sb:token");

  // Redirect authenticated users away from auth pages
  if ((pathname === "/login" || pathname === "/signup") && hasAuthToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Note: Protected routes are now handled by component-level auth checks
  // This allows more flexible redirects after session changes
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login", "/signup"],
};
