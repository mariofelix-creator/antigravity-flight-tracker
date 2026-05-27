import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/callback
 *
 * Handles the OAuth / magic-link callback from Supabase Auth.
 * Supabase redirects here with a `code` query parameter (PKCE flow).
 * We exchange that code for a session and then redirect the user to
 * either the intended destination or the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Surface any auth errors from the provider back to the login page.
  if (error) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", error);
    if (errorDescription) {
      loginUrl.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    // No code and no error — something unexpected happened.
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const supabase = await createServerClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[auth/callback] Code exchange failed:", exchangeError.message);
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "code_exchange_failed");
    loginUrl.searchParams.set("error_description", exchangeError.message);
    return NextResponse.redirect(loginUrl);
  }

  // Ensure the redirect target is relative (prevent open-redirect attacks).
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  return NextResponse.redirect(new URL(safeNext, origin));
}
