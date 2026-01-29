import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTimelineEvent, TimelineEventTypes } from '@/lib/timeline';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { studentId, leadId, applicationId, fileName, fileType, fileUrl, fileSize, storagePath } = body;

        // Validate that at least one entity ID is provided
        if (!studentId && !leadId && !applicationId) {
            return NextResponse.json(
                { error: 'Must provide studentId, leadId, or applicationId' },
                { status: 400 }
            );
        }

        if (!fileName || !fileUrl) {
            return NextResponse.json(
                { error: 'Missing required fields: fileName and fileUrl' },
                { status: 400 }
            );
        }

        // Create document record
        const document = await prisma.document.create({
            data: {
                ...(studentId && { studentId }),
                ...(leadId && { leadId }),
                ...(applicationId && { applicationId }),
                fileName,
                fileType: fileType || 'other',
                fileUrl,
                fileSize: fileSize || 0,
                metadata: storagePath ? { storagePath } : {},
            },
        });

        // Create timeline event
        if (studentId) {
            await createTimelineEvent({
                entityType: 'student',
                entityId: studentId,
                studentId,
                eventType: TimelineEventTypes.DOCUMENT_UPLOADED,
                description: `Document uploaded: ${fileName} (${fileType})`,
                metadata: {
                    fileName,
                    fileType,
                    fileSize,
                    documentId: document.id,
                },
            });
        } else if (leadId) {
            await createTimelineEvent({
                entityType: 'lead',
                entityId: leadId,
                leadId,
                eventType: 'DOCUMENT_UPLOADED',
                description: `Document uploaded: ${fileName} (${fileType})`,
                metadata: {
                    fileName,
                    fileType,
                    fileSize,
                    documentId: document.id,
                },
            });
        } else if (applicationId) {
            const application = await prisma.application.findUnique({
                where: { id: applicationId },
                select: { studentId: true },
            });

            if (application?.studentId) {
                await createTimelineEvent({
                    entityType: 'application',
                    entityId: applicationId,
                    studentId: application.studentId,
                    applicationId,
                    eventType: TimelineEventTypes.DOCUMENT_UPLOADED,
                    description: `Document uploaded: ${fileName} (${fileType})`,
                    metadata: {
                        fileName,
                        fileType,
                        fileSize,
                        documentId: document.id,
                    },
                });
            }
        }

        return NextResponse.json(document);
    } catch (error: any) {
        console.error('Error creating document:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create document' },
            { status: 500 }
        );
    }
}
