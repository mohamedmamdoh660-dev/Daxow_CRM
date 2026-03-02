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

    /**
     * Batch-resolve nationality IDs to country names in a single DB query.
     * This prevents the N+1 problem where we'd query the DB once per student.
     */
    private async batchResolveNationalities(nationalityIds: (string | null | undefined)[]): Promise<Map<string, string>> {
        const uniqueIds = [...new Set(nationalityIds.filter(Boolean))] as string[];
        if (uniqueIds.length === 0) return new Map();

        const countries = await this.prisma.country.findMany({
            where: { id: { in: uniqueIds } },
            select: { id: true, name: true },
        });

        return new Map(countries.map((c) => [c.id, c.name]));
    }

    async findAll(
        page: number = 1,
        pageSize: number = 10,
        search: string = '',
        ownerFilter?: string,
        filters?: {
            status?: string;
            isActive?: boolean;
            agentId?: string;
            nationality?: string;
        },
    ) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {};

        // 🔒 View Own: restrict records to those owned by this user
        if (ownerFilter) {
            where.ownerId = ownerFilter;
        }

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

        // Apply additional filters
        if (filters?.status) where.status = filters.status;
        if (filters?.isActive !== undefined) where.isActive = filters.isActive;
        if (filters?.agentId) where.agentId = filters.agentId;
        if (filters?.nationality) where.nationality = filters.nationality;

        const [students, total] = await Promise.all([
            this.prisma.student.findMany({
                where,
                skip: Number(skip),
                take: Number(take),
                select: {
                    id: true,
                    studentId: true,
                    firstName: true,
                    lastName: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    mobile: true,
                    nationality: true,
                    passportNumber: true,
                    photoUrl: true,
                    status: true,
                    isActive: true,
                    tags: true,
                    agentId: true,
                    assignedTo: true,
                    createdAt: true,
                    updatedAt: true,
                    agent: {
                        select: {
                            id: true,
                            companyName: true,
                            contactPerson: true,
                            email: true,
                        },
                    },
                    applications: {
                        select: {
                            id: true,
                            applicationName: true,
                            stage: true,
                            status: true,
                            createdAt: true,
                            program: {
                                select: {
                                    id: true,
                                    name: true,
                                    officialTuition: true,
                                    tuitionCurrency: true,
                                    faculty: { select: { id: true, name: true } },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.student.count({ where }),
        ]);

        // Batch-resolve all nationalities in a single DB query (fixes N+1 problem)
        const nationalityMap = await this.batchResolveNationalities(students.map((s) => s.nationality));

        const studentsWithNames = students.map((student) => ({
            ...student,
            nationalityName: student.nationality
                ? (nationalityMap.get(student.nationality) ?? student.nationality)
                : null,
        }));

        return {
            students: studentsWithNames,
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
                        academicYear: true,
                        semester: true,
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

        // Resolve nationality ID to country name
        const nationalityMap = await this.batchResolveNationalities([student.nationality]);
        const nationalityName = student.nationality
            ? (nationalityMap.get(student.nationality) ?? student.nationality)
            : null;

        return {
            ...student,
            nationalityName,
        };
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
                    // Store documents as JSON in the documents field (legacy)
                    documents: documents || [],
                },
            });

            console.log('✅ Student created successfully:', student.id);

            // 🎯 Create proper Document records in the Document table
            // so they appear in the studentDocuments relation
            if (documents && documents.length > 0) {
                for (const doc of documents) {
                    try {
                        await this.prisma.document.create({
                            data: {
                                studentId: student.id,
                                fileName: doc.fileName || doc.type,
                                fileType: doc.type,
                                fileUrl: doc.fileUrl,
                                fileSize: doc.fileSize || 0,
                                metadata: {
                                    uploadedDuring: 'student_creation',
                                },
                            },
                        });
                    } catch (docError) {
                        console.error(`⚠️ Failed to create Document record for ${doc.fileName}:`, docError);
                        // Don't fail the entire creation if one document record fails
                    }
                }
                console.log(`📎 Created ${documents.length} document records for student ${student.id}`);
            }

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

        // Sanitize data: convert empty strings to undefined/null
        const sanitizedData = Object.entries(updateStudentDto).reduce((acc, [key, value]) => {
            if (value === '' || value === null) {
                acc[key] = null; // Use null to unset the field in DB
            } else {
                acc[key] = value;
            }
            return acc;
        }, {} as any);

        // If documents are present, handle them (omitted for now as specific logic might be needed)
        // For now just pass everything else

        return this.prisma.student.update({
            where: { id },
            data: sanitizedData,
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
