import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTimelineEvent, TimelineEventTypes, getChangedFields, formatFieldChanges } from '@/lib/timeline';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                leadDocuments: true,
                timeline: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 50,
                },
            },
        });

        if (!lead) {
            return NextResponse.json(
                { error: 'Lead not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(lead);
    } catch (error: any) {
        console.error('Error fetching lead:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch lead' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if lead exists
        const existingLead = await prisma.lead.findUnique({
            where: { id },
        });

        if (!existingLead) {
            return NextResponse.json(
                { error: 'Lead not found' },
                { status: 404 }
            );
        }

        const {
            type,
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
            convertedToStudentId,
            convertedToAgentId,
            metadata,
            isActive,
        } = body;

        // Check for duplicate email (if changing email)
        if (email && email !== existingLead.email) {
            const duplicateEmail = await prisma.lead.findFirst({
                where: {
                    email,
                    id: { not: id },
                    isActive: true,
                },
            });

            if (duplicateEmail) {
                return NextResponse.json(
                    { error: `Lead with email "${email}" already exists` },
                    { status: 400 }
                );
            }
        }

        // Update lead
        const lead = await prisma.lead.update({
            where: { id },
            data: {
                type,
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
                proposedCommission: proposedCommission !== undefined ? parseFloat(proposedCommission) : undefined,
                // Common fields
                notes,
                assignedTo,
                convertedToStudentId,
                convertedToAgentId,
                metadata,
                isActive,
            },
        });

        // Track changes and create timeline event
        const changedFields = getChangedFields(existingLead, body);
        if (changedFields.length > 0) {
            const fieldList = formatFieldChanges(changedFields);
            await createTimelineEvent({
                entityType: 'lead',
                entityId: id,
                leadId: id,
                eventType: 'Lead Updated',
                description: `Lead information updated: ${fieldList}`,
                metadata: {
                    changedFields,
                    updates: body,
                },
            });
        }

        // Special event for status change
        if (status && status !== existingLead.status) {
            await createTimelineEvent({
                entityType: 'lead',
                entityId: id,
                leadId: id,
                eventType: 'Lead Status Changed',
                description: `Status changed from ${existingLead.status} to ${status}`,
                metadata: {
                    oldStatus: existingLead.status,
                    newStatus: status,
                },
            });
        }

        // Special event for conversion
        if (convertedToStudentId && !existingLead.convertedToStudentId) {
            await createTimelineEvent({
                entityType: 'lead',
                entityId: id,
                leadId: id,
                eventType: 'Lead Converted to Student',
                description: `Lead converted to student`,
                metadata: {
                    studentId: convertedToStudentId,
                },
            });
        }

        if (convertedToAgentId && !existingLead.convertedToAgentId) {
            await createTimelineEvent({
                entityType: 'lead',
                entityId: id,
                leadId: id,
                eventType: 'Lead Converted to Agent',
                description: `Lead converted to agent`,
                metadata: {
                    agentId: convertedToAgentId,
                },
            });
        }

        return NextResponse.json({ lead });
    } catch (error: any) {
        console.error('Error updating lead:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update lead' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if lead exists
        const existingLead = await prisma.lead.findUnique({
            where: { id },
        });

        if (!existingLead) {
            return NextResponse.json(
                { error: 'Lead not found' },
                { status: 404 }
            );
        }

        // Soft delete - just mark as inactive
        const lead = await prisma.lead.update({
            where: { id },
            data: {
                isActive: false,
            },
        });

        // Create timeline event
        await createTimelineEvent({
            entityType: 'lead',
            entityId: id,
            leadId: id,
            eventType: 'Lead Deleted',
            description: `Lead deleted: ${existingLead.fullName || existingLead.companyName}`,
            metadata: {},
        });

        return NextResponse.json({ success: true, lead });
    } catch (error: any) {
        console.error('Error deleting lead:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete lead' },
            { status: 500 }
        );
    }
}
