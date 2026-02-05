import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl } = req
    const hostname = req.headers.get("host") || ""
    const isLoggedIn = !!req.auth
    const user = req.auth?.user as any;
    const role = user?.role;
    const userSubdomain = user?.subdomain;

    // --- 1. Subdomain Detection (Centralized) ---
    const host = hostname.split(":")[0]; // Remove port
    const isLocalhost = host.endsWith("localhost") || host === "127.0.0.1";
    const hostParts = host.split(".");

    // Subdomain logic:
    // Local: school1.localhost -> school1
    // Prod: school1.platform.com -> school1
    // Root: localhost, platform.com -> null
    const currentSubdomain = isLocalhost
        ? (hostParts.length > 1 && hostParts[0] !== 'localhost' ? hostParts[0] : null)
        : (hostParts.length > 2 ? hostParts[0] : null);

    // Prepare response and headers
    const requestHeaders = new Headers(req.headers);
    if (currentSubdomain) {
        requestHeaders.set('x-school-subdomain', currentSubdomain);
    } else {
        requestHeaders.delete('x-school-subdomain');
    }

    // --- 2. Strict Tenant Isolation & Redirection ---
    if (isLoggedIn) {
        // SUPER_ADMIN: Can access any domain, no subdomain restrictions
        if (role === 'SUPER_ADMIN') {
            // Allow superadmin to access any domain without redirect
            // They should primarily use the root domain (platform.com)
        } else {
            // Other roles: Enforce subdomain matching
            // A. Wrong Subdomain Check
            if (currentSubdomain && userSubdomain && currentSubdomain !== userSubdomain) {
                return NextResponse.redirect(new URL('/login?error=TenantMismatch', nextUrl));
            }

            // B. Root Domain Check (Redirect school users to their subdomain)
            if (!currentSubdomain && userSubdomain) {
                const protocol = isLocalhost ? 'http' : 'https';
                const port = isLocalhost ? ':3000' : '';
                const domain = isLocalhost ? 'localhost' : 'platform.com';
                return NextResponse.redirect(`${protocol}://${userSubdomain}.${domain}${port}${nextUrl.pathname}`);
            }
        }
    }

    // --- 3. Route Protection ---

    // A. Super Admin Routes
    if (nextUrl.pathname.startsWith('/super-admin')) {
        if (!isLoggedIn || role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
        // Super Admins should ideally be on the root domain
        if (currentSubdomain) {
            const protocol = isLocalhost ? 'http' : 'https';
            const port = isLocalhost ? ':3000' : '';
            const domain = isLocalhost ? 'localhost' : 'platform.com';
            return NextResponse.redirect(`${protocol}://${domain}${port}${nextUrl.pathname}`);
        }
    }

    // B. Auth Protection for other roles
    const protectedRoutes = ['/admin', '/teacher', '/student', '/driver'];
    const matchingRoute = protectedRoutes.find(route => nextUrl.pathname.startsWith(route));

    if (matchingRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));

        // Role check
        const roleRouteMap: Record<string, string> = {
            'ADMIN': '/admin',
            'TEACHER': '/teacher',
            'STUDENT': '/student',
            'DRIVER': '/driver',
            'ACCOUNTANT': '/admin/finance'
        };

        const expectedBase = roleRouteMap[role];
        if (role !== 'SUPER_ADMIN' && !nextUrl.pathname.startsWith(expectedBase)) {
            // Special case for accountant in admin
            if (role === 'ACCOUNTANT' && nextUrl.pathname.startsWith('/admin/finance')) {
                // allow
            } else {
                return NextResponse.redirect(new URL('/login', nextUrl));
            }
        }

        // Subdomain check for non-super-admins
        if (!currentSubdomain && role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
    }

    // C. Login Page Logic
    if (nextUrl.pathname === '/login') {
        if (isLoggedIn) {
            const roleRedirects: Record<string, string> = {
                'SUPER_ADMIN': '/super-admin',
                'ADMIN': '/admin',
                'TEACHER': '/teacher',
                'STUDENT': '/student',
                'DRIVER': '/driver',
                'ACCOUNTANT': '/admin/finance'
            };
            return NextResponse.redirect(new URL(roleRedirects[role] || '/', nextUrl));
        }
    }

    // Inject headers and continue
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    });
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
