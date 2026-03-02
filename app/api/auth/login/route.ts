import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { BACKEND_URL } from '@/lib/backend-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Proxy to NestJS Backend (Backend expects 'username' field, not 'email')
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: body.email,  // Map email to username
                password: body.password
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { message: data.message || 'Login failed' },
                { status: res.status }
            );
        }

        // Set HttpOnly Cookie
        const response = NextResponse.json({ success: true, user: data.user });
        response.cookies.set('access_token', data.access_token, {
            httpOnly: true,
            secure: false, // Set to true when using HTTPS/SSL
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
            sameSite: 'lax'
        });

        return response;
    } catch (error: any) {
        console.error('Login proxy error DETAILS:', error?.message || error);
        console.error('Login proxy error STACK:', error?.stack);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
