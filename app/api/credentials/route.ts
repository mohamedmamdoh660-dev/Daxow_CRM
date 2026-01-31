import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { CREDENTIAL_PROVIDERS } from '@/lib/credential-types';

// GET - List all credentials
export async function GET() {
    try {
        const credentials = await prisma.setting.findMany({
            where: {
                category: 'credentials',
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Decrypt credentials for display
        const decryptedCredentials = credentials.map((cred: any) => {
            const value = cred.value as any;

            try {
                const decryptedCreds = JSON.parse(decrypt(value.encryptedCredentials));

                return {
                    id: cred.id,
                    provider: value.provider,
                    name: value.name,
                    credentials: decryptedCreds,
                    tag: value.tag || 'personal',
                    lastUsed: value.lastUsed ? new Date(value.lastUsed) : null,
                    createdAt: cred.createdAt,
                    updatedAt: cred.updatedAt,
                };
            } catch (error) {
                console.error('Error decrypting credential:', error);
                return null;
            }
        }).filter(Boolean);

        return NextResponse.json({ credentials: decryptedCredentials });
    } catch (error: any) {
        console.error('Error fetching credentials:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch credentials' },
            { status: 500 }
        );
    }
}

// POST - Create new credential
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { provider, name, credentials, tag } = body;

        if (!provider || !name || !credentials) {
            return NextResponse.json(
                { error: 'Provider, name, and credentials are required' },
                { status: 400 }
            );
        }

        // Validate provider exists
        const providerConfig = CREDENTIAL_PROVIDERS.find(p => p.id === provider);
        if (!providerConfig) {
            return NextResponse.json(
                { error: 'Invalid provider' },
                { status: 400 }
            );
        }

        // Validate required fields
        const missingFields = providerConfig.fields
            .filter(f => f.required)
            .filter(f => !credentials[f.name]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.map(f => f.label).join(', ')}` },
                { status: 400 }
            );
        }

        // Encrypt credentials
        const encryptedCredentials = encrypt(JSON.stringify(credentials));

        // Save to database
        const credential = await prisma.setting.create({
            data: {
                key: `credential_${provider}_${Date.now()}`,
                value: {
                    provider,
                    name,
                    encryptedCredentials,
                    tag: tag || 'personal',
                    lastUsed: null,
                },
                category: 'credentials',
                isPublic: false,
            },
        });

        return NextResponse.json({
            success: true,
            credential: {
                id: credential.id,
                provider,
                name,
                tag: tag || 'personal',
            },
        });
    } catch (error: any) {
        console.error('Error creating credential:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create credential' },
            { status: 500 }
        );
    }
}
