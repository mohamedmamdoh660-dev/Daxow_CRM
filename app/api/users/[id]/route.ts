import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/backend-client';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        const response = await fetch(`${BACKEND_URL}/api/users/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
        return NextResponse.json(await response.json());
    } catch {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/api/users/${id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
        return NextResponse.json(await response.json());
    } catch {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        const { searchParams } = new URL(request.url);
        const transferToId = searchParams.get('transferToId');

        const url = transferToId
            ? `${BACKEND_URL}/api/users/${id}?transferToId=${transferToId}`
            : `${BACKEND_URL}/api/users/${id}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
        return NextResponse.json(await response.json());
    } catch {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
