'use server';

import { prisma } from '@/lib/prisma';
import { separateFixedAndMetadata } from '@/lib/field-manager';
import { revalidatePath } from 'next/cache';

const FIXED_STUDENT_FIELDS = ['fullName', 'email', 'phone', 'passportNumber', 'nationality', 'dateOfBirth', 'agentId'];

export async function createStudent(formData: Record<string, any>) {
    try {
        const { fixed, metadata } = separateFixedAndMetadata(formData, FIXED_STUDENT_FIELDS);

        const student = await prisma.student.create({
            data: {
                fullName: fixed.fullName,
                email: fixed.email,
                phone: fixed.phone || null,
                passportNumber: fixed.passportNumber || null,
                nationality: fixed.nationality || null,
                agentId: fixed.agentId || null,
                dateOfBirth: fixed.dateOfBirth ? new Date(fixed.dateOfBirth) : null,
                metadata: metadata as any,
            },
        });

        // Create timeline event
        await prisma.timelineEvent.create({
            data: {
                entityType: 'Student',
                entityId: student.id,
                studentId: student.id,
                eventType: 'created',
                description: `Student ${student.fullName} was created`,
                metadata: {},
            },
        });

        revalidatePath('/students');
        return { success: true, data: student };
    } catch (error: any) {
        console.error('Create student error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateStudent(id: string, formData: Record<string, any>) {
    try {
        const { fixed, metadata } = separateFixedAndMetadata(formData, FIXED_STUDENT_FIELDS);

        const student = await prisma.student.update({
            where: { id },
            data: {
                fullName: fixed.fullName,
                email: fixed.email,
                phone: fixed.phone || null,
                passportNumber: fixed.passportNumber || null,
                nationality: fixed.nationality || null,
                agentId: fixed.agentId || null,
                dateOfBirth: fixed.dateOfBirth ? new Date(fixed.dateOfBirth) : null,
                metadata: metadata as any,
            },
        });

        // Create timeline event
        await prisma.timelineEvent.create({
            data: {
                entityType: 'Student',
                entityId: student.id,
                studentId: student.id,
                eventType: 'updated',
                description: `Student ${student.fullName} was updated`,
                metadata: { changes: formData },
            },
        });

        revalidatePath(`/students/${id}`);
        revalidatePath('/students');
        return { success: true, data: student };
    } catch (error: any) {
        console.error('Update student error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteStudent(id: string) {
    try {
        await prisma.student.update({
            where: { id },
            data: { isActive: false },
        });

        revalidatePath('/students');
        return { success: true };
    } catch (error: any) {
        console.error('Delete student error:', error);
        return { success: false, error: error.message };
    }
}

export async function getStudents(page = 1, pageSize = 20, filters?: any) {
    try {
        const skip = (page - 1) * pageSize;

        const where: any = {
            isActive: true,
        };

        if (filters?.search) {
            where.OR = [
                { fullName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters?.nationality) {
            where.nationality = filters.nationality;
        }

        if (filters?.agentId) {
            where.agentId = filters.agentId;
        }

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    agent: {
                        select: {
                            id: true,
                            companyName: true,
                        },
                    },
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            }),
            prisma.student.count({ where }),
        ]);

        return {
            success: true,
            data: {
                students,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            },
        };
    } catch (error: any) {
        console.error('Get students error:', error);
        return { success: false, error: error.message };
    }
}

export async function getStudent(id: string) {
    try {
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                agent: true,
                applications: {
                    include: {
                        program: {
                            include: {
                                university: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                documents: {
                    orderBy: { createdAt: 'desc' },
                },
                timeline: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                },
            },
        });

        if (!student) {
            return { success: false, error: 'Student not found' };
        }

        return { success: true, data: student };
    } catch (error: any) {
        console.error('Get student error:', error);
        return { success: false, error: error.message };
    }
}
