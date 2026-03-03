'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { StudentsTable } from '@/components/students/students-table';
import { usePermissions } from '@/lib/hooks/use-permissions';
import {
    SmartFilterPanel,
    SmartFilterToggleButton,
    SmartActiveFilterChips,
    buildSmartFilterParams,
    type SmartFilterField,
    type AppliedFilter,
} from '@/components/shared/smart-filter-panel';
import { getModuleStatuses } from '@/lib/settings/statuses';

export default function StudentsPage() {
    const { canAdd, canEdit, canDelete } = usePermissions('Students');

    // ── Data state ───────────────────────────────────────────────────────────
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    // ── Filter state ─────────────────────────────────────────────────────────
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([]);

    // ── Dynamic option lists ─────────────────────────────────────────────────
    const [agents, setAgents] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);

    const studentStatuses = getModuleStatuses('students');

    // Fetch lookup data for filter dropdowns
    useEffect(() => {
        // Agents
        fetch('/api/agents?pageSize=200')
            .then((r) => r.json())
            .then((res) => {
                const list = Array.isArray(res) ? res : (res.data || res.agents || []);
                setAgents(list);
            })
            .catch(() => { });

        // Programs
        fetch('/api/programs?pageSize=500')
            .then((r) => r.json())
            .then((res) => {
                const list = Array.isArray(res) ? res : (res.data || res.programs || []);
                setPrograms(list);
            })
            .catch(() => { });

        // Countries
        fetch('/api/countries?pageSize=300')
            .then((r) => r.json())
            .then((res) => {
                const list = Array.isArray(res) ? res : (res.data || res.countries || []);
                setCountries(list);
            })
            .catch(() => { });
    }, []);

    // ── Smart filter fields (all table columns) ──────────────────────────────
    const smartFields: SmartFilterField[] = [
        {
            key: 'studentId',
            label: 'Student ID',
            type: 'text',
        },
        {
            key: 'name',
            label: 'Name',
            type: 'text',
        },
        {
            key: 'email',
            label: 'Email',
            type: 'text',
        },
        {
            key: 'programId',
            label: 'Program',
            type: 'select',
            options: programs.map((p) => ({
                id: p.id,
                label: p.name,
                value: p.id,
            })),
        },
        {
            key: 'nationality',
            label: 'Country',
            type: 'select',
            options: countries.map((c) => ({
                id: c.id,
                label: c.name,
                value: c.id,
            })),
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: studentStatuses.map((s) => ({
                id: s.id,
                label: s.label,
                value: s.label,
            })),
        },
        {
            key: 'agentId',
            label: 'Agent',
            type: 'select',
            options: agents.map((a) => ({
                id: a.id,
                label: a.companyName || a.contactPerson || a.email,
                value: a.id,
            })),
        },
        {
            key: 'fees',
            label: 'Fees',
            type: 'number',
        },
        {
            key: 'createdAt',
            label: 'Created At',
            type: 'date',
        },
        {
            key: 'isActive',
            label: 'Active',
            type: 'boolean',
        },
    ];

    // ── Query building ────────────────────────────────────────────────────────
    const buildQueryParams = useCallback(() => {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });
        if (searchQuery) params.set('search', searchQuery);
        buildSmartFilterParams(params, appliedFilters);
        return params;
    }, [page, pageSize, searchQuery, appliedFilters]);

    // ── Fetch students ────────────────────────────────────────────────────────
    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/students?${buildQueryParams()}`);
            const data = await res.json();
            setStudents(data.students || data.data || []);
            setTotalCount(data.total || 0);
        } catch (e) {
            console.error('Failed to fetch students', e);
        } finally {
            setLoading(false);
        }
    }, [buildQueryParams]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, appliedFilters]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // ── Filter helpers ────────────────────────────────────────────────────────
    const totalActiveFilters = appliedFilters.length;

    const handleFiltersChange = (filters: AppliedFilter[]) => {
        setAppliedFilters(filters);
        setPage(1);
    };

    return (
        <div className="container py-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-8 w-8" />
                        Students
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage enrolled and active students</p>
                </div>
                {canAdd && (
                    <Button asChild>
                        <Link href="/students/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Student
                        </Link>
                    </Button>
                )}
            </div>

            {/* Main layout */}
            <div className="flex gap-4 items-start">

                {/* Filter Sidebar */}
                {filterPanelOpen && (
                    <div className="w-[340px] shrink-0 rounded-lg border border-border overflow-hidden shadow-sm">
                        <SmartFilterPanel
                            fields={smartFields}
                            appliedFilters={appliedFilters}
                            onFiltersChange={handleFiltersChange}
                            className="min-h-[500px]"
                        />
                    </div>
                )}

                {/* Table Card */}
                <div className="flex-1 min-w-0">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium">All Students</p>
                                    <p className="text-xs text-muted-foreground">
                                        {totalCount} student{totalCount !== 1 ? 's' : ''} found
                                    </p>
                                </div>
                                <SmartFilterToggleButton
                                    activeCount={totalActiveFilters}
                                    onClick={() => setFilterPanelOpen((o) => !o)}
                                    isOpen={filterPanelOpen}
                                />
                            </div>
                            <SmartActiveFilterChips
                                appliedFilters={appliedFilters}
                                onRemove={(id) =>
                                    handleFiltersChange(appliedFilters.filter((f) => f.id !== id))
                                }
                                onClearAll={() => handleFiltersChange([])}
                            />
                        </CardHeader>
                        <CardContent className="p-0">
                            <StudentsTable
                                students={students}
                                totalCount={totalCount}
                                page={page}
                                pageSize={pageSize}
                                searchQuery={searchQuery}
                                isLoading={loading}
                                onPageChange={setPage}
                                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                                onSearchChange={(q) => { setSearchQuery(q); setPage(1); }}
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
