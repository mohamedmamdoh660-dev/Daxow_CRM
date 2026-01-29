import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const { provider, credentials } = await request.json();

        if (!provider || !credentials) {
            return NextResponse.json(
                { error: 'Provider and credentials are required' },
                { status: 400 }
            );
        }

        let testResult = false;
        let errorMessage = '';

        // Test connection based on provider
        switch (provider) {
            case 'supabase':
                testResult = await testSupabaseConnection(credentials);
                break;

            case 'postgresql':
                testResult = await testPostgreSQLConnection(credentials);
                break;

            case 'smtp':
                testResult = await testSMTPConnection(credentials);
                break;

            case 'api_key':
                // For API keys, just validate the format
                testResult = !!credentials.apiKey && !!credentials.apiUrl;
                break;

            default:
                return NextResponse.json(
                    { error: 'Unknown provider' },
                    { status: 400 }
                );
        }

        if (testResult) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: errorMessage || 'Connection test failed' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Connection test error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to test connection' },
            { status: 500 }
        );
    }
}

async function testSupabaseConnection(credentials: any): Promise<boolean> {
    try {
        // Support both old and new field names
        const projectUrl = credentials.projectUrl || credentials.url;
        const serviceRoleKey = credentials.serviceRoleKey || credentials.serviceKey;

        if (!projectUrl || !serviceRoleKey) {
            console.error('Missing Supabase credentials:', { projectUrl: !!projectUrl, serviceRoleKey: !!serviceRoleKey });
            return false;
        }

        // Create a Supabase client with the provided credentials
        const supabase = createClient(projectUrl, serviceRoleKey);

        // Try to list buckets as a connection test
        const { data, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Supabase test error:', error);
        return false;
    }
}

async function testPostgreSQLConnection(credentials: any): Promise<boolean> {
    // TODO: Implement PostgreSQL connection test
    // For now, just validate that all required fields are present
    const { host, port, database, username, password } = credentials;
    return !!(host && port && database && username && password);
}

async function testSMTPConnection(credentials: any): Promise<boolean> {
    // TODO: Implement SMTP connection test
    // For now, just validate that all required fields are present
    const { host, port, username, password } = credentials;
    return !!(host && port && username && password);
}
