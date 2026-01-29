/**
 * Generate unique IDs for different entities
 */

import { prisma } from '@/lib/prisma';

/**
 * Generate next Student ID (STU-0001, STU-0002, etc.)
 */
export async function generateStudentId(): Promise<string> {
    try {
        // Get the latest student by studentId
        const latestStudent = await prisma.student.findFirst({
            where: {
                studentId: {
                    startsWith: 'STU-',
                },
            },
            orderBy: {
                studentId: 'desc',
            },
            select: {
                studentId: true,
            },
        });

        if (!latestStudent) {
            // First student
            return 'STU-0001';
        }

        // Extract number from STU-0001
        const lastNumber = parseInt(latestStudent.studentId.replace('STU-', ''));
        const nextNumber = lastNumber + 1;

        // Format with leading zeros (4 digits)
        return `STU-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error('Error generating student ID:', error);
        // Fallback to timestamp-based ID
        return `STU-${Date.now()}`;
    }
}

/**
 * Generate next Lead ID (LEAD-0001, LEAD-0002, etc.)
 */
export async function generateLeadId(): Promise<string> {
    try {
        // Get the latest lead by leadId
        const latestLead = await prisma.lead.findFirst({
            where: {
                leadId: {
                    startsWith: 'LEAD-',
                },
            },
            orderBy: {
                leadId: 'desc',
            },
            select: {
                leadId: true,
            },
        });

        if (!latestLead) {
            // First lead
            return 'LEAD-0001';
        }

        // Extract number from LEAD-0001
        const lastNumber = parseInt(latestLead.leadId.replace('LEAD-', ''));
        const nextNumber = lastNumber + 1;

        // Format with leading zeros (4 digits)
        return `LEAD-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error('Error generating lead ID:', error);
        // Fallback to timestamp-based ID
        return `LEAD-${Date.now()}`;
    }
}

/**
 * Generate next Application ID (APP-0001, APP-0002, etc.)
 */
export async function generateApplicationId(): Promise<string> {
    try {
        // Get the latest application by applicationId
        const latestApp = await prisma.application.findFirst({
            where: {
                applicationId: {
                    startsWith: 'APP-',
                },
            },
            orderBy: {
                applicationId: 'desc',
            },
            select: {
                applicationId: true,
            },
        });

        if (!latestApp) {
            // First application
            return 'APP-0001';
        }

        // Extract number from APP-0001
        const lastNumber = parseInt(latestApp.applicationId.replace('APP-', ''));
        const nextNumber = lastNumber + 1;

        // Format with leading zeros (4 digits)
        return `APP-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error('Error generating application ID:', error);
        // Fallback to timestamp-based ID
        return `APP-${Date.now()}`;
    }
}
