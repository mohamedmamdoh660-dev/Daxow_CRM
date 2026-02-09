
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        // Forward strict headers to backend properly
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${BACKEND_URL}/api/agents?${searchParams.toString()}`, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            // Try to parse error if JSON, else text
            let errorMessage = 'Failed to fetch agents';
            try {
                const errorData = await res.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) { }

            return NextResponse.json(
                { message: errorMessage },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error GET /api/agents:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${BACKEND_URL}/api/agents`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error POST /api/agents:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
