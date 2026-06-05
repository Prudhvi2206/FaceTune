import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/auth")
  );

  if (isPublicRoute) {
    // Redirect logged-in users away from auth pages
    if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
