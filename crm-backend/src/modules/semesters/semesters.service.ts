import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { TimelineService } from '../timeline/timeline.service';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Injectable()
export class SemestersService {
    constructor(
        private prisma: PrismaService,
        private timelineService: TimelineService
    ) { }

    async create(createSemesterDto: CreateSemesterDto, user: string) {
        if (createSemesterDto.isDefault) {
            await this.prisma.semester.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }
        const semester = await this.prisma.semester.create({
            data: createSemesterDto,
        });

        await this.timelineService.createEvent({
            entityType: 'Semester',
            entityId: semester.id,
            eventType: 'Created',
            title: 'Semester Created',
            description: `Semester "${semester.name}" created`,
            metadata: {},
            performedBy: user,
        });

        return semester;
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        search?: string;
        isActive?: boolean;
    }) {
        const { skip = 0, take = 10, search, isActive } = params || {};

        const where: any = {};

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            };
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [data, total] = await Promise.all([
            this.prisma.semester.findMany({
                where,
                skip,
                take,
                orderBy: [
                    { isDefault: 'desc' },
                    { name: 'asc' },
                ],
            }),
            this.prisma.semester.count({ where }),
        ]);

        return {
            data,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
            totalPages: Math.ceil(total / take),
        };
    }

    async findOne(id: string) {
        const semester = await this.prisma.semester.findUnique({
            where: { id },
        });

        if (!semester) {
            throw new NotFoundException(`Semester with ID ${id} not found`);
        }

        return semester;
    }

    async update(id: string, updateSemesterDto: UpdateSemesterDto, user: string) {
        const existingSemester = await this.findOne(id);

        if (updateSemesterDto.isDefault) {
            await this.prisma.semester.updateMany({
                where: {
                    isDefault: true,
                    id: { not: id }
                },
                data: { isDefault: false },
            });
        }

        const changes: Record<string, { from: any; to: any }> = {};

        // Calculate changes
        const dto = updateSemesterDto as any;
        const current = existingSemester as any;

        Object.keys(dto).forEach((key) => {
            if (dto[key] !== undefined && dto[key] !== current[key]) {
                changes[key] = {
                    from: current[key],
                    to: dto[key],
                };
            }
        });

        const updatedSemester = await this.prisma.semester.update({
            where: { id },
            data: updateSemesterDto,
        });

        try {
            if (Object.keys(changes).length > 0) {
                await this.timelineService.createEvent({
                    entityType: 'Semester',
                    entityId: id,
                    eventType: 'Updated',
                    title: 'Semester Updated',
                    description: `Semester "${updatedSemester.name}" updated`,
                    metadata: { changes },
                    performedBy: user,
                });
            }
        } catch (error) {
            console.error('Error creating timeline event:', error);
            // Don't throw, just log so the update succeeds even if timeline fails
        }

        return updatedSemester;
    }

    async remove(id: string, user: string) {
        const existingSemester = await this.findOne(id);

        const deletedSemester = await this.prisma.semester.delete({
            where: { id },
        });

        await this.timelineService.createEvent({
            entityType: 'Semester',
            entityId: id,
            eventType: 'Deleted',
            title: 'Semester Deleted',
            description: `Semester "${existingSemester.name}" deleted`,
            metadata: {},
            performedBy: user,
        });

        return deletedSemester;
    }
}
