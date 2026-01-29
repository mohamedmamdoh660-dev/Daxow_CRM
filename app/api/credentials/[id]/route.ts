import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';

// GET - Get single credential
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const credential = await prisma.setting.findUnique({
            where: { id },
        });

        if (!credential || credential.category !== 'credentials') {
            return NextResponse.json(
                { error: 'Credential not found' },
                { status: 404 }
            );
        }

        const value = credential.value as any;
        const decryptedCreds = JSON.parse(decrypt(value.encryptedCredentials));

        return NextResponse.json({
            credential: {
                id: credential.id,
                provider: value.provider,
                name: value.name,
                credentials: decryptedCreds,
                tag: value.tag || 'personal',
                lastUsed: value.lastUsed ? new Date(value.lastUsed) : null,
                createdAt: credential.createdAt,
                updatedAt: credential.updatedAt,
            },
        });
    } catch (error: any) {
        console.error(`Error in GET /api/credentials/${id}:`, error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch credential' },
            { status: 500 }
        );
    }
}

// PATCH - Update credential
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { name, credentials, tag } = body;

        const existing = await prisma.setting.findUnique({
            where: { id },
        });

        if (!existing || existing.category !== 'credentials') {
            return NextResponse.json(
                { error: 'Credential not found' },
                { status: 404 }
            );
        }

        const value = existing.value as any;

        // Encrypt new credentials
        const encryptedCredentials = credentials
            ? encrypt(JSON.stringify(credentials))
            : value.encryptedCredentials;

        // Update
        await prisma.setting.update({
            where: { id },
            data: {
                value: {
                    ...value,
                    name: name || value.name,
                    encryptedCredentials,
                    tag: tag || value.tag,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating credential:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update credential' },
            { status: 500 }
        );
    }
}

// DELETE - Delete credential
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const credential = await prisma.setting.findUnique({
            where: { id },
        });

        if (!credential || credential.category !== 'credentials') {
            return NextResponse.json(
                { error: 'Credential not found' },
                { status: 404 }
            );
        }

        await prisma.setting.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting credential:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete credential' },
            { status: 500 }
        );
    }
}
