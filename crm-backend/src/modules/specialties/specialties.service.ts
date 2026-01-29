import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@Injectable()
export class SpecialtiesService {
    constructor(private prisma: PrismaService) { }

    async create(createSpecialtyDto: CreateSpecialtyDto) {
        return this.prisma.specialty.create({
            data: createSpecialtyDto,
            include: {
                faculty: true,
            },
        });
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        search?: string;
        facultyId?: string;
        isActive?: boolean;
    }) {
        const { skip = 0, take = 10, search, facultyId, isActive } = params || {};

        const where: any = {};

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            };
        }

        if (facultyId) {
            where.facultyId = facultyId;
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [data, total] = await Promise.all([
            this.prisma.specialty.findMany({
                where,
                skip,
                take,
                orderBy: { name: 'asc' },
                include: {
                    faculty: true,
                },
            }),
            this.prisma.specialty.count({ where }),
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
        const specialty = await this.prisma.specialty.findUnique({
            where: { id },
            include: {
                faculty: true,
            },
        });

        if (!specialty) {
            throw new NotFoundException(`Specialty with ID ${id} not found`);
        }

        return specialty;
    }

    async update(id: string, updateSpecialtyDto: UpdateSpecialtyDto) {
        await this.findOne(id);

        return this.prisma.specialty.update({
            where: { id },
            data: updateSpecialtyDto,
            include: {
                faculty: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.specialty.delete({
            where: { id },
        });
    }
}
