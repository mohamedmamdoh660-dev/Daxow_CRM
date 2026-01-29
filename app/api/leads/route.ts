import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTimelineEvent, TimelineEventTypes } from '@/lib/timeline';
import { generateLeadId } from '@/lib/id-generator';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '0');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const searchQuery = searchParams.get('search') || '';
        const type = searchParams.get('type') || ''; // "Student" or "Agent"
        const status = searchParams.get('status') || '';

        const skip = page * pageSize;

        // Build where clause
        const where: any = {
            isActive: true,
        };

        if (searchQuery) {
            where.OR = [
                { fullName: { contains: searchQuery, mode: 'insensitive' as const } },
                { email: { contains: searchQuery, mode: 'insensitive' as const } },
                { phone: { contains: searchQuery, mode: 'insensitive' as const } },
                { companyName: { contains: searchQuery, mode: 'insensitive' as const } },
            ];
        }

        if (type) {
            where.type = type;
        }

        if (status) {
            where.status = status;
        }

        const [leads, totalCount] = await Promise.all([
            prisma.lead.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.lead.count({ where }),
        ]);

        return NextResponse.json({ leads, totalCount });
    } catch (error: any) {
        console.error('Error fetching leads:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch leads' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            type, // "Student" or "Agent"
            status,
            source,
            // Student Lead fields
            fullName,
            email,
            phone,
            country,
            preferredIntake,
            preferredCountries,
            budgetRange,
            // Agent Lead fields
            companyName,
            contactPerson,
            city,
            estimatedStudents,
            proposedCommission,
            // Common fields
            notes,
            assignedTo,
            metadata,
        } = body;

        // Validate required fields
        if (!type || !['Student', 'Agent'].includes(type)) {
            return NextResponse.json(
                { error: 'Type is required and must be "Student" or "Agent"' },
                { status: 400 }
            );
        }

        // Type-specific validation
        if (type === 'Student' && !fullName) {
            return NextResponse.json(
                { error: 'Full name is required for Student leads' },
                { status: 400 }
            );
        }

        if (type === 'Agent' && (!companyName || !contactPerson)) {
            return NextResponse.json(
                { error: 'Company name and contact person are required for Agent leads' },
                { status: 400 }
            );
        }

        // Check for duplicate email
        if (email) {
            const existingLead = await prisma.lead.findFirst({
                where: {
                    email,
                    isActive: true,
                },
            });

            if (existingLead) {
                return NextResponse.json(
                    { error: `Lead with email "${email}" already exists` },
                    { status: 400 }
                );
            }
        }

        // Generate lead ID
        const leadId = await generateLeadId();

        // Create lead
        const lead = await prisma.lead.create({
            data: {
                leadId,
                type,
                status: status || 'New',
                source,
                // Student Lead fields
                fullName,
                email,
                phone,
                country,
                preferredIntake,
                preferredCountries: preferredCountries || [],
                budgetRange,
                // Agent Lead fields
                companyName,
                contactPerson,
                city,
                estimatedStudents,
                proposedCommission: proposedCommission ? parseFloat(proposedCommission) : undefined,
                // Common fields
                notes,
                assignedTo,
                metadata: metadata || {},
            },
        });

        // Create timeline event
        await createTimelineEvent({
            entityType: 'lead',
            entityId: lead.id,
            leadId: lead.id,
            eventType: type === 'Student' ? 'Student Lead Created' : 'Agent Lead Created',
            description: `${type} lead created: ${fullName || companyName}`,
            metadata: {
                leadId: lead.leadId,
                type,
                source,
            },
        });

        return NextResponse.json({ lead }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating lead:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create lead' },
            { status: 500 }
        );
    }
}
