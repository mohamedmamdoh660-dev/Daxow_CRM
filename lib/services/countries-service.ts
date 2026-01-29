import { prisma } from '@/lib/prisma';
import type { Country, Prisma } from '@prisma/client';

export interface GetCountriesParams {
    page?: number;
    pageSize?: number;
    searchQuery?: string;
    orderBy?: 'name' | 'code' | 'createdAt';
    orderDirection?: 'asc' | 'desc';
    activeOnNationalities?: boolean;
    activeOnUniversity?: boolean;
}

export class CountriesService {
    /**
     * Get countries with pagination, search, and filters
     */
    async getCountries({
        page = 0,
        pageSize = 10,
        searchQuery = '',
        orderBy = 'name',
        orderDirection = 'asc',
        activeOnNationalities,
        activeOnUniversity
    }: GetCountriesParams = {}) {
        const skip = page * pageSize;

        // Build where clause
        const where: Prisma.CountryWhereInput = {
            AND: [
                // Search filter
                searchQuery
                    ? {
                        OR: [
                            { name: { contains: searchQuery, mode: 'insensitive' } },
                            { code: { contains: searchQuery, mode: 'insensitive' } }
                        ]
                    }
                    : {},
                // Active filters
                activeOnNationalities !== undefined
                    ? { activeOnNationalities }
                    : {},
            ]
        };

        try {
            const [countries, totalCount] = await Promise.all([
                prisma.country.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: { [orderBy]: orderDirection }
                }),
                prisma.country.count({ where })
            ]);

            return { countries, totalCount };
        } catch (error) {
            console.error('Error fetching countries:', error);
            throw new Error('Failed to fetch countries');
        }
    }

    /**
     * Get single country by ID
     */
    async getCountryById(id: string): Promise<Country | null> {
        try {
            return await prisma.country.findUnique({
                where: { id }
            });
        } catch (error) {
            console.error('Error fetching country:', error);
            throw new Error('Failed to fetch country');
        }
    }

    /**
     * Create a new country
     */
    async createCountry(data: {
        name: string;
        code?: string;
        activeOnNationalities?: boolean;
    }): Promise<Country> {
        try {
            return await prisma.country.create({
                data: {
                    name: data.name,
                    code: data.code || '',
                    activeOnNationalities: data.activeOnNationalities ?? true,
                }
            });
        } catch (error: any) {
            console.error('Error creating country:', error);
            if (error.code === 'P2002') {
                throw new Error('Country with this name or code already exists');
            }
            throw new Error('Failed to create country');
        }
    }

    /**
     * Update an existing country
     */
    async updateCountry(
        id: string,
        data: Partial<Omit<Country, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<Country> {
        try {
            return await prisma.country.update({
                where: { id },
                data: {
                    ...data,
                    updatedAt: new Date()
                }
            });
        } catch (error: any) {
            console.error('Error updating country:', error);
            if (error.code === 'P2002') {
                throw new Error('Country with this name or code already exists');
            }
            if (error.code === 'P2025') {
                throw new Error('Country not found');
            }
            throw new Error('Failed to update country');
        }
    }

    /**
     * Delete a country
     */
    async deleteCountry(id: string): Promise<void> {
        try {
            await prisma.country.delete({
                where: { id }
            });
        } catch (error: any) {
            console.error('Error deleting country:', error);
            if (error.code === 'P2025') {
                throw new Error('Country not found');
            }
            throw new Error('Failed to delete country');
        }
    }

    /**
     * Toggle nationality status for a country
     */
    async toggleNationalitiesStatus(id: string, active: boolean): Promise<Country> {
        try {
            return await prisma.country.update({
                where: { id },
                data: {
                    activeOnNationalities: active,
                    updatedAt: new Date()
                }
            });
        } catch (error) {
            console.error('Error toggling nationalities status:', error);
            throw new Error('Failed to update nationality status');
        }
    }

    /**
     * Get all active countries for nationalities dropdown
     */
    async getNationalityCountries(): Promise<Country[]> {
        try {
            return await prisma.country.findMany({
                where: {
                    activeOnNationalities: true,
                    isActive: true
                },
                orderBy: { name: 'asc' }
            });
        } catch (error) {
            console.error('Error fetching nationality countries:', error);
            throw new Error('Failed to fetch nationality countries');
        }
    }
}

// Export singleton instance
export const countriesService = new CountriesService();
