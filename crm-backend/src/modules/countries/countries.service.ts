import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountriesService {
    // Force backend restart to pick up Prisma Client changes
    constructor(private prisma: PrismaService) { }

    async findAll(params?: {
        skip?: number;
        take?: number;
        search?: string;
        isActive?: boolean;
        activeOnNationalities?: boolean;
    }) {
        const { skip = 0, take = 10, search, isActive, activeOnNationalities } = params || {};

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

        if (activeOnNationalities !== undefined) {
            where.activeOnNationalities = activeOnNationalities;
        }

        const [data, total] = await Promise.all([
            this.prisma.country.findMany({
                where,
                skip,
                take,
                orderBy: { name: 'asc' },
            }),
            this.prisma.country.count({ where }),
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
        const country = await this.prisma.country.findUnique({
            where: { id },
        });

        if (!country) {
            throw new NotFoundException(`Country with ID ${id} not found`);
        }

        return country;
    }

    async create(createCountryDto: CreateCountryDto) {
        // Check for duplicate name
        const existingByName = await this.prisma.country.findUnique({
            where: { name: createCountryDto.name },
        });

        if (existingByName) {
            throw new ConflictException(`Country with name "${createCountryDto.name}" already exists`);
        }

        // Check for duplicate code
        const existingByCode = await this.prisma.country.findUnique({
            where: { code: createCountryDto.code },
        });

        if (existingByCode) {
            throw new ConflictException(`Country with code "${createCountryDto.code}" already exists`);
        }

        try {
            return await this.prisma.country.create({
                data: createCountryDto,
            });
        } catch (error) {
            console.error('Create Country Error:', error);
            throw new InternalServerErrorException(`Creation failed: ${error.message}`);
        }
    }

    async update(id: string, updateCountryDto: UpdateCountryDto) {
        // Check if country exists
        await this.findOne(id);

        // If updating name, check for duplicates
        if (updateCountryDto.name) {
            const existing = await this.prisma.country.findFirst({
                where: {
                    name: updateCountryDto.name,
                    id: { not: id },
                },
            });

            if (existing) {
                throw new ConflictException(`Country with name "${updateCountryDto.name}" already exists`);
            }
        }

        // If updating code, check for duplicates
        if (updateCountryDto.code) {
            const existing = await this.prisma.country.findFirst({
                where: {
                    code: updateCountryDto.code,
                    id: { not: id },
                },
            });

            if (existing) {
                throw new ConflictException(`Country with code "${updateCountryDto.code}" already exists`);
            }
        }

        return this.prisma.country.update({
            where: { id },
            data: updateCountryDto,
        });
    }

    async remove(id: string) {
        // Check if country exists
        await this.findOne(id);

        // Soft delete by setting isActive to false
        return this.prisma.country.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
