import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/field-values?module=Students&field=status
 * Returns distinct values for a given module field — used in the condition builder.
 */

// Static values for fields that don't need a backend query
const STATIC_VALUES: Record<string, string[]> = {
    status_student: ['Applicant', 'Enrolled', 'Graduated', 'Withdrawn', 'Active', 'Inactive'],
    status_application: ['New', 'In Progress', 'Approved', 'Rejected', 'Withdrawn'],
    status_lead: ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'],
    stage: ['Draft', 'Submitted', 'Under Review', 'Accepted', 'Rejected', 'Enrolled'],
    gender: ['Male', 'Female'],
    type_lead: ['Individual', 'Agent'],
    ownerType: ['Direct', 'Agent'],
    isActive: ['true', 'false'],
    transferStudent: ['true', 'false'],
    haveTc: ['true', 'false'],
    blueCard: ['true', 'false'],
    budgetRange: ['< 5,000 USD', '5,000 - 15,000 USD', '15,000 - 30,000 USD', '> 30,000 USD'],
};

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const module = searchParams.get('module') || '';
    const field = searchParams.get('field') || '';

    if (!module || !field) {
        return NextResponse.json({ values: [] });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // ── Backend-sourced fields ────────────────────────────────────────────────
    type FieldSource = { endpoint: string; extract: (data: any) => string[] };
    const FIELD_SOURCES: Record<string, Record<string, FieldSource>> = {
        Students: {
            status: { endpoint: '/students/distinct/status', extract: (d) => Array.isArray(d) ? d.map(String).filter(Boolean) : [] },
            nationalityName: {
                endpoint: '/countries?pageSize=300', extract: (d) => {
                    const arr = Array.isArray(d) ? d : (d.countries || d.data || []);
                    return arr.map((c: any) => c.name || c).filter(Boolean);
                }
            },
            nationality: {
                endpoint: '/countries?pageSize=300', extract: (d) => {
                    const arr = Array.isArray(d) ? d : (d.countries || d.data || []);
                    return arr.map((c: any) => c.name || c).filter(Boolean);
                }
            },
        },
        Applications: {
            status: { endpoint: '/applications/distinct/status', extract: (d) => Array.isArray(d) ? d.map(String).filter(Boolean) : [] },
            stage: {
                endpoint: '/stages', extract: (d) => {
                    const arr = Array.isArray(d) ? d : (d.stages || d.data || []);
                    return arr.map((s: any) => s.name || s).filter(Boolean);
                }
            },
        },
        Leads: {
            status: { endpoint: '/leads/distinct/status', extract: (d) => Array.isArray(d) ? d.map(String).filter(Boolean) : [] },
            source: { endpoint: '/leads/distinct/source', extract: (d) => Array.isArray(d) ? d.map(String).filter(Boolean) : [] },
            type: { endpoint: '/leads/distinct/type', extract: (d) => Array.isArray(d) ? d.map(String).filter(Boolean) : [] },
        },
        Agents: {
            country: {
                endpoint: '/countries?pageSize=300', extract: (d) => {
                    const arr = Array.isArray(d) ? d : (d.countries || d.data || []);
                    return arr.map((c: any) => c.name || c).filter(Boolean);
                }
            },
        },
    };

    const source = FIELD_SOURCES[module]?.[field];

    if (source) {
        try {
            const res = await fetch(`${backendUrl}${source.endpoint}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                next: { revalidate: 60 },
            });
            if (res.ok) {
                const data = await res.json();
                const values = source.extract(data);
                return NextResponse.json({ values, source: 'api' });
            }
        } catch (err: any) {
            console.error('[field-values] backend error:', err.message);
        }
    }

    // ── Static fallbacks ──────────────────────────────────────────────────────
    // Try module-specific first, then generic
    const staticKey = `${field}_${module.toLowerCase()}` as keyof typeof STATIC_VALUES;
    const staticValues = STATIC_VALUES[staticKey] || STATIC_VALUES[field] || [];
    return NextResponse.json({ values: staticValues, source: 'static' });
}
