import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function POST(request: NextRequest) {
    try {
        const { url, key } = await request.json();

        if (!url || !key) {
            return NextResponse.json(
                { error: 'URL and Key are required' },
                { status: 400 }
            );
        }

        // Validate URL format
        if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
            return NextResponse.json(
                { error: 'Invalid Supabase URL format' },
                { status: 400 }
            );
        }

        // Save to database
        await prisma.$transaction(async (tx: any) => {
            // Update or create SUPABASE_URL
            await tx.setting.upsert({
                where: { key: 'SUPABASE_URL' },
                update: { value: url },
                create: {
                    key: 'SUPABASE_URL',
                    value: url,
                    category: 'integration',
                    isPublic: false,
                },
            });

            // Update or create SUPABASE_SERVICE_KEY
            await tx.setting.upsert({
                where: { key: 'SUPABASE_SERVICE_KEY' },
                update: { value: key },
                create: {
                    key: 'SUPABASE_SERVICE_KEY',
                    value: key, // TODO: Encrypt in production
                    category: 'integration',
                    isPublic: false,
                },
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error saving Supabase credentials:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save credentials' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const settings = await prisma.setting.findMany({
            where: {
                key: {
                    in: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'],
                },
            },
        });

        // value is Json type, could be string or object
        const urlSetting = settings.find((s: any) => s.key === 'SUPABASE_URL');
        const keySetting = settings.find((s: any) => s.key === 'SUPABASE_SERVICE_KEY');

        const url = typeof urlSetting?.value === 'string' ? urlSetting.value : '';
        const key = typeof keySetting?.value === 'string' ? keySetting.value : '';

        return NextResponse.json({
            url,
            hasKey: !!key,
        });
    } catch (error: any) {
        console.error('Error fetching Supabase credentials:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch credentials' },
            { status: 500 }
        );
    }
}
