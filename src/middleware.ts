import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/session";

// First line of defence: no session, no app pages. Pages still check roles and access themselves.
export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/players/:path*",
    "/teams/:path*",
    "/drills/:path*",
    "/people/:path*",
    "/audit/:path*",
    "/notifications/:path*",
    "/account/:path*",
    "/api/reports/:path*",
    "/api/drill-videos/:path*",
    // /api/drills is deliberately excluded: middleware would buffer video uploads. It checks auth itself.
  ],
};
