import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that are always accessible without authentication.
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/auth/confirm"];
const PUBLIC_PREFIXES = ["/api/webhooks/", "/_next/", "/favicon", "/sw.js", "/manifest.json"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  return false;
}

// Routes that require the user to be authenticated.
function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always update the session to keep tokens fresh, even on public routes.
  const { response, isAuthenticated } = await updateSession(request);

  // If the route requires authentication and the user is not authenticated,
  // redirect to /login while preserving the intended destination.
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If an authenticated user tries to access auth pages, send them to the
  // dashboard instead.
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico   (browser default)
     * - public assets with a file extension (.png, .svg, .ico, .webp …)
     *
     * We still run the middleware on API routes so tokens are refreshed.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js\\.map)$).*)",
  ],
};
