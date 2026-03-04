import { NextRequest, NextResponse } from 'next/server';

/**
 * Local Webhook Test Listener
 * Use URL: http://localhost:3000/api/webhook-test
 *
 * Accepts any method + any body, logs it, and returns 200.
 * Perfect for testing CRM buttons without a real n8n setup.
 */

// Keep last 50 received payloads in memory
const receivedWebhooks: { id: string; timestamp: string; method: string; query: Record<string, string>; body: any }[] = [];

async function handler(request: NextRequest) {
    const method = request.method;
    const query = Object.fromEntries(request.nextUrl.searchParams.entries());

    let body: any = null;
    try {
        const text = await request.text();
        if (text) {
            try { body = JSON.parse(text); } catch { body = text; }
        }
    } catch { /* empty body */ }

    const entry = {
        id: crypto.randomUUID().slice(0, 8),
        timestamp: new Date().toISOString(),
        method,
        query,
        body,
    };

    receivedWebhooks.unshift(entry);
    if (receivedWebhooks.length > 50) receivedWebhooks.pop();

    console.log('\n🔔 [Webhook Test] Received request:');
    console.log('   Method:', method);
    console.log('   Query:', query);
    console.log('   Body:', JSON.stringify(body, null, 2));

    return NextResponse.json({
        ok: true,
        message: 'Webhook received successfully ✅',
        received: entry,
        total: receivedWebhooks.length,
    }, { status: 200 });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
