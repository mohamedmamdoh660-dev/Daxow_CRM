import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class StudentsService {
    constructor(
        private prisma: PrismaService,
        private timeline: TimelineService,
    ) { }

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

        // Extract documents from DTO
        const { documents, ...studentData } = createStudentDto;

        // Sanitize data: convert empty strings to undefined for optional fields
        const sanitizedData = Object.entries(studentData).reduce((acc, [key, value]) => {
            // Convert empty strings to undefined
            if (value === '' || value === null) {
                acc[key] = undefined;
            } else {
                acc[key] = value;
            }
            return acc;
        }, {} as any);

        try {
            console.log('📝 Creating student with sanitized data:', JSON.stringify({
                ...sanitizedData,
                studentId,
                documents: documents || [],
            }, null, 2));

            const student = await this.prisma.student.create({
                data: {
                    ...sanitizedData,
                    studentId,
                    // Store documents as JSON in the documents field
                    documents: documents || [],
                },
            });

            console.log('✅ Student created successfully:', student.id);

            // 🎯 Timeline event
            await this.timeline.createEvent({
                entityType: 'Student',
                entityId: student.id,
                eventType: 'student_created',
                title: 'Student Created',
                description: `New student created: ${student.fullName}`,
                metadata: {
                    studentId: student.studentId,
                    email: student.email,
                    nationality: student.nationality,
                },
            });

            return student;
        } catch (error) {
            console.error('❌ Error creating student:', error);
            console.error('❌ Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                meta: error.meta,
                stack: error.stack?.split('\n').slice(0, 5),
            });

            if (error.code === 'P2002') {
                const target = error.meta?.target?.[0];
                const cleanTarget = target ? target.replace(/([A-Z])/g, ' $1').toLowerCase() : 'field';
                throw new ConflictException(`A student with this ${cleanTarget} already exists`);
            }
            throw error;
        }
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

        return this.prisma.student.update({
            where: { id },
            data: {
                isActive: false // Soft delete
            }
        });
    }
}
