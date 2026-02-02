import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTimelineEvent, TimelineEventTypes } from '@/lib/timeline';
import { generateStudentId } from '@/lib/id-generator';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '0');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const searchQuery = searchParams.get('search') || '';

        const skip = page * pageSize;

        // Build where clause for search
        const where = searchQuery
            ? {
                OR: [
                    { fullName: { contains: searchQuery, mode: 'insensitive' as const } },
                    { email: { contains: searchQuery, mode: 'insensitive' as const } },
                    { passportNumber: { contains: searchQuery, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [students, totalCount] = await Promise.all([
            prisma.student.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.student.count({ where }),
        ]);

        return NextResponse.json({ students, totalCount });
    } catch (error: any) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch students' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            transferStudent,
            haveTc,
            tcNumber,
            blueCard,
            firstName,
            lastName,
            fullName,
            gender,
            dateOfBirth,
            nationality,
            passportNumber,
            passportIssueDate,
            passportExpiryDate,
            email,
            mobile,
            addressLine1,
            cityDistrict,
            stateProvince,
            postalCode,
            addressCountry,
            fatherName,
            fatherMobile,
            fatherOccupation,
            motherName,
            motherMobile,
            motherOccupation,
            educationLevelId,
            educationLevelName,
            highSchoolCountry,
            highSchoolName,
            highSchoolGpa,
            bachelorCountry,
            bachelorSchoolName,
            bachelorGpa,
            masterCountry,
            masterSchoolName,
            masterGpa,
            photoUrl,
            documents,
        } = body;

        // Check for duplicates
        const duplicateChecks = [];

        if (passportNumber) {
            duplicateChecks.push(
                prisma.student.findFirst({
                    where: { passportNumber },
                    select: { id: true, passportNumber: true }
                })
            );
        } else {
            duplicateChecks.push(Promise.resolve(null));
        }

        if (email) {
            duplicateChecks.push(
                prisma.student.findFirst({
                    where: { email },
                    select: { id: true, email: true }
                })
            );
        } else {
            duplicateChecks.push(Promise.resolve(null));
        }

        if (mobile) {
            duplicateChecks.push(
                prisma.student.findFirst({
                    where: { mobile },
                    select: { id: true, mobile: true }
                })
            );
        } else {
            duplicateChecks.push(Promise.resolve(null));
        }

        const [existingPassport, existingEmail, existingMobile] = await Promise.all(duplicateChecks);

        // Build error message for duplicates
        const errors = [];
        if (existingPassport) {
            errors.push(`Passport number "${passportNumber}" is already registered`);
        }
        if (existingEmail) {
            errors.push(`Email "${email}" is already registered`);
        }
        if (existingMobile) {
            errors.push(`Mobile number "${mobile}" is already registered`);
        }

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join('. ') },
                { status: 400 }
            );
        }

        // Auto-generate fullName if not provided
        const studentFullName = fullName || `${firstName} ${lastName}`;

        // Generate student ID
        const studentId = await generateStudentId();

        // Create student with documents in a transaction
        const student = await prisma.$transaction(async (tx: any) => {
            // Create student
            const newStudent = await tx.student.create({
                data: {
                    studentId,  // STU-0001, STU-0002, etc.
                    transferStudent: transferStudent || false,
                    haveTc,
                    tcNumber,
                    blueCard: blueCard || false,
                    firstName,
                    lastName,
                    fullName: studentFullName,
                    gender,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                    nationality,
                    passportNumber,
                    passportIssueDate: passportIssueDate ? new Date(passportIssueDate) : undefined,
                    passportExpiryDate: passportExpiryDate ? new Date(passportExpiryDate) : undefined,
                    email,
                    mobile,
                    addressLine1,
                    cityDistrict,
                    stateProvince,
                    postalCode,
                    addressCountry,
                    fatherName,
                    fatherMobile,
                    fatherOccupation,
                    motherName,
                    motherMobile,
                    motherOccupation,
                    educationLevelId,
                    educationLevelName,
                    highSchoolCountry,
                    highSchoolName,
                    highSchoolGpa: highSchoolGpa ? parseFloat(highSchoolGpa) : undefined,
                    bachelorCountry,
                    bachelorSchoolName,
                    bachelorGpa: bachelorGpa ? parseFloat(bachelorGpa) : undefined,
                    masterCountry,
                    masterSchoolName,
                    masterGpa: masterGpa ? parseFloat(masterGpa) : undefined,
                    photoUrl: photoUrl || null,
                },
            });

            // Create document records if any
            if (documents && Array.isArray(documents) && documents.length > 0) {
                await tx.document.createMany({
                    data: documents.map((doc: any) => ({
                        studentId: newStudent.id,
                        fileName: doc.fileName,
                        fileType: doc.type,
                        fileUrl: doc.fileUrl,
                        fileSize: doc.fileSize || 0,
                        metadata: { documentType: doc.type },
                    })),
                });
            }

            return newStudent;
        });


        // Create timeline event for student creation (non-blocking)
        try {
            await createTimelineEvent({
                entityType: 'student',
                entityId: student.id,
                studentId: student.id,
                eventType: TimelineEventTypes.STUDENT_CREATED,
                description: `Student ${student.fullName} was created`,
                metadata: {
                    email: student.email,
                    nationality: student.nationality,
                    educationLevel: student.educationLevelName,
                },
            });
        } catch (timelineError) {
            // Log error but don't fail the student creation
            console.error('Failed to create timeline event:', timelineError);
        }

        return NextResponse.json({ student }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating student:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create student' },
            { status: 500 }
        );
    }
}

