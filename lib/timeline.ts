import { prisma } from '@/lib/prisma';

/**
 * Timeline Event Types
 */
export const TimelineEventTypes = {
    // Student Events
    STUDENT_CREATED: 'Student Created',
    STUDENT_UPDATED: 'Student Updated',
    STUDENT_DELETED: 'Student Deleted',
    STUDENT_STATUS_CHANGED: 'Status Changed',

    // Document Events
    DOCUMENT_UPLOADED: 'Document Uploaded',
    DOCUMENT_DELETED: 'Document Deleted',
    PHOTO_UPLOADED: 'Photo Uploaded',

    // Application Events
    APPLICATION_CREATED: 'Application Created',
    APPLICATION_UPDATED: 'Application Updated',
    APPLICATION_STATUS_CHANGED: 'Application Status Changed',

    // Lead Events
    LEAD_CREATED: 'Lead Created',
    LEAD_UPDATED: 'Lead Updated',
    LEAD_DELETED: 'Lead Deleted',
    LEAD_STATUS_CHANGED: 'Lead Status Changed',
    LEAD_CONVERTED_TO_STUDENT: 'Lead Converted to Student',
    LEAD_CONVERTED_TO_AGENT: 'Lead Converted to Agent',

    // General Events
    NOTE_ADDED: 'Note Added',
    EMAIL_SENT: 'Email Sent',
    TASK_CREATED: 'Task Created',
} as const;

export type TimelineEventType = typeof TimelineEventTypes[keyof typeof TimelineEventTypes];

/**
 * Create a timeline event
 */
export async function createTimelineEvent({
    entityType,
    entityId,
    studentId,
    leadId,
    applicationId,
    eventType,
    description,
    metadata = {},
    performedBy,
}: {
    entityType: string;
    entityId: string;
    studentId?: string;
    leadId?: string;
    applicationId?: string;
    eventType: string;
    description: string;
    metadata?: any;
    performedBy?: string;
}) {
    try {
        const event = await prisma.timelineEvent.create({
            data: {
                entityType,
                entityId,
                studentId,
                leadId,
                applicationId,
                eventType,
                description,
                metadata,
                performedBy,
            },
        });

        console.log(`✅ Timeline event created: ${eventType} for ${entityType} ${entityId}`);
        return event;
    } catch (error) {
        console.error('❌ Failed to create timeline event:', error);
        // Don't throw - timeline logging should not break the main flow
        return null;
    }
}

/**
 * Create multiple timeline events in batch
 */
export async function createTimelineEvents(events: Array<{
    entityType: string;
    entityId: string;
    studentId?: string;
    applicationId?: string;
    eventType: string;
    description: string;
    metadata?: any;
    performedBy?: string;
}>) {
    try {
        const result = await prisma.timelineEvent.createMany({
            data: events,
        });

        console.log(`✅ ${result.count} timeline events created`);
        return result;
    } catch (error) {
        console.error('❌ Failed to create timeline events:', error);
        return null;
    }
}

/**
 * Get timeline events for a student
 */
export async function getStudentTimeline(studentId: string, limit = 50) {
    return await prisma.timelineEvent.findMany({
        where: {
            studentId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    });
}

/**
 * Get timeline events for an application
 */
export async function getApplicationTimeline(applicationId: string, limit = 50) {
    return await prisma.timelineEvent.findMany({
        where: {
            applicationId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    });
}

/**
 * Helper function to log student field changes
 */
export function getChangedFields(oldData: any, newData: any): string[] {
    const changes: string[] = [];

    Object.keys(newData).forEach((key) => {
        if (oldData[key] !== newData[key] && newData[key] !== undefined) {
            changes.push(key);
        }
    });

    return changes;
}

/**
 * Format field changes for timeline description
 */
export function formatFieldChanges(changes: string[]): string {
    if (changes.length === 0) return '';
    if (changes.length === 1) return changes[0];
    if (changes.length === 2) return `${changes[0]} and ${changes[1]}`;

    const last = changes[changes.length - 1];
    const rest = changes.slice(0, -1).join(', ');
    return `${rest}, and ${last}`;
}
