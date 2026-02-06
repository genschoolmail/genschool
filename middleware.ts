import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl, method } = req
    const hostname = req.headers.get("host") || ""
    const isLoggedIn = !!req.auth
    const user = req.auth?.user as any;
    const role = user?.role;
    const userSubdomain = user?.subdomain;

    if (method === 'POST') {
        console.log(`[MIDDLEWARE_TRACE] POST ${nextUrl.pathname} | Host: ${hostname} | LoggedIn: ${isLoggedIn} | Role: ${role} | UserSubdomain: ${userSubdomain}`);
    }

    // --- 1. Subdomain Detection (Centralized) ---
    const host = hostname.split(":")[0]; // Remove port
    const isLocalhost = host.endsWith("localhost") || host === "127.0.0.1";
    const hostParts = host.split(".");

    // Subdomain logic:
    // Local: school1.localhost -> school1
    // Prod: school1.genschoolmail.in -> school1
    // Root: localhost, genschoolmail.in -> null

    // Determine parts for subdomain detection
    const parts = host.split(".");
    let currentSubdomain = null;

    if (isLocalhost) {
        // school1.localhost -> school1
        if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
            currentSubdomain = parts[0] === 'localhost' ? null : parts[0];
        }
    } else {
        // school1.genschoolmail.in -> school1
        // we assume the top 2 parts are the domain (e.g. genschoolmail.in)
        if (parts.length > 2) {
            currentSubdomain = parts[0];
        }
    }

    if (currentSubdomain === 'www') currentSubdomain = null;

    // Determine Base Domain for redirects
    const protocol = isLocalhost ? 'http' : 'https';
    const port = isLocalhost ? ':3000' : '';
    const baseDomain = process.env.BASE_DOMAIN || (isLocalhost ? 'localhost' : (parts.length > 2 ? parts.slice(1).join('.') : host));

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
                return NextResponse.redirect(`${protocol}://${userSubdomain}.${baseDomain}${port}${nextUrl.pathname}`);
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
            return NextResponse.redirect(`${protocol}://${baseDomain}${port}${nextUrl.pathname}`);
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
