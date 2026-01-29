import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const status = {
        database: {
            connected: false,
            type: 'PostgreSQL',
            provider: 'Unknown',
            error: null as string | null,
        },
        supabaseStorage: {
            connected: false,
            configured: false,
            bucket: 'student-documents',
            error: null as string | null,
        },
    };

    // Check Database Connection
    try {
        await prisma.$queryRaw`SELECT 1`;
        status.database.connected = true;

        // Try to detect if using Supabase
        const databaseUrl = process.env.DATABASE_URL || '';
        if (databaseUrl.includes('supabase')) {
            status.database.provider = 'Supabase';
        } else if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
            status.database.provider = 'Local PostgreSQL';
        } else {
            status.database.provider = 'PostgreSQL';
        }
    } catch (error: any) {
        status.database.error = error.message || 'Connection failed';
    }

    // Check Supabase Storage Configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
        status.supabaseStorage.configured = true;

        // Try to check actual connection
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { data, error } = await supabase.storage.listBuckets();

            if (error) {
                status.supabaseStorage.error = error.message;
            } else {
                status.supabaseStorage.connected = true;

                // Check if our bucket exists
                const bucketExists = data?.some(b => b.name === 'student-documents');
                if (!bucketExists) {
                    status.supabaseStorage.error = 'Bucket "student-documents" not found';
                    status.supabaseStorage.connected = false;
                }
            }
        } catch (error: any) {
            status.supabaseStorage.error = error.message || 'Connection test failed';
        }
    } else {
        status.supabaseStorage.error = 'Missing credentials in .env';
    }

    return NextResponse.json(status);
}
