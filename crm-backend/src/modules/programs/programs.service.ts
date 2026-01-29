import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsService {
    constructor(private prisma: PrismaService) { }

    async findAll(
        page: number = 1,
        pageSize: number = 10,
        search: string = '',
        filters: {
            facultyId?: string;
            specialtyId?: string;
            degreeId?: string;
            countryId?: string;
            cityId?: string;
            languageId?: string;
            isActive?: boolean;
        } = {},
    ) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {};

        // Search logic
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Filters
        if (filters.facultyId) where.facultyId = filters.facultyId;
        if (filters.specialtyId) where.specialtyId = filters.specialtyId;
        if (filters.degreeId) where.degreeId = filters.degreeId;
        if (filters.countryId) where.countryId = filters.countryId;
        if (filters.cityId) where.cityId = filters.cityId;
        if (filters.languageId) where.languageId = filters.languageId;
        if (filters.isActive !== undefined) where.isActive = filters.isActive;

        const [programs, total] = await Promise.all([
            this.prisma.program.findMany({
                where,
                skip: Number(skip),
                take: Number(take),
                orderBy: { createdAt: 'desc' },
                include: {
                    faculty: true,
                    specialty: true,
                    degree: true,
                    country: true,
                    city: true,
                    languageRel: true,
                },
            }),
            this.prisma.program.count({ where }),
        ]);

        return {
            data: programs,
            meta: {
                total,
                page: Number(page),
                pageSize: Number(pageSize),
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async findOne(id: string) {
        const program = await this.prisma.program.findUnique({
            where: { id },
            include: {
                faculty: true,
                specialty: true,
                degree: true,
                country: true,
                city: true,
                languageRel: true,
            },
        });

        if (!program) {
            throw new NotFoundException(`Program with ID ${id} not found`);
        }

        return program;
    }

    async create(createProgramDto: CreateProgramDto) {
        return this.prisma.program.create({
            data: createProgramDto,
        });
    }

    async update(id: string, updateProgramDto: UpdateProgramDto) {
        await this.findOne(id); // Check existence

        return this.prisma.program.update({
            where: { id },
            data: updateProgramDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Check existence

        return this.prisma.program.delete({
            where: { id },
        });
    }
}
