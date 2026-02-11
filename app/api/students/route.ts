import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        const response = await fetch(`${BACKEND_URL}/api/students?${searchParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error proxying to backend:', error);
        return NextResponse.json(
            { error: 'Failed to fetch students from backend' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('🚀 API Proxy received student creation request');

        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            console.error('❌ No access token found in cookies');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🔑 Token found, length:', token.length);

        const backendUrl = `${BACKEND_URL}/api/students`;
        console.log(`📡 Forwarding to backend: ${backendUrl}`);

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log(`📡 Backend response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Backend error (${response.status}):`, errorText);
            try {
                const errorJson = JSON.parse(errorText);
                if (Object.keys(errorJson).length === 0) {
                    console.error('⚠️ Backend returned empty error object');
                    return NextResponse.json(
                        { error: 'Registration failed. Check backend logs for details.' },
                        { status: response.status }
                    );
                }
                return NextResponse.json(errorJson, { status: response.status });
            } catch {
                return NextResponse.json({ error: errorText || 'Backend error' }, { status: response.status });
            }
        }

        const data = await response.json();
        console.log('✅ Student created successfully');
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('🔥 Proxy processing error:', error?.message, error?.stack);
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
