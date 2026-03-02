import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
    id: true,
    email: true,
    name: true,
    firstName: true,
    lastName: true,
    phone: true,
    avatar: true,
    profileImage: true,
    isActive: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
    groups: {
        include: {
            role: {
                include: { permissions: true }
            }
        }
    },
};

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private flattenGroups(groups: any[]) {
        // Get primary role name from first group  
        const roleName = groups[0]?.role?.name || 'staff';
        // Merge all permissions from all groups (deduplicated)
        const permMap = new Map<string, { module: string; action: string }>();
        for (const g of groups) {
            for (const p of (g.role?.permissions || [])) {
                permMap.set(`${p.module}:${p.action}`, { module: p.module, action: p.action });
            }
        }
        return {
            roleName,
            permissions: Array.from(permMap.values()),
            groupIds: groups.map(g => g.roleId),
            groupNames: groups.map(g => g.role?.name).filter(Boolean),
        };
    }

    // ─── Find All ─────────────────────────────────────────────────────────────

    async findAll(page = 1, pageSize = 20, search = '', groupId = '') {
        const skip = (page - 1) * pageSize;
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (groupId) {
            where.groups = { some: { roleId: groupId } };
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where, skip, take: pageSize,
                select: USER_SELECT,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        const enriched = users.map(u => ({
            ...u,
            ...this.flattenGroups(u.groups),
        }));

        return { users: enriched, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    // ─── Find One ─────────────────────────────────────────────────────────────

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: USER_SELECT,
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return { ...user, ...this.flattenGroups(user.groups) };
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    async create(dto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) throw new ConflictException('Email already in use');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Auto-derive name from firstName + lastName if not provided
        const derivedName = (dto.name && dto.name.trim())
            || [dto.firstName, dto.lastName].filter(Boolean).join(' ').trim()
            || dto.email;

        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                password: hashedPassword,
                name: derivedName,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                groups: dto.groupIds?.length
                    ? { create: dto.groupIds.map(roleId => ({ roleId })) }
                    : undefined,
            },
            select: USER_SELECT,
        });

        return { ...user, ...this.flattenGroups(user.groups) };
    }


    // ─── Update ───────────────────────────────────────────────────────────────

    async update(id: string, dto: UpdateUserDto) {
        await this.findOne(id);

        if (dto.email) {
            const conflict = await this.prisma.user.findFirst({
                where: { email: dto.email.toLowerCase(), NOT: { id } },
            });
            if (conflict) throw new ConflictException('Email already in use');
        }

        return this.prisma.$transaction(async (tx) => {
            // Re-assign groups if provided
            if (dto.groupIds !== undefined) {
                await tx.userGroup.deleteMany({ where: { userId: id } });
                if (dto.groupIds.length > 0) {
                    await tx.userGroup.createMany({
                        data: dto.groupIds.map(roleId => ({ userId: id, roleId })),
                        skipDuplicates: true,
                    });
                }
            }
            const updated = await tx.user.update({
                where: { id },
                data: {
                    ...(dto.email && { email: dto.email.toLowerCase() }),
                    ...(dto.name && { name: dto.name }),
                    ...(dto.firstName !== undefined && { firstName: dto.firstName }),
                    ...(dto.lastName !== undefined && { lastName: dto.lastName }),
                    ...(dto.phone !== undefined && { phone: dto.phone }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                },
                select: USER_SELECT,
            });
            return { ...updated, ...this.flattenGroups(updated.groups) };
        });
    }

    // ─── Reset Password (admin only) ──────────────────────────────────────────

    async resetPassword(id: string, newPassword: string) {
        await this.findOne(id);
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { id }, data: { password: hashed } });
        return { message: 'Password updated successfully' };
    }

    // ─── Toggle Active ────────────────────────────────────────────────────────

    async toggleActive(id: string) {
        const user = await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive },
            select: { id: true, isActive: true },
        });
    }

    // ─── Delete (with transfer check) ─────────────────────────────────────────

    async remove(id: string, transferToId?: string) {
        await this.findOne(id);

        // Count any records owned by this user (leads, students, applications)
        const [leadCount, studentCount, appCount] = await Promise.all([
            this.prisma.lead.count({ where: { assignedTo: id } }).catch(() => 0),
            this.prisma.student.count({ where: { assignedTo: id } }).catch(() => 0),
            this.prisma.application.count({ where: { agentId: id } }).catch(() => 0),
        ]);
        const totalRecords = leadCount + studentCount + appCount;

        if (totalRecords > 0 && !transferToId) {
            throw new ConflictException({
                message: `User has ${totalRecords} record(s). Please provide a transfer target.`,
                recordCount: totalRecords,
                requiresTransfer: true,
            });
        }

        if (transferToId && totalRecords > 0) {
            await this.transferRecords(id, transferToId);
        }

        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }

    // ─── Transfer Records ─────────────────────────────────────────────────────

    async transferRecords(fromId: string, toId: string) {
        await Promise.all([
            this.prisma.lead.updateMany({
                where: { assignedTo: fromId },
                data: { assignedTo: toId },
            }).catch(() => null),
            this.prisma.student.updateMany({
                where: { assignedTo: fromId },
                data: { assignedTo: toId },
            }).catch(() => null),
            this.prisma.application.updateMany({
                where: { agentId: fromId },
                data: { agentId: toId },
            }).catch(() => null),
        ]);
        return { message: 'Records transferred successfully' };
    }
}
