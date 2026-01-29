import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTimelineEventDto } from './dto/create-timeline-event.dto';

@Injectable()
export class TimelineService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create timeline event
     */
    async createEvent(data: CreateTimelineEventDto) {
        return this.prisma.timelineEvent.create({
            data: {
                ...data,
                metadata: data.metadata || {},
                // Set legacy fields for backward compatibility
                ...(data.entityType === 'Lead' && { leadId: data.entityId }),
                ...(data.entityType === 'Student' && { studentId: data.entityId }),
                ...(data.entityType === 'Application' && { applicationId: data.entityId }),
            },
        });
    }

    /**
     * Get timeline for specific entity
     */
    async getEntityTimeline(entityType: string, entityId: string) {
        return this.prisma.timelineEvent.findMany({
            where: {
                entityType,
                entityId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get all timeline events with filters
     */
    async findAll(filters?: {
        entityType?: string;
        entityId?: string;
        eventType?: string;
        performedBy?: string;
    }) {
        const where: any = {};

        if (filters?.entityType) where.entityType = filters.entityType;
        if (filters?.entityId) where.entityId = filters.entityId;
        if (filters?.eventType) where.eventType = filters.eventType;
        if (filters?.performedBy) where.performedBy = filters.performedBy;

        return this.prisma.timelineEvent.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            take: 100, // Limit to recent 100 events
        });
    }

    /**
     * Delete timeline event
     */
    async remove(id: string) {
        return this.prisma.timelineEvent.delete({
            where: { id },
        });
    }
}
