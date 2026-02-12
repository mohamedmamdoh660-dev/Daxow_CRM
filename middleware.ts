import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login'];

// API routes to allow (authentication routes)
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/logout'];

/**
 * 🔐 Security: Validate JWT token structure and expiration
 * This is a lightweight check - full validation happens on the backend
 */
function isValidJwtStructure(token: string): boolean {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        // Decode payload (middle part) to check expiration
        const payload = JSON.parse(atob(parts[1]));

        // Check if token has expired
        if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp < now) return false;
        }

        // Check required fields exist
        if (!payload.sub || !payload.email) return false;

        return true;
    } catch {
        return false;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public API routes
    if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internal routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') // files like favicon.ico, images, etc.
    ) {
        return NextResponse.next();
    }

    // Allow public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    // 🔐 Security: Check for authentication token AND validate its structure
    const token = request.cookies.get('access_token');

    if (!token || !isValidJwtStructure(token.value)) {
        // Clear invalid token cookie
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(loginUrl);

        // If token exists but is invalid/expired, clear it
        if (token) {
            response.cookies.delete('access_token');
        }

        return response;
    }

    // Allow authenticated requests
    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
