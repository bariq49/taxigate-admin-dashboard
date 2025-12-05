/**
 * Next.js Middleware
 * Protects routes and handles authentication
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot"];
const authRoutes = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get access token from cookies
  const accessToken = request.cookies.get("access_token")?.value;
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  
  // Dashboard routes that require authentication
  // Route groups like (dashboard) don't appear in the pathname, so we check for /dashboard
  const isDashboardRoute = pathname.startsWith("/dashboard");
  
  // Also check for other protected routes (you can add more here)
  const isProtectedRoute = isDashboardRoute;
  
  // If user is accessing auth routes and is already authenticated, redirect to dashboard
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // If user is accessing protected routes and is not authenticated, redirect to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL("/auth/login", request.url);
    // Store the attempted URL to redirect after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Allow access to public routes and authenticated dashboard routes
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};

