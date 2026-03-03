import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook Proxy — avoids CORS issues by making the HTTP request server-side.
 * POST /api/webhook-proxy
 * Body: { url, method, headers?, body? }
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();
    try {
        const { url, method, headers: customHeaders, body } = await request.json();

        if (!url || !method) {
            return NextResponse.json({ error: 'url and method are required' }, { status: 400 });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const fetchOptions: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...customHeaders,
            },
            signal: controller.signal,
        };

        if (!['GET', 'HEAD'].includes(method.toUpperCase()) && body) {
            fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const res = await fetch(url, fetchOptions);
        clearTimeout(timeout);

        const duration = Date.now() - startTime;
        let responseBody: any;
        try {
            responseBody = await res.json();
        } catch {
            responseBody = await res.text().catch(() => '');
        }

        return NextResponse.json({
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            duration,
            body: responseBody,
        });

    } catch (error: any) {
        const duration = Date.now() - startTime;
        if (error.name === 'AbortError') {
            return NextResponse.json({ ok: false, status: 408, statusText: 'Request Timeout', duration, error: 'Webhook timed out after 15 seconds' }, { status: 200 });
        }
        return NextResponse.json({ ok: false, status: 0, statusText: 'Network Error', duration, error: error.message }, { status: 200 });
    }
}
