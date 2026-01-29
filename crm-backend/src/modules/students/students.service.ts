import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) { }

    async findAll(page: number = 1, pageSize: number = 10, search: string = '') {
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {};

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { studentId: { contains: search, mode: 'insensitive' } },
                { passportNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [students, total] = await Promise.all([
            this.prisma.student.findMany({
                where,
                skip: Number(skip),
                take: Number(take),
                include: {
                    agent: true,
                    applications: {
                        include: {
                            program: {
                                include: {
                                    faculty: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.student.count({ where }),
        ]);

        return {
            students,
            total,
            page: Number(page),
            pageSize: Number(pageSize),
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async findOne(id: string) {
        const student = await this.prisma.student.findUnique({
            where: { id },
            include: {
                agent: true,
                applications: {
                    include: {
                        program: {
                            include: {
                                faculty: true,
                            },
                        },
                    },
                },
                studentDocuments: true,
                timeline: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException(`Student with ID ${id} not found`);
        }

        return student;
    }

    async create(createStudentDto: CreateStudentDto) {
        // Generate student ID (STU-0001, STU-0002, etc.)
        const lastStudent = await this.prisma.student.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { studentId: true },
        });

        let nextNumber = 1;
        if (lastStudent?.studentId) {
            const match = lastStudent.studentId.match(/STU-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        const studentId = `STU-${String(nextNumber).padStart(4, '0')}`;

        return this.prisma.student.create({
            data: {
                ...createStudentDto,
                studentId,
            },
        });
    }

    async update(id: string, updateStudentDto: UpdateStudentDto) {
        // Check if student exists
        await this.findOne(id);

        return this.prisma.student.update({
            where: { id },
            data: updateStudentDto,
        });
    }

    async remove(id: string) {
        // Check if student exists
        await this.findOne(id);

        return this.prisma.student.delete({
            where: { id },
        });
    }
}
