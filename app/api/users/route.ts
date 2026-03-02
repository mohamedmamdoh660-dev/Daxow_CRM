import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/backend-client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        const response = await fetch(`${BACKEND_URL}/api/users?${searchParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return NextResponse.json(error, { status: response.status });
        }
        return NextResponse.json(await response.json());
    } catch {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return NextResponse.json(error, { status: response.status });
        }
        return NextResponse.json(await response.json(), { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
