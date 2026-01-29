import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: Request) {
    const { searchParams, pathname } = new URL(request.url);

    // Extract entityType and entityId from path if present
    // Format: /api/timeline/Lead/abc123
    const pathParts = pathname.split('/').filter(Boolean);
    let endpoint = `${BACKEND_URL}/api/timeline`;

    if (pathParts.length >= 4) {
        // Has entityType and entityId in path
        const entityType = pathParts[2];
        const entityId = pathParts[3];
        endpoint = `${BACKEND_URL}/api/timeline/${entityType}/${entityId}`;
    } else {
        // Use query params
        const queryString = searchParams.toString();
        if (queryString) {
            endpoint = `${endpoint}?${queryString}`;
        }
    }

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching timeline:', error);
        return NextResponse.json(
            { error: 'Failed to fetch timeline' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/api/timeline`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error creating timeline event:', error);
        return NextResponse.json(
            { error: 'Failed to create timeline event' },
            { status: 500 }
        );
    }
}
