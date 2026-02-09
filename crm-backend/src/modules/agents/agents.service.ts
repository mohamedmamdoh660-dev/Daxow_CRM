import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AgentsService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.AgentCreateInput) {
        return this.prisma.agent.create({
            data,
        });
    }

    async findAll(page: number, pageSize: number, search?: string) {
        const skip = (page - 1) * pageSize;
        const where: Prisma.AgentWhereInput = {
            isActive: true,
            ...(search && {
                OR: [
                    { companyName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { contactPerson: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.agent.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { students: true } } },
            }),
            this.prisma.agent.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async findOne(id: string) {
        return this.prisma.agent.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: Prisma.AgentUpdateInput) {
        return this.prisma.agent.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.agent.update({
            where: { id },
            data: { isActive: false }
        });
    }
}
