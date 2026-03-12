import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const roles = await prisma.role.findMany({
            include: {
                permissions: true,
            },
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, permissions } = body;

        const role = await prisma.role.create({
            data: {
                name,
                description,
                permissions: permissions?.length
                    ? {
                        createMany: {
                            data: permissions.map((p: any) => ({
                                module: p.module,
                                action: p.action,
                            })),
                        },
                    }
                    : undefined,
            },
            include: { permissions: true },
        });

        return NextResponse.json(role, { status: 201 });
    } catch (error) {
        console.error('Error creating role:', error);
        return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }
}
