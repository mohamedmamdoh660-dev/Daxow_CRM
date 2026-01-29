import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTimelineEvent, TimelineEventTypes, getChangedFields, formatFieldChanges } from '@/lib/timeline';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                studentDocuments: true,
            },
        });

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(student);
    } catch (error: any) {
        console.error('Error fetching student:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch student' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
        } = body;

        // Check if student exists
        const existingStudent = await prisma.student.findUnique({
            where: { id },
        });

        if (!existingStudent) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Check for duplicate passport/email/mobile (excluding current student)
        const duplicateChecks = [];

        if (passportNumber && passportNumber !== existingStudent.passportNumber) {
            duplicateChecks.push(
                prisma.student.findFirst({
                    where: {
                        passportNumber,
                        NOT: { id }
                    },
                    select: { id: true, passportNumber: true }
                })
            );
        } else {
            duplicateChecks.push(Promise.resolve(null));
        }

        if (email && email !== existingStudent.email) {
            duplicateChecks.push(
                prisma.student.findFirst({
                    where: {
                        email,
                        NOT: { id }
                    },
                    select: { id: true, email: true }
                })
            );
        } else {
            duplicateChecks.push(Promise.resolve(null));
        }

        if (mobile && mobile !== existingStudent.mobile) {
            duplicateChecks.push(
                prisma.student.findFirst({
                    where: {
                        mobile,
                        NOT: { id }
                    },
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

        // Update student
        const student = await prisma.student.update({
            where: { id },
            data: {
                transferStudent: transferStudent !== undefined ? transferStudent : undefined,
                haveTc,
                tcNumber,
                blueCard: blueCard !== undefined ? blueCard : undefined,
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
                photoUrl,
            },
        });

        // Track changes and create timeline event
        const changedFields = getChangedFields(existingStudent, body);
        if (changedFields.length > 0) {
            const fieldList = formatFieldChanges(changedFields);
            await createTimelineEvent({
                entityType: 'student',
                entityId: id,
                studentId: id,
                eventType: TimelineEventTypes.STUDENT_UPDATED,
                description: `Student information updated: ${fieldList}`,
                metadata: {
                    changedFields,
                    updates: body,
                },
            });
        }

        // Special event for photo upload
        if (photoUrl && photoUrl !== existingStudent.photoUrl) {
            await createTimelineEvent({
                entityType: 'student',
                entityId: id,
                studentId: id,
                eventType: TimelineEventTypes.PHOTO_UPLOADED,
                description: 'Profile photo updated',
                metadata: {
                    photoUrl,
                },
            });
        }

        return NextResponse.json({ student });
    } catch (error: any) {
        console.error('Error updating student:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update student' },
            { status: 500 }
        );
    }
}
