import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(
        private prisma: PrismaService,
        private timeline: TimelineService,
    ) { }

    async findAll(filters?: {
        entityType?: string;
        entityId?: string;
        status?: string;
        assignedTo?: string;
    }) {
        const where: any = {};

        if (filters?.entityType) where.entityType = filters.entityType;
        if (filters?.entityId) where.entityId = filters.entityId;
        if (filters?.status) where.status = filters.status;
        if (filters?.assignedTo) where.assignedTo = filters.assignedTo;

        return this.prisma.task.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                application: {
                    select: {
                        id: true,
                        studentId: true,
                        programId: true,
                        status: true,
                    },
                },
            },
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return task;
    }

    async create(createTaskDto: CreateTaskDto) {
        try {
            console.log('📝 Creating task with DTO:', JSON.stringify(createTaskDto, null, 2));

            // Auto-set entityType and entityId if applicationId provided (backward compatibility)
            if (createTaskDto.applicationId && !createTaskDto.entityType) {
                createTaskDto.entityType = 'Application';
                createTaskDto.entityId = createTaskDto.applicationId;
            }

            console.log('📝 After processing:', JSON.stringify(createTaskDto, null, 2));

            const task = await this.prisma.task.create({
                data: {
                    ...createTaskDto,
                    metadata: createTaskDto.metadata || {},
                },
            });

            console.log('✅ Task created:', task.id);

            // 🎯 Auto-create timeline event
            if (task.entityType && task.entityId) {
                console.log('📝 Creating timeline event for:', task.entityType, task.entityId);
                await this.timeline.createEvent({
                    entityType: task.entityType,
                    entityId: task.entityId,
                    eventType: 'task_created',
                    title: 'Task Created',
                    description: `New task: ${task.title}`,
                    metadata: {
                        taskId: task.id,
                        priority: task.priority,
                        dueDate: task.dueDate,
                    },
                    performedBy: task.createdBy || undefined,
                });
                console.log('✅ Timeline event created');
            } else {
                console.warn(`⚠️  Task ${task.id} has no entityType/entityId - skipping timeline event`);
            }

            return task;
        } catch (error) {
            console.error('❌ Error creating task:', error);
            console.error('Stack:', error.stack);
            throw error;
        }
    }

    async update(id: string, updateTaskDto: UpdateTaskDto) {
        // Check if task exists and get full object
        const existingTask = await this.prisma.task.findUnique({
            where: { id },
        });

        if (!existingTask) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        const task = await this.prisma.task.update({
            where: { id },
            data: updateTaskDto,
        });

        // 🎯 Timeline event for update
        if (task.entityType && task.entityId) {
            // Build detailed description of changes
            const changes: string[] = [];

            if (updateTaskDto.status && updateTaskDto.status !== existingTask.status) {
                changes.push(`Status: ${existingTask.status} → ${updateTaskDto.status}`);
            }
            if (updateTaskDto.priority && updateTaskDto.priority !== existingTask.priority) {
                changes.push(`Priority: ${existingTask.priority} → ${updateTaskDto.priority}`);
            }
            if (updateTaskDto.description && updateTaskDto.description !== existingTask.description) {
                changes.push(`Description updated`);
            }
            if (updateTaskDto.dueDate) {
                const oldDate = existingTask.dueDate ? new Date(existingTask.dueDate).toLocaleDateString() : 'None';
                const newDate = new Date(updateTaskDto.dueDate).toLocaleDateString();
                if (oldDate !== newDate) {
                    changes.push(`Due Date: ${oldDate} → ${newDate}`);
                }
            }
            if (updateTaskDto.assignedTo && updateTaskDto.assignedTo !== existingTask.assignedTo) {
                changes.push(`Assigned: ${existingTask.assignedTo || 'Unassigned'} → ${updateTaskDto.assignedTo}`);
            }

            const changesDescription = changes.length > 0
                ? changes.join(', ')
                : 'Task details updated';

            await this.timeline.createEvent({
                entityType: task.entityType,
                entityId: task.entityId,
                eventType: 'task_updated',
                title: 'Task Updated',
                description: `${task.title}: ${changesDescription}`,
                metadata: {
                    taskId: task.id,
                    changes: updateTaskDto,
                    detailedChanges: changes,
                },
            });

            // 🎯 Special event for completion
            if (updateTaskDto.status === 'Completed' && existingTask.status !== 'Completed') {
                const metadata = task.metadata as any;
                const outcome = metadata?.outcome || 'unknown';
                const notes = metadata?.completionNotes || '';

                await this.timeline.createEvent({
                    entityType: task.entityType,
                    entityId: task.entityId,
                    eventType: 'task_completed',
                    title: 'Task Completed',
                    description: `${task.title} marked as ${outcome}${notes ? ': ' + notes : ''}`,
                    metadata: {
                        taskId: task.id,
                        outcome,
                        completionNotes: notes,
                    },
                });
            }
        } else {
            console.warn(`Task ${task.id} has no entityType/entityId - skipping timeline event`);
        }

        return task;
    }

    async remove(id: string) {
        // Get full task before deleting
        const task = await this.prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        const deleted = await this.prisma.task.delete({
            where: { id },
        });

        // 🎯 Timeline event for deletion
        if (task.entityType && task.entityId) {
            await this.timeline.createEvent({
                entityType: task.entityType,
                entityId: task.entityId,
                eventType: 'task_deleted',
                title: 'Task Deleted',
                description: `Task deleted: ${task.title}`,
                metadata: {
                    taskId: task.id,
                },
            });
        }

        return deleted;
    }

    // Helper method to get tasks for a specific entity
    async findByEntity(entityType: string, entityId: string) {
        return this.prisma.task.findMany({
            where: {
                entityType,
                entityId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
