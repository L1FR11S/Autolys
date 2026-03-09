import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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

    // Refresh auth session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protect dashboard routes — redirect to login if not authenticated
    const isDashboardRoute =
        request.nextUrl.pathname.startsWith("/feed") ||
        request.nextUrl.pathname.startsWith("/explore") ||
        request.nextUrl.pathname.startsWith("/watchlist") ||
        request.nextUrl.pathname.startsWith("/company") ||
        request.nextUrl.pathname.startsWith("/profile");

    if (!user && isDashboardRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // Redirect logged-in users away from auth pages
    const isAuthRoute =
        request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/register";

    if (user && isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/feed";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
