import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every matched request and
 * enforces coarse, optimistic route protection (real authorization still
 * happens per-page/per-action via getClaims()).
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Any request that doesn't already start with a supported locale segment
  // (e.g. the bare "/", or a bookmarked link missing the prefix) must be
  // redirected to the default locale FIRST — before touching Supabase or
  // any other route logic — otherwise Next has no matching page to render
  // and the request fails outright (surfaced on Vercel as a 500).
  const hasLocalePrefix = /^\/(ha|ar|en)(\/|$)/.test(pathname);
  if (!hasLocalePrefix) {
    const url = request.nextUrl.clone();
    url.pathname = `/ha${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getClaims() validates the JWT signature locally/against the
  // project's JWKS. Never rely on getSession() here for authorization.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const isAuthRoute =
    withoutLocale.startsWith("/login") ||
    withoutLocale.startsWith("/register") ||
    withoutLocale.startsWith("/forgot-password") ||
    withoutLocale.startsWith("/auth");
  const isProtectedRoute =
    withoutLocale.startsWith("/dashboard") ||
    withoutLocale.startsWith("/admin") ||
    withoutLocale.startsWith("/teacher");

  const localeMatch = pathname.match(/^\/([a-z]{2})(?=\/|$)/);
  const localePrefix = localeMatch ? localeMatch[1] : "ha";

  if (!claims && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localePrefix}/login`;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (claims && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localePrefix}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
