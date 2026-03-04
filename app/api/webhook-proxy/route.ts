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

        const sentBody = !['GET', 'HEAD'].includes(method.toUpperCase()) && body !== undefined
            ? (typeof body === 'string' ? body : JSON.stringify(body))
            : undefined;

        console.log('\n🔁 [webhook-proxy] Outgoing request:');
        console.log('   URL    :', url);
        console.log('   Method :', method);
        console.log('   Body   :', sentBody?.slice(0, 500));

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Daxow-CRM/1.0',
                ...customHeaders,
            },
            body: sentBody,
            signal: controller.signal,
        });
        clearTimeout(timeout);

        const duration = Date.now() - startTime;

        const rawText = await res.text().catch(() => '');
        let responseBody: any;
        try { responseBody = JSON.parse(rawText); } catch { responseBody = rawText; }

        console.log('   Status :', res.status, res.statusText);
        console.log('   Response:', rawText.slice(0, 500));

        return NextResponse.json({
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            duration,
            body: responseBody,
        });

    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error('[webhook-proxy] Error:', error.message);
        if (error.name === 'AbortError') {
            return NextResponse.json({ ok: false, status: 408, statusText: 'Request Timeout', duration, error: 'Webhook timed out after 15 seconds' }, { status: 200 });
        }
        return NextResponse.json({ ok: false, status: 0, statusText: 'Network Error', duration, error: error.message }, { status: 200 });
    }
}
