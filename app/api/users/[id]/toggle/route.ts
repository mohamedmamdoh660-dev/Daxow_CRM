import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/backend-client';

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        const response = await fetch(`${BACKEND_URL}/api/users/${id}/toggle`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
        return NextResponse.json(await response.json());
    } catch {
        return NextResponse.json({ error: 'Failed to toggle user status' }, { status: 500 });
    }
}
