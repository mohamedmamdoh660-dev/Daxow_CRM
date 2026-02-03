import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login'];

// API routes to allow (authentication routes)
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/logout'];

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

    // Check for authentication token
    const token = request.cookies.get('access_token');

    if (!token) {
        // Redirect to login if not authenticated
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
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
