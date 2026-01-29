import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class LeadsService {
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
                { fullName: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { leadId: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [leads, total] = await Promise.all([
            this.prisma.lead.findMany({
                where,
                skip: Number(skip),
                take: Number(take),
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.lead.count({ where }),
        ]);

        return {
            leads,
            total,
            page: Number(page),
            pageSize: Number(pageSize),
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async findOne(id: string) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                leadDocuments: true,
                timeline: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!lead) {
            throw new NotFoundException(`Lead with ID ${id} not found`);
        }

        return lead;
    }

    async create(createLeadDto: CreateLeadDto) {
        // Generate lead ID (LEAD-0001, LEAD-0002, etc.)
        const lastLead = await this.prisma.lead.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { leadId: true },
        });

        let nextNumber = 1;
        if (lastLead?.leadId) {
            const match = lastLead.leadId.match(/LEAD-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        const leadId = `LEAD-${String(nextNumber).padStart(4, '0')}`;

        const lead = await this.prisma.lead.create({
            data: {
                ...createLeadDto,
                leadId,
                status: createLeadDto.status || 'New',
            },
        });

        // 🎯 Timeline event
        await this.timeline.createEvent({
            entityType: 'Lead',
            entityId: lead.id,
            eventType: 'lead_created',
            title: 'Lead Created',
            description: `New ${lead.type} lead created: ${lead.fullName}`,
            metadata: {
                leadId: lead.leadId,
                email: lead.email,
                source: lead.source,
            },
        });

        return lead;
    }

    async update(id: string, updateLeadDto: UpdateLeadDto) {
        // Check if lead exists
        const existingLead = await this.findOne(id);

        const lead = await this.prisma.lead.update({
            where: { id },
            data: updateLeadDto,
        });

        // 🐛 Debug logging
        console.log('=== LEAD UPDATE DEBUG ===');
        console.log('Update DTO:', JSON.stringify(updateLeadDto, null, 2));
        console.log('Existing Lead (selected fields):', {
            city: existingLead.city,
            notes: existingLead.notes,
            assignedTo: existingLead.assignedTo,
            status: existingLead.status,
        });

        // Build detailed description of changes
        const changes: string[] = [];

        // Basic info changes
        if (updateLeadDto.status && updateLeadDto.status !== existingLead.status) {
            changes.push(`Status: ${existingLead.status} → ${updateLeadDto.status}`);
        }
        if (updateLeadDto.type && updateLeadDto.type !== existingLead.type) {
            changes.push(`Type: ${existingLead.type || 'Not Set'} → ${updateLeadDto.type}`);
        }
        if (updateLeadDto.fullName && updateLeadDto.fullName !== existingLead.fullName) {
            changes.push(`Name: ${existingLead.fullName} → ${updateLeadDto.fullName}`);
        }
        if (updateLeadDto.email && updateLeadDto.email !== existingLead.email) {
            changes.push(`Email: ${existingLead.email} → ${updateLeadDto.email}`);
        }
        if (updateLeadDto.phone && updateLeadDto.phone !== existingLead.phone) {
            changes.push(`Phone: ${existingLead.phone || 'None'} → ${updateLeadDto.phone}`);
        }
        if (updateLeadDto.country !== undefined && updateLeadDto.country !== existingLead.country) {
            changes.push(`Country: ${existingLead.country || 'None'} → ${updateLeadDto.country || 'None'}`);
        }
        if (updateLeadDto.city !== undefined && updateLeadDto.city !== existingLead.city) {
            changes.push(`City: ${existingLead.city || 'None'} → ${updateLeadDto.city || 'None'}`);
        }
        if (updateLeadDto.source && updateLeadDto.source !== existingLead.source) {
            changes.push(`Source: ${existingLead.source} → ${updateLeadDto.source}`);
        }

        // Student-specific fields
        if (updateLeadDto.preferredCountries !== undefined && updateLeadDto.preferredCountries !== existingLead.preferredCountries) {
            changes.push(`Preferred Countries: ${existingLead.preferredCountries || 'None'} → ${updateLeadDto.preferredCountries || 'None'}`);
        }
        if (updateLeadDto.preferredIntake !== undefined && updateLeadDto.preferredIntake !== existingLead.preferredIntake) {
            changes.push(`Preferred Intake: ${existingLead.preferredIntake || 'None'} → ${updateLeadDto.preferredIntake || 'None'}`);
        }
        if (updateLeadDto.budgetRange !== undefined && updateLeadDto.budgetRange !== existingLead.budgetRange) {
            changes.push(`Budget Range: ${existingLead.budgetRange || 'None'} → ${updateLeadDto.budgetRange || 'None'}`);
        }

        // University-specific fields
        if (updateLeadDto.companyName !== undefined && updateLeadDto.companyName !== existingLead.companyName) {
            changes.push(`Company: ${existingLead.companyName || 'None'} → ${updateLeadDto.companyName || 'None'}`);
        }
        if (updateLeadDto.contactPerson !== undefined && updateLeadDto.contactPerson !== existingLead.contactPerson) {
            changes.push(`Contact Person: ${existingLead.contactPerson || 'None'} → ${updateLeadDto.contactPerson || 'None'}`);
        }

        // Agent-specific fields
        if (updateLeadDto.estimatedStudents !== undefined && updateLeadDto.estimatedStudents !== existingLead.estimatedStudents) {
            changes.push(`Estimated Students: ${existingLead.estimatedStudents || 0} → ${updateLeadDto.estimatedStudents}`);
        }
        if (updateLeadDto.proposedCommission !== undefined) {
            const oldCommission = existingLead.proposedCommission ? Number(existingLead.proposedCommission) : null;
            if (oldCommission !== updateLeadDto.proposedCommission) {
                changes.push(`Commission: ${oldCommission || 'None'} → ${updateLeadDto.proposedCommission || 'None'}`);
            }
        }

        // Assignment and notes
        if (updateLeadDto.assignedTo !== undefined && updateLeadDto.assignedTo !== existingLead.assignedTo) {
            changes.push(`Assigned: ${existingLead.assignedTo || 'Unassigned'} → ${updateLeadDto.assignedTo || 'Unassigned'}`);
        }
        if (updateLeadDto.notes !== undefined && updateLeadDto.notes !== existingLead.notes) {
            if (updateLeadDto.notes && !existingLead.notes) {
                changes.push('Notes added');
            } else if (!updateLeadDto.notes && existingLead.notes) {
                changes.push('Notes removed');
            } else {
                changes.push('Notes updated');
            }
        }

        const changesDescription = changes.length > 0
            ? changes.join(', ')
            : 'Lead information updated';

        // 🎯 Timeline event
        await this.timeline.createEvent({
            entityType: 'Lead',
            entityId: lead.id,
            eventType: 'lead_updated',
            title: 'Lead Updated',
            description: `${lead.fullName}: ${changesDescription}`,
            metadata: {
                leadId: lead.leadId,
                changes: updateLeadDto,
                detailedChanges: changes,
                previousStatus: existingLead.status,
                newStatus: lead.status,
            },
        });

        return lead;
    }

    async remove(id: string) {
        // Check if lead exists
        const lead = await this.findOne(id);

        const deleted = await this.prisma.lead.delete({
            where: { id },
        });

        // 🎯 Timeline event
        await this.timeline.createEvent({
            entityType: 'Lead',
            entityId: lead.id,
            eventType: 'lead_deleted',
            title: 'Lead Deleted',
            description: `Lead deleted: ${lead.fullName}`,
            metadata: {
                leadId: lead.leadId,
            },
        });

        return deleted;
    }

    async convertToStudent(id: string) {
        const lead = await this.findOne(id);

        if (lead.type !== 'Student') {
            throw new BadRequestException('Only student leads can be converted to students');
        }

        if (lead.convertedToStudentId) {
            throw new BadRequestException('This lead has already been converted');
        }

        // Generate student ID
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

        // Create student in a transaction
        const student = await this.prisma.$transaction(async (tx) => {
            // Split full name
            const nameParts = (lead.fullName || '').trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Create student
            const newStudent = await tx.student.create({
                data: {
                    studentId,
                    firstName,
                    lastName,
                    fullName: lead.fullName || '',
                    email: lead.email || '',
                    phone: lead.phone || null,
                    nationality: lead.country || null,
                    metadata: {
                        ...(typeof lead.metadata === 'object' && lead.metadata !== null ? lead.metadata as Record<string, any> : {}),
                        convertedFromLeadId: lead.id,
                        preferredIntake: lead.preferredIntake,
                        preferredCountries: lead.preferredCountries,
                        budgetRange: lead.budgetRange,
                        leadNotes: lead.notes,
                    },
                },
            });

            // Update lead with conversion info
            await tx.lead.update({
                where: { id },
                data: {
                    convertedToStudentId: newStudent.id,
                    status: 'Converted',
                },
            });

            // 🎯 Timeline event for lead
            await this.timeline.createEvent({
                entityType: 'Lead',
                entityId: lead.id,
                eventType: 'lead_converted',
                title: 'Lead Converted to Student',
                description: `Lead ${lead.fullName} converted to student ${newStudent.studentId}`,
                metadata: {
                    leadId: lead.leadId,
                    studentId: newStudent.studentId,
                },
            });

            // 🎯 Timeline event for student
            await this.timeline.createEvent({
                entityType: 'Student',
                entityId: newStudent.id,
                eventType: 'student_created_from_lead',
                title: 'Student Created from Lead',
                description: `Student ${newStudent.fullName} created from lead conversion`,
                metadata: {
                    leadId: lead.leadId,
                    studentId: newStudent.studentId,
                },
            });

            return newStudent;
        });

        return student;
    }
}
