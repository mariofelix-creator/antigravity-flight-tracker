import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "./types";

/**
 * Updates the Supabase session in the middleware layer.
 *
 * This must be called from the root middleware.ts so that:
 *  1. Auth tokens are refreshed on every request before they are forwarded.
 *  2. The refreshed session cookies are written to the response.
 *
 * Returns both the response (with updated cookies) and a boolean indicating
 * whether the current request has an authenticated user.
 */
export async function updateSession(
  request: NextRequest
): Promise<{ response: NextResponse; isAuthenticated: boolean }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  // Start with a plain pass-through response so we can attach refreshed cookies.
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Write cookies to both the request (for downstream server code) and
        // the response (so the browser receives the refreshed tokens).
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // getUser() validates the JWT against Supabase and refreshes if necessary.
  // Do NOT use getSession() here — it only reads the local cookie without
  // verifying with the server, which can be spoofed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, isAuthenticated: user !== null };
}
