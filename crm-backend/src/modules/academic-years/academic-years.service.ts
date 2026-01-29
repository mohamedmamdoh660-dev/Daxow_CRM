import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { TimelineService } from '../timeline/timeline.service';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearsService {
    constructor(
        private prisma: PrismaService,
        private timelineService: TimelineService
    ) { }

    async create(createAcademicYearDto: CreateAcademicYearDto, user: string) {
        if (createAcademicYearDto.isDefault) {
            await this.prisma.academicYear.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }
        const academicYear = await this.prisma.academicYear.create({
            data: createAcademicYearDto,
        });

        await this.timelineService.createEvent({
            entityType: 'AcademicYear',
            entityId: academicYear.id,
            eventType: 'Created',
            title: 'Academic Year Created',
            description: `Academic Year "${academicYear.name}" created`,
            metadata: {},
            performedBy: user,
        });

        return academicYear;
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
            this.prisma.academicYear.findMany({
                where,
                skip,
                take,
                orderBy: [
                    { isDefault: 'desc' },
                    { name: 'asc' },
                ],
            }),
            this.prisma.academicYear.count({ where }),
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
        const academicYear = await this.prisma.academicYear.findUnique({
            where: { id },
        });

        if (!academicYear) {
            throw new NotFoundException(`Academic year with ID ${id} not found`);
        }

        return academicYear;
    }

    async update(id: string, updateAcademicYearDto: UpdateAcademicYearDto, user: string) {
        const existingYear = await this.findOne(id);

        if (updateAcademicYearDto.isDefault) {
            await this.prisma.academicYear.updateMany({
                where: {
                    isDefault: true,
                    id: { not: id }
                },
                data: { isDefault: false },
            });
        }

        const changes: Record<string, { from: any; to: any }> = {};

        // Calculate changes
        const dto = updateAcademicYearDto as any;
        const current = existingYear as any;

        Object.keys(dto).forEach((key) => {
            if (dto[key] !== undefined && dto[key] !== current[key]) {
                changes[key] = {
                    from: current[key],
                    to: dto[key],
                };
            }
        });

        const updatedYear = await this.prisma.academicYear.update({
            where: { id },
            data: updateAcademicYearDto,
        });

        try {
            if (Object.keys(changes).length > 0) {
                await this.timelineService.createEvent({
                    entityType: 'AcademicYear',
                    entityId: id,
                    eventType: 'Updated',
                    title: 'Academic Year Updated',
                    description: `Academic Year "${updatedYear.name}" updated`,
                    metadata: { changes },
                    performedBy: user,
                });
            }
        } catch (error) {
            console.error('Error creating timeline event:', error);
            // Don't throw, just log.
        }

        return updatedYear;
    }

    async remove(id: string, user: string) {
        const existingYear = await this.findOne(id);

        const deletedYear = await this.prisma.academicYear.delete({
            where: { id },
        });

        await this.timelineService.createEvent({
            entityType: 'AcademicYear',
            entityId: id,
            eventType: 'Deleted',
            title: 'Academic Year Deleted',
            description: `Academic Year "${existingYear.name}" deleted`,
            metadata: {},
            performedBy: user,
        });

        return deletedYear;
    }
}
