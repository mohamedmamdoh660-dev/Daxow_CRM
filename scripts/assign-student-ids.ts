/**
 * Script to update existing students with Student IDs
 * Run this once to assign IDs to existing students
 */

import { prisma } from '../lib/prisma';

async function assignStudentIds() {
    console.log('🔄 Starting Student ID assignment...');

    // Get all students without studentId
    const students = await prisma.student.findMany({
        where: {
            studentId: null,
        },
        orderBy: {
            createdAt: 'asc', // Oldest first
        },
    });

    console.log(`📊 Found ${students.length} students without IDs`);

    let counter = 1;

    for (const student of students) {
        const studentId = `STU-${counter.toString().padStart(4, '0')}`;

        await prisma.student.update({
            where: { id: student.id },
            data: { studentId },
        });

        console.log(`✅ Assigned ${studentId} to ${student.fullName}`);
        counter++;
    }

    console.log('🎉 Student ID assignment complete!');
}

assignStudentIds()
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
