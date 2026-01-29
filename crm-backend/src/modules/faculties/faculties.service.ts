import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Injectable()
export class FacultiesService {
    constructor(private prisma: PrismaService) { }

    async create(createFacultyDto: CreateFacultyDto) {
        return this.prisma.faculty.create({
            data: createFacultyDto,
        });
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
            this.prisma.faculty.findMany({
                where,
                skip,
                take,
                orderBy: { name: 'asc' },
                include: {
                    specialties: true,
                },
            }),
            this.prisma.faculty.count({ where }),
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
        const faculty = await this.prisma.faculty.findUnique({
            where: { id },
            include: {
                specialties: true,
            },
        });

        if (!faculty) {
            throw new NotFoundException(`Faculty with ID ${id} not found`);
        }

        return faculty;
    }

    async update(id: string, updateFacultyDto: UpdateFacultyDto) {
        await this.findOne(id);

        return this.prisma.faculty.update({
            where: { id },
            data: updateFacultyDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.faculty.delete({
            where: { id },
        });
    }
}
