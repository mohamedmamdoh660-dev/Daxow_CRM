import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDegreeDto } from './dto/create-degree.dto';
import { UpdateDegreeDto } from './dto/update-degree.dto';

@Injectable()
export class DegreesService {
    constructor(private prisma: PrismaService) { }

    async create(createDegreeDto: CreateDegreeDto) {
        try {
            console.log('Creating degree with data:', createDegreeDto);
            const result = await this.prisma.degree.create({
                data: createDegreeDto,
            });
            console.log('Degree created successfully:', result);
            return result;
        } catch (error) {
            console.error('Error creating degree in service:', error);
            throw error;
        }
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        search?: string;
        isActive?: boolean;
    }) {
        const { skip, take, search, isActive } = params || {};
        return this.prisma.degree.findMany({
            skip,
            take,
            where: {
                AND: [
                    search ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { code: { contains: search, mode: 'insensitive' } },
                        ],
                    } : {},
                    isActive !== undefined ? { isActive } : {},
                ],
            },
            orderBy: { displayOrder: 'asc' },
        });
    }

    async findOne(id: string) {
        const degree = await this.prisma.degree.findUnique({
            where: { id },
        });
        if (!degree) {
            throw new NotFoundException(`Degree with ID ${id} not found`);
        }
        return degree;
    }

    async update(id: string, updateDegreeDto: UpdateDegreeDto) {
        try {
            return await this.prisma.degree.update({
                where: { id },
                data: updateDegreeDto,
            });
        } catch (error) {
            throw new NotFoundException(`Degree with ID ${id} not found`);
        }
    }

    async remove(id: string) {
        try {
            return await this.prisma.degree.delete({
                where: { id },
            });
        } catch (error) {
            throw new NotFoundException(`Degree with ID ${id} not found`);
        }
    }
}
