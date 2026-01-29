import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Injectable()
export class LanguagesService {
    constructor(private prisma: PrismaService) { }

    async create(createLanguageDto: CreateLanguageDto) {
        return this.prisma.language.create({
            data: createLanguageDto,
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
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [data, total] = await Promise.all([
            this.prisma.language.findMany({
                where,
                skip,
                take,
                orderBy: { name: 'asc' },
            }),
            this.prisma.language.count({ where }),
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
        const language = await this.prisma.language.findUnique({
            where: { id },
        });

        if (!language) {
            throw new NotFoundException(`Language with ID ${id} not found`);
        }

        return language;
    }

    async update(id: string, updateLanguageDto: UpdateLanguageDto) {
        await this.findOne(id);

        return this.prisma.language.update({
            where: { id },
            data: updateLanguageDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.language.delete({
            where: { id },
        });
    }
}
