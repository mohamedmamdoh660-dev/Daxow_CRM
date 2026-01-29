import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.application.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                student: {
                    select: {
                        id: true,
                        studentId: true,
                        firstName: true,
                        lastName: true,
                        fullName: true,
                        email: true,
                    },
                },
                program: {
                    select: {
                        id: true,
                        name: true,
                        officialTuition: true,
                        tuitionCurrency: true,
                        faculty: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                student: true,
                program: {
                    include: {
                        faculty: true,
                        degree: true,
                        specialty: true,
                    },
                },
                documents: true,
                tasks: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                timeline: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!application) {
            throw new NotFoundException(`Application with ID ${id} not found`);
        }

        return application;
    }

    async create(createApplicationDto: CreateApplicationDto) {
        const { stageHistory, metadata, ...data } = createApplicationDto;

        return this.prisma.application.create({
            data: {
                ...data,
                stageHistory: stageHistory || [],
                metadata: metadata || {},
            },
            include: {
                student: true,
                program: {
                    include: {
                        faculty: true,
                    },
                },
            },
        });
    }

    async update(id: string, updateApplicationDto: UpdateApplicationDto) {
        // Check if application exists
        await this.findOne(id);

        return this.prisma.application.update({
            where: { id },
            data: updateApplicationDto,
            include: {
                student: true,
                program: {
                    include: {
                        faculty: true,
                    },
                },
            },
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
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                program: {
                    include: {
                        faculty: true,
                    },
                },
            },
        });
    }

    async findByProgram(programId: string) {
        return this.prisma.application.findMany({
            where: { programId },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                student: true,
            },
        });
    }
}
