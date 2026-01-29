import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';

@Injectable()
export class TitlesService {
    constructor(private prisma: PrismaService) { }

    async create(createTitleDto: CreateTitleDto) {
        const existing = await this.prisma.title.findUnique({
            where: { name: createTitleDto.name },
        });

        if (existing) {
            throw new ConflictException('Title already exists');
        }

        return this.prisma.title.create({
            data: createTitleDto,
        });
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        search?: string;
        isActive?: boolean;
    }) {
        const { skip = 0, take = 10, search, isActive } = params || {};

        const where: any = {};

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            };
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [data, total] = await Promise.all([
            this.prisma.title.findMany({
                where,
                skip,
                take,
                orderBy: { name: 'asc' },
            }),
            this.prisma.title.count({ where }),
        ]);

        return {
            data,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
            totalPages: Math.ceil(total / take),
        };
    }

    async findOne(id: string) {
        const title = await this.prisma.title.findUnique({
            where: { id },
        });

        if (!title) {
            throw new NotFoundException(`Title with ID ${id} not found`);
        }

        return title;
    }

    async update(id: string, updateTitleDto: UpdateTitleDto) {
        await this.findOne(id);

        if (updateTitleDto.name) {
            const existing = await this.prisma.title.findFirst({
                where: { name: updateTitleDto.name, id: { not: id } },
            });
            if (existing) {
                throw new ConflictException('Title already exists');
            }
        }

        return this.prisma.title.update({
            where: { id },
            data: updateTitleDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.title.delete({
            where: { id },
        });
    }
}
