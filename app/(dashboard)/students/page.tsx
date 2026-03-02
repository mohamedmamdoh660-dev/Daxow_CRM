'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { StudentsTable } from '@/components/students/students-table';
import { usePermissions } from '@/lib/hooks/use-permissions';
import {
    FilterPanel,
    FilterToggleButton,
    ActiveFilterChips,
    type FilterField,
    type SystemFilter,
} from '@/components/shared/filter-panel';
import { getModuleStatuses } from '@/lib/settings/statuses';

const SYSTEM_FILTERS: SystemFilter[] = [
    {
        id: 'active-records',
        label: 'Active Records',
        description: 'Show only active students',
        filterKey: 'isActive',
        filterValue: 'true',
    },
    {
        id: 'inactive-records',
        label: 'Inactive Records',
        description: 'Show only inactive students',
        filterKey: 'isActive',
        filterValue: 'false',
    },
];

const STUDENT_FILTER_FIELDS: FilterField[] = [
    {
        key: 'status',
        label: 'Status',
        options: [], // will be populated from settings
    },
];

export default function StudentsPage() {
    const { canAdd, canEdit, canDelete } = usePermissions('Students');
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
    const [agents, setAgents] = useState<any[]>([]);

    // Build filter fields dynamically
    const studentStatuses = getModuleStatuses('students');
    const filterFields: FilterField[] = [
        {
            key: 'status',
            label: 'Status',
            options: studentStatuses.map((s) => ({ id: s.label, label: s.label, value: s.label })),
        },
        {
            key: 'agentId',
            label: 'Agent',
            options: agents.map((a) => ({
                id: a.id,
                label: a.companyName || a.contactPerson || a.email,
                value: a.id,
            })),
        },
    ];

    // Fetch agents for the filter
    useEffect(() => {
        fetch('/api/agents?pageSize=200')
            .then((r) => r.json())
            .then((res) => {
                // Backend returns { data: [...], total, page, pageSize, totalPages }
                const list = Array.isArray(res) ? res : (res.data || res.agents || []);
                setAgents(list);
            })
            .catch(() => { });
    }, []);

    const buildQueryParams = useCallback(() => {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            search: searchQuery,
        });

        // Add active filters to query params
        for (const [key, values] of Object.entries(activeFilters)) {
            if (values.length > 0) {
                // For isActive we send single value; for others send comma-separated or first
                if (key === 'isActive') {
                    params.set('isActive', values[0]);
                } else if (values.length === 1) {
                    params.set(key, values[0]);
                } else {
                    // Multiple values: send as repeated params
                    values.forEach((v) => params.append(key, v));
                }
            }
        }
        return params;
    }, [page, pageSize, searchQuery, activeFilters]);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const params = buildQueryParams();
            const response = await fetch(`/api/students?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data.students || []);
                setTotalCount(data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    }, [buildQueryParams]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleFiltersChange = (newFilters: Record<string, string[]>) => {
        setActiveFilters(newFilters);
        setPage(1);
    };

    const handleRemoveFilter = (fieldKey: string, value: string) => {
        const current = activeFilters[fieldKey] || [];
        const updated = current.filter((v) => v !== value);
        const newFilters = { ...activeFilters };
        if (updated.length === 0) {
            delete newFilters[fieldKey];
        } else {
            newFilters[fieldKey] = updated;
        }
        setActiveFilters(newFilters);
        setPage(1);
    };

    const totalActiveFilters = Object.values(activeFilters).reduce(
        (sum, vals) => sum + vals.length,
        0
    );

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <GraduationCap className="h-8 w-8" />
                        Students
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage enrolled and active students</p>
                </div>
                {canAdd && (
                    <Link href="/students/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Student
                        </Button>
                    </Link>
                )}
            </div>

            <div className="flex gap-4 items-start">
                {/* ─── Filter Panel (Sidebar) ─── */}
                {filterPanelOpen && (
                    <div className="w-64 shrink-0 rounded-lg border border-border overflow-hidden shadow-sm">
                        <FilterPanel
                            fields={filterFields}
                            systemFilters={SYSTEM_FILTERS}
                            activeFilters={activeFilters}
                            onFiltersChange={handleFiltersChange}
                            className="min-h-[600px]"
                        />
                    </div>
                )}

                {/* ─── Main Content ─── */}
                <div className="flex-1 min-w-0">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>All Students</CardTitle>
                                    <CardDescription>
                                        {totalCount} student{totalCount !== 1 ? 's' : ''} found
                                    </CardDescription>
                                </div>
                                <FilterToggleButton
                                    activeCount={totalActiveFilters}
                                    onClick={() => setFilterPanelOpen((o) => !o)}
                                    isOpen={filterPanelOpen}
                                />
                            </div>
                            {/* Active filter chips */}
                            <ActiveFilterChips
                                activeFilters={activeFilters}
                                fields={filterFields}
                                systemFilters={SYSTEM_FILTERS}
                                onRemove={handleRemoveFilter}
                                onClearAll={() => {
                                    setActiveFilters({});
                                    setPage(1);
                                }}
                            />
                        </CardHeader>
                        <CardContent>
                            <StudentsTable
                                students={students}
                                totalCount={totalCount}
                                page={page}
                                pageSize={pageSize}
                                searchQuery={searchQuery}
                                isLoading={loading}
                                onPageChange={setPage}
                                onPageSizeChange={setPageSize}
                                onSearchChange={(q) => {
                                    setSearchQuery(q);
                                    setPage(1);
                                }}
                                onRefresh={fetchStudents}
                                canEdit={canEdit}
                                canDelete={canDelete}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
