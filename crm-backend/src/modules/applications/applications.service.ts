import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Prisma } from '@prisma/client';
import { parseSmartFilters } from '../../common/helpers/smart-filters.helper';

/** Fields allowed in smart filter queries for applications */
const APPLICATION_FILTERABLE_FIELDS = [
    'applicationName', 'stage', 'programId', 'agentId', 'agencyId',
    'studentId', 'academicYearId', 'semesterId', 'createdAt',
];

@Injectable()
export class ApplicationsService {
    constructor(private prisma: PrismaService) { }

    // Standard includes for list views
    private readonly listIncludes = {
        student: {
            select: {
                id: true,
                studentId: true,
                firstName: true,
                lastName: true,
                fullName: true,
                email: true,
                nationality: true,
            },
        },
        program: {
            select: {
                id: true,
                name: true,
                officialTuition: true,
                discountedTuition: true,
                tuitionCurrency: true,
                faculty: { select: { id: true, name: true } },
                specialty: { select: { id: true, name: true } },
            },
        },
        academicYear: { select: { id: true, name: true } },
        semester: { select: { id: true, name: true } },
        degree: { select: { id: true, name: true } },
        agent: { select: { id: true, firstName: true, lastName: true, email: true } },
        agency: { select: { id: true, companyName: true } },
    };

    // Full includes for detail view
    private readonly detailIncludes = {
        student: {
            include: {
                studentDocuments: true,
            },
        },
        program: {
            include: {
                faculty: true,
                degree: true,
                specialty: true,
                languageRel: true,
            },
        },
        academicYear: true,
        semester: true,
        degree: true,
        agent: { select: { id: true, firstName: true, lastName: true, email: true } },
        agency: { select: { id: true, companyName: true, contactPerson: true, email: true } },
        documents: true,
        tasks: { orderBy: { createdAt: 'desc' as const } },
        timeline: { orderBy: { createdAt: 'desc' as const } },
    };

    async findAll(query?: {
        page?: number;
        limit?: number;
        search?: string;
        stage?: string;
        studentId?: string;
        programId?: string;
        academicYearId?: string;
        semesterId?: string;
        agentId?: string;
        agencyId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        rawQuery?: Record<string, any>;  // 🔍 smart filter raw query
        assignedToFilter?: string;  // 🔒 view_own: filter by ownerId
    }) {
        const page = query?.page || 1;
        const limit = query?.limit || 25;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (query?.search) {
            where.OR = [
                { applicationName: { contains: query.search, mode: 'insensitive' } },
                { student: { fullName: { contains: query.search, mode: 'insensitive' } } },
                { student: { email: { contains: query.search, mode: 'insensitive' } } },
                { program: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
        }

        // 🔍 Smart filter: parse field__operator=value params
        if (query?.rawQuery) {
            const smartConditions = parseSmartFilters(query.rawQuery, APPLICATION_FILTERABLE_FIELDS);
            Object.assign(where, smartConditions);
        }

        // 🔒 View Own: restrict to applications owned by this user
        if (query?.assignedToFilter) {
            where.ownerId = query.assignedToFilter;
        }

        // Build orderBy
        const sortBy = query?.sortBy || 'createdAt';
        const sortOrder = query?.sortOrder || 'desc';
        const orderBy: any = { [sortBy]: sortOrder };

        const [data, total] = await Promise.all([
            this.prisma.application.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: this.listIncludes,
            }),
            this.prisma.application.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: this.detailIncludes,
        });

        if (!application) {
            throw new NotFoundException(`Application with ID ${id} not found`);
        }

        return application;
    }

    async create(createApplicationDto: CreateApplicationDto) {
        const { metadata, ...data } = createApplicationDto;

        // Generate application name (APP-YYYY-NNN)
        const year = new Date().getFullYear();
        const count = await this.prisma.application.count();
        const applicationName = data.applicationName || `APP-${year}-${String(count + 1).padStart(3, '0')}`;

        try {
            return await this.prisma.application.create({
                data: {
                    ...data,
                    applicationName,
                    metadata: metadata || {},
                },
                include: this.listIncludes,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException(
                    'An application already exists for this student, program, and academic year combination.',
                );
            }
            throw error;
        }
    }

    async update(id: string, updateApplicationDto: UpdateApplicationDto) {
        // Check if application exists
        await this.findOne(id);

        const { metadata, ...data } = updateApplicationDto;

        return this.prisma.application.update({
            where: { id },
            data: {
                ...data,
                ...(metadata !== undefined && { metadata }),
            },
            include: this.listIncludes,
        });
    }

    async remove(id: string) {
        // Check if application exists
        await this.findOne(id);

        return this.prisma.application.delete({
            where: { id },
        });
    }

    async findByStudent(studentId: string) {
        return this.prisma.application.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            include: this.listIncludes,
        });
    }

    async findByProgram(programId: string) {
        return this.prisma.application.findMany({
            where: { programId },
            orderBy: { createdAt: 'desc' },
            include: {
                student: {
                    select: {
                        id: true,
                        studentId: true,
                        fullName: true,
                        email: true,
                    },
                },
                academicYear: { select: { id: true, name: true } },
                semester: { select: { id: true, name: true } },
            },
        });
    }

    async getStats() {
        const [total, byStage] = await Promise.all([
            this.prisma.application.count(),
            this.prisma.application.groupBy({
                by: ['stage'],
                _count: { id: true },
            }),
        ]);

        return {
            total,
            byStage: byStage.reduce((acc, item) => {
                acc[item.stage] = item._count.id;
                return acc;
            }, {} as Record<string, number>),
        };
    }
}
