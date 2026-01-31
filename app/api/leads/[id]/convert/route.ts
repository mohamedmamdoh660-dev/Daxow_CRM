import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTimelineEvent } from '@/lib/timeline';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch the lead
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                leadDocuments: true,
            },
        });

        if (!lead) {
            return NextResponse.json(
                { error: 'Lead not found' },
                { status: 404 }
            );
        }

        // Check if lead type is Student
        if (lead.type !== 'Student') {
            return NextResponse.json(
                { error: 'Only Student leads can be converted to students' },
                { status: 400 }
            );
        }

        // Check if already converted
        if (lead.convertedToStudentId) {
            return NextResponse.json(
                { error: 'Lead has already been converted to a student' },
                { status: 400 }
            );
        }

        // Generate next student ID (STU-XXXX)
        const lastStudent = await prisma.student.findFirst({
            where: {
                studentId: {
                    startsWith: 'STU-',
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        let nextStudentNumber = 1;
        if (lastStudent && lastStudent.studentId) {
            const match = lastStudent.studentId.match(/STU-(\d+)/);
            if (match) {
                nextStudentNumber = parseInt(match[1]) + 1;
            }
        }

        const studentId = `STU-${String(nextStudentNumber).padStart(4, '0')}`;

        // Create student from lead data
        const student = await prisma.student.create({
            data: {
                studentId,
                firstName: lead.fullName?.split(' ')[0] || 'Unknown',
                lastName: lead.fullName?.split(' ').slice(1).join(' ') || '',
                fullName: lead.fullName || 'Unknown',
                email: lead.email || '',
                phone: lead.phone,
                nationality: lead.country,
                addressCountry: lead.country,
                // Copy notes to metadata
                metadata: {
                    ...(typeof lead.metadata === 'object' && lead.metadata ? lead.metadata : {}),
                    convertedFromLeadId: lead.id,
                    leadNotes: lead.notes,
                    preferredIntake: lead.preferredIntake,
                    budgetRange: lead.budgetRange,
                    preferredCountries: lead.preferredCountries,
                },
                status: 'Applicant',
                isActive: true,
            },
        });

        // Copy documents from lead to student
        if (lead.leadDocuments && lead.leadDocuments.length > 0) {
            for (const doc of lead.leadDocuments) {
                await prisma.document.create({
                    data: {
                        studentId: student.id,
                        fileName: doc.fileName,
                        fileType: doc.fileType,
                        fileUrl: doc.fileUrl,
                        fileSize: doc.fileSize,
                        metadata: {
                            ...(typeof doc.metadata === 'object' && doc.metadata ? doc.metadata : {}),
                            copiedFromLead: lead.id,
                        },
                    },
                });
            }
        }

        // Update lead with conversion info
        const updatedLead = await prisma.lead.update({
            where: { id },
            data: {
                convertedToStudentId: student.id,
                status: 'Converted',
            },
        });

        // Create timeline events
        await createTimelineEvent({
            entityType: 'lead',
            entityId: lead.id,
            leadId: lead.id,
            eventType: 'Lead Converted to Student',
            description: `Lead converted to student ${studentId}`,
            metadata: {
                studentId: student.id,
                studentRecordId: studentId,
            },
        });

        await createTimelineEvent({
            entityType: 'student',
            entityId: student.id,
            studentId: student.id,
            eventType: 'Student Created from Lead',
            description: `Student created from lead conversion`,
            metadata: {
                leadId: lead.id,
                leadRecordId: lead.leadId,
            },
        });

        return NextResponse.json({
            success: true,
            student: {
                id: student.id,
                studentId: student.studentId,
                fullName: student.fullName,
                email: student.email,
            },
            lead: updatedLead,
        });
    } catch (error: any) {
        console.error('Error converting lead to student:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to convert lead to student' },
            { status: 500 }
        );
    }
}
