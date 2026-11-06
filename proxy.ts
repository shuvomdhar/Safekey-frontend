import { NextResponse, type NextRequest } from "next/server";

/**
 * Safety net for OAuth redirects that land on the site root.
 *
 * Supabase sends the browser to the project's **Site URL** whenever the
 * requested `redirect_to` is not in the Redirect URLs allowlist. That turns
 * `https://app.example.com/?code=…` into a dead end, because only
 * `/auth/callback` exchanges the PKCE code.
 *
 * The real fix is the Supabase URL Configuration; this redirect keeps sign-in
 * working even when that setting drifts back to the bare origin.
 */
export function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  if (
    !searchParams.has("code") &&
    !searchParams.has("error") &&
    !searchParams.has("error_description")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";

  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/",
};
