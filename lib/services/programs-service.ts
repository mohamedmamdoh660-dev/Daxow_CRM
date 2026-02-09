import { Program, ProgramFilters, ProgramsListResponse } from '@/types/programs';

const API_BASE_URL = '/api/programs';

export const ProgramsService = {
    // --- Core CRUD Operations ---

    /**
     * Fetch programs with pagination and filtering
     */
    async getPrograms(
        page = 1,
        pageSize = 10,
        filters: ProgramFilters = {}
    ): Promise<ProgramsListResponse> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('pageSize', pageSize.toString());

        if (filters.search) params.append('search', filters.search);
        if (filters.facultyId) params.append('facultyId', filters.facultyId);
        if (filters.specialtyId) params.append('specialtyId', filters.specialtyId);
        if (filters.degreeId) params.append('degreeId', filters.degreeId);
        if (filters.languageId) params.append('languageId', filters.languageId);
        if (filters.countryId) params.append('countryId', filters.countryId);
        if (filters.cityId) params.append('cityId', filters.cityId);

        if (filters.isActive !== undefined) {
            params.append('isActive', filters.isActive.toString());
        }
        if (filters.activeApplications !== undefined) {
            params.append('activeApplications', filters.activeApplications.toString());
        }

        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch programs');
        }
        return response.json();
    },

    /**
     * Fetch a single program by ID
     */
    async getProgramById(id: string): Promise<Program> {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch program');
        }
        return response.json();
    },

    /**
     * Create a new program
     */
    async createProgram(data: Partial<Program>): Promise<Program> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create program');
        }
        return response.json();
    },

    /**
     * Update an existing program
     */
    async updateProgram(id: string, data: Partial<Program>): Promise<Program> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update program');
        }
        return response.json();
    },

    /**
     * Delete a program by ID
     */
    async deleteProgram(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete program');
        }
    },

    // --- Lookup / Helper Methods ---

    async getCountries(search = '', isActive = true): Promise<any[]> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (isActive) params.append('isActive', 'true');

        const res = await fetch(`/api/countries?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch countries');
        const data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
    },

    async getCities(countryId?: string, search = '', isActive = true): Promise<any[]> {
        const params = new URLSearchParams();
        if (countryId) params.append('countryId', countryId);
        if (search) params.append('search', search);
        if (isActive) params.append('isActive', 'true');

        const res = await fetch(`/api/cities?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch cities');
        const data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
    },

    async getFaculties(search = '', isActive = true): Promise<any[]> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (isActive) params.append('isActive', 'true');

        const res = await fetch(`/api/faculties?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch faculties');
        const data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
    },

    async getSpecialties(facultyId?: string, search = '', isActive = true): Promise<any[]> {
        const params = new URLSearchParams();
        if (facultyId) params.append('facultyId', facultyId);
        if (search) params.append('search', search);
        if (isActive) params.append('isActive', 'true');

        const res = await fetch(`/api/specialties?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch specialties');
        const data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
    },

    async getDegrees(): Promise<any[]> {
        const res = await fetch(`/api/degrees`);
        if (!res.ok) throw new Error('Failed to fetch degrees');
        const data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
    },

    async getLanguages(isActive = true): Promise<any[]> {
        const params = new URLSearchParams();
        if (isActive) params.append('isActive', 'true');

        const res = await fetch(`/api/languages?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch languages');
        const data = await res.json();
        return Array.isArray(data) ? data : data.data || [];
    }
};
