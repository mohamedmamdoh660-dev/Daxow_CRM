import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.role.findMany({
            include: {
                permissions: true,
                _count: {
                    select: { userGroups: true },
                },
            },
            orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: true,
                _count: { select: { userGroups: true } },
            },
        });
        if (!role) throw new NotFoundException(`Group ${id} not found`);
        return role;
    }

    async create(dto: CreateRoleDto) {
        const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
        if (existing) throw new ConflictException(`Group name "${dto.name}" already exists`);

        return this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                permissions: {
                    create: (dto.permissions || []).map(p => ({
                        module: p.module,
                        action: p.action,
                    })),
                },
            },
            include: { permissions: true },
        });
    }

    async update(id: string, dto: UpdateRoleDto) {
        const role = await this.findOne(id);

        if (role.isSystem && dto.name && dto.name !== role.name) {
            throw new ForbiddenException('Cannot rename system groups');
        }
        if (dto.name) {
            const conflict = await this.prisma.role.findFirst({
                where: { name: dto.name, NOT: { id } },
            });
            if (conflict) throw new ConflictException(`Group name "${dto.name}" is already taken`);
        }

        return this.prisma.$transaction(async (tx) => {
            if (dto.permissions !== undefined) {
                await tx.permission.deleteMany({ where: { roleId: id } });
            }
            return tx.role.update({
                where: { id },
                data: {
                    ...(dto.name && { name: dto.name }),
                    ...(dto.description !== undefined && { description: dto.description }),
                    ...(dto.permissions !== undefined && {
                        permissions: {
                            create: dto.permissions.map(p => ({
                                module: p.module,
                                action: p.action,
                            })),
                        },
                    }),
                },
                include: { permissions: true },
            });
        });
    }

    async remove(id: string) {
        const role = await this.findOne(id);
        if (role.isSystem) {
            throw new ForbiddenException('Cannot delete system groups');
        }
        // Block deletion if users still belong to this group
        const memberCount = await this.prisma.userGroup.count({ where: { roleId: id } });
        if (memberCount > 0) {
            throw new ConflictException(
                `Cannot delete group: ${memberCount} user(s) still assigned. Remove them first.`
            );
        }
        await this.prisma.role.delete({ where: { id } });
        return { message: 'Group deleted successfully' };
    }

    /** Get all users who are members of a group */
    async getGroupMembers(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                userGroups: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, isActive: true }
                        }
                    }
                }
            }
        });
        if (!role) throw new NotFoundException('Group not found');
        return role.userGroups.map(ug => ug.user);
    }
}
