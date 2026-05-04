import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("gym_session")?.value;
  const role = request.cookies.get("gym_role")?.value;

  const isAuthed = !!session;
  const isPlatformAdmin = role === "platform_admin";

  // Redirect unauthenticated users away from protected routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/platform")) {
    if (!isAuthed) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Restrict /platform/* to platform admins only
  if (pathname.startsWith("/platform") && !isPlatformAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // Skip /login if already authenticated
  if (pathname === "/login" && isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = isPlatformAdmin ? "/platform/dashboard" : "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/platform/:path*", "/login"],
};
