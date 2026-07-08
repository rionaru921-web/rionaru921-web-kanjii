import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ONLY_ROUTES = ["/login", "/signup"];

// Deny-list: only these paths (and their subpaths) require a signed-in user.
// Everything else — including URLs that don't exist — passes through so
// Next.js can render them normally (e.g. not-found.tsx for a 404).
const PROTECTED_ROUTES = ["/dashboard", "/nomikai", "/travel", "/history", "/settings"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // IMPORTANT: getUser() revalidates the session against Supabase Auth on
  // every request — don't swap this for getSession(), which only reads the
  // (possibly stale/forged) cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.includes(pathname);
  const isConfirmed = !!user?.email_confirmed_at;

  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Belt-and-suspenders: even if a session slipped through with an
  // unconfirmed email (e.g. Supabase's "Confirm email" setting is
  // misconfigured), never let it reach protected pages.
  if (user && !isConfirmed && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("verify", "required");
    return NextResponse.redirect(url);
  }

  if (user && isConfirmed && isAuthOnlyRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
