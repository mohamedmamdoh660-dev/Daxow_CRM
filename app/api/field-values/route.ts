import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/field-values?module=Students&field=status
 * Returns distinct values for a given module field — used in button condition builder.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const module = searchParams.get('module');
    const field = searchParams.get('field');

    if (!module || !field) {
        return NextResponse.json({ values: [] });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Map module+field to a known API endpoint + response extraction
    const FIELD_SOURCES: Record<string, Record<string, { endpoint: string; extract: (data: any) => string[] }>> = {
        Students: {
            status: {
                endpoint: '/students/distinct/status',
                extract: (d) => Array.isArray(d) ? d.map(String) : [],
            },
            nationality: {
                endpoint: '/countries',
                extract: (d) => Array.isArray(d) ? d.map((c: any) => c.name || c) : [],
            },
        },
        Leads: {
            status: {
                endpoint: '/leads/distinct/status',
                extract: (d) => Array.isArray(d) ? d.map(String) : [],
            },
            source: {
                endpoint: '/leads/distinct/source',
                extract: (d) => Array.isArray(d) ? d.map(String) : [],
            },
        },
    };

    const source = FIELD_SOURCES[module]?.[field];
    if (!source) {
        // Return static fallback values for common fields
        const STATIC_FALLBACKS: Record<string, string[]> = {
            status: ['Active', 'Inactive', 'Applicant', 'Enrolled', 'Graduated', 'Withdrawn',
                'New', 'Contacted', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'],
            creatorType: ['Staff', 'Agent', 'Admin'],
        };
        return NextResponse.json({ values: STATIC_FALLBACKS[field] || [], source: 'static' });
    }

    try {
        const res = await fetch(`${backendUrl}${source.endpoint}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            next: { revalidate: 60 }, // cache for 60 seconds
        });

        if (!res.ok) {
            return NextResponse.json({ values: [], error: `Backend returned ${res.status}` });
        }

        const data = await res.json();
        const values = source.extract(data);
        return NextResponse.json({ values, source: 'api' });
    } catch (err: any) {
        console.error('[field-values]', err.message);
        return NextResponse.json({ values: [], error: err.message });
    }
}
