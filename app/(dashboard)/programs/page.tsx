'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ProgramsTable } from '@/components/programs/programs-table';
import { useDebounce } from '@/hooks/use-debounce';

export default function ProgramsPage() {
    const [data, setData] = useState<any[]>([]);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);

    // Filters State
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        facultyId: undefined,
        degreeId: undefined,
        isActive: undefined,
    });

    // Dropdown Data
    const [faculties, setFaculties] = useState([]);
    const [degrees, setDegrees] = useState([]);

    const debouncedSearch = useDebounce(search, 500);

    const fetchPrograms = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', meta.page.toString());
            params.append('pageSize', meta.pageSize.toString());
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (filters.facultyId) params.append('facultyId', filters.facultyId);
            if (filters.degreeId) params.append('degreeId', filters.degreeId);
            if (filters.isActive) params.append('isActive', filters.isActive);

            const res = await fetch(`/api/programs?${params.toString()}`);
            if (res.ok) {
                const result = await res.json();
                setData(result.data || []);
                setMeta(result.meta || { page: 1, pageSize: 10, total: 0, totalPages: 0 });
            }
        } catch (error) {
            console.error('Error fetching programs:', error);
        } finally {
            setLoading(false);
        }
    }, [meta.page, meta.pageSize, debouncedSearch, filters]);

    // Initial Data Load (Faculties types etc)
    useEffect(() => {
        const loadStaticData = async () => {
            try {
                const [facRes, degRes] = await Promise.all([
                    fetch('/api/faculties'),
                    fetch('/api/degrees')
                ]);
                if (facRes.ok) setFaculties((await facRes.json()).data || []);
                if (degRes.ok) setDegrees(await degRes.json());
            } catch (e) {
                console.error('Error loading static data', e);
            }
        };
        loadStaticData();
    }, []);

    // Fetch Programs on change
    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Programs</h1>
                    <p className="text-muted-foreground">Manage academic program catalog</p>
                </div>
                <Button asChild>
                    <Link href="/programs/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Program
                    </Link>
                </Button>
            </div>

            <ProgramsTable
                data={data}
                meta={meta}
                loading={loading}
                faculties={faculties}
                degrees={degrees}
                filters={filters}
                onPageChange={(page) => setMeta(prev => ({ ...prev, page }))}
                onSearchChange={setSearch}
                onFilterChange={(newFilters) => {
                    setFilters(newFilters);
                    setMeta(prev => ({ ...prev, page: 1 }));
                }}
                onRefresh={fetchPrograms}
            />
        </div>
    );
}
