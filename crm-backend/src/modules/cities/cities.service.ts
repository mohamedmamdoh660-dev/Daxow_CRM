import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
    constructor(private prisma: PrismaService) { }

    async create(createCityDto: CreateCityDto) {
        return this.prisma.city.create({
            data: createCityDto,
            include: {
                country: true,
            },
        });
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        search?: string;
        countryId?: string;
        isActive?: boolean;
    }) {
        const { skip = 0, take = 10, search, countryId, isActive } = params || {};

        const where: any = {};

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            };
        }

        if (countryId) {
            where.countryId = countryId;
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [data, total] = await Promise.all([
            this.prisma.city.findMany({
                where,
                skip,
                take,
                orderBy: { name: 'asc' },
                include: {
                    country: true,
                },
            }),
            this.prisma.city.count({ where }),
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
        const city = await this.prisma.city.findUnique({
            where: { id },
            include: {
                country: true,
            },
        });

        if (!city) {
            throw new NotFoundException(`City with ID ${id} not found`);
        }

        return city;
    }

    async update(id: string, updateCityDto: UpdateCityDto) {
        await this.findOne(id);

        return this.prisma.city.update({
            where: { id },
            data: updateCityDto,
            include: {
                country: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.city.delete({
            where: { id },
        });
    }
}
