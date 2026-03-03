'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Plus, Search, FileText, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissions } from '@/lib/hooks/use-permissions';
import {
    SmartFilterPanel,
    SmartFilterToggleButton,
    SmartActiveFilterChips,
    buildSmartFilterParams,
    type SmartFilterField,
    type AppliedFilter,
} from '@/components/shared/smart-filter-panel';

const STAGES = [
    'Draft', 'Submitted', 'Under Review', 'Missing Docs', 'Conditional Acceptance',
    'Final Acceptance', 'Rejected', 'Enrolled', 'Cancelled',
];

const STAGE_COLORS: Record<string, string> = {
    'Draft': 'bg-gray-100 text-gray-700',
    'Submitted': 'bg-blue-100 text-blue-700',
    'Under Review': 'bg-yellow-100 text-yellow-700',
    'Missing Docs': 'bg-amber-100 text-amber-700',
    'Conditional Acceptance': 'bg-purple-100 text-purple-700',
    'Final Acceptance': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Enrolled': 'bg-emerald-100 text-emerald-700',
    'Cancelled': 'bg-gray-200 text-gray-500',
};

export default function ApplicationsPage() {
    const { canAdd, canDelete } = usePermissions('Applications');
    const [data, setData] = useState<any[]>([]);
    const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<{ total: number; byStage: Record<string, number> } | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([]);

    // Dynamic option lists for select fields
    const [agents, setAgents] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);

    const debouncedSearch = useDebounce(search, 500);

    // Fetch lookup data for filter dropdowns
    useEffect(() => {
        fetch('/api/agents?pageSize=200')
            .then((r) => r.json())
            .then((res) => setAgents(Array.isArray(res) ? res : (res.data || [])))
            .catch(() => { });

        fetch('/api/programs?pageSize=500')
            .then((r) => r.json())
            .then((res) => setPrograms(Array.isArray(res) ? res : (res.data || [])))
            .catch(() => { });
    }, []);

    // ── Smart filter fields (all table columns) ──────────────────────────────
    const smartFields: SmartFilterField[] = [
        {
            key: 'applicationName',
            label: 'App Name',
            type: 'text',
        },
        {
            key: 'studentName',
            label: 'Student Name',
            type: 'text',
        },
        {
            key: 'studentEmail',
            label: 'Student Email',
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
            key: 'stage',
            label: 'Stage',
            type: 'select',
            options: STAGES.map((s) => ({ id: s, label: s, value: s })),
        },
        {
            key: 'createdAt',
            label: 'Created Date',
            type: 'date',
        },
    ];

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', meta.page.toString());
            params.append('limit', meta.limit.toString());
            if (debouncedSearch) params.append('search', debouncedSearch);
            buildSmartFilterParams(params, appliedFilters);

            const res = await fetch(`/api/applications?${params.toString()}`);
            if (res.ok) {
                const result = await res.json();
                setData(Array.isArray(result.data) ? result.data : []);
                setMeta(result.meta || { page: 1, limit: 25, total: 0, totalPages: 0 });
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    }, [meta.page, meta.limit, debouncedSearch, appliedFilters]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/applications/stats');
            if (res.ok) {
                const result = await res.json();
                setStats({ total: result.total || 0, byStage: result.byStage || {} });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => { fetchApplications(); }, [fetchApplications]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    // Reset to page 1 when filters/search change
    useEffect(() => {
        setMeta(prev => ({ ...prev, page: 1 }));
    }, [debouncedSearch, appliedFilters]);

    const handleFiltersChange = (filters: AppliedFilter[]) => {
        setAppliedFilters(filters);
        setMeta(prev => ({ ...prev, page: 1 }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this application?')) return;
        setDeleteId(id);
        try {
            const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
            if (res.ok) { fetchApplications(); fetchStats(); }
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Applications</h1>
                    <p className="text-muted-foreground">Manage student applications</p>
                </div>
                {canAdd && (
                    <Button asChild>
                        <Link href="/applications/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Application
                        </Link>
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-sm text-muted-foreground">Total</div>
                        </CardContent>
                    </Card>
                    {Object.entries(stats.byStage).map(([stage, count]) => (
                        <Card key={stage}>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold">{count}</div>
                                <div className="text-sm text-muted-foreground">{stage}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

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

                {/* Table */}
                <div className="flex-1 min-w-0">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search applications..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 w-72 h-9"
                                    />
                                </div>
                                <SmartFilterToggleButton
                                    activeCount={appliedFilters.length}
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
                            {loading ? (
                                <div className="flex justify-center items-center py-16">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">No applications found</h3>
                                    <p className="text-muted-foreground mb-4">Get started by creating a new application.</p>
                                    {canAdd && (
                                        <Button asChild>
                                            <Link href="/applications/new">
                                                <Plus className="mr-2 h-4 w-4" />
                                                New Application
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>App Name</TableHead>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Program</TableHead>
                                                <TableHead>Agent</TableHead>
                                                <TableHead>Stage</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.map((app) => (
                                                <TableRow key={app.id}>
                                                    <TableCell className="font-medium">
                                                        <Link href={`/applications/${app.id}`} className="hover:underline text-blue-600">
                                                            {app.applicationName || app.id.slice(0, 8)}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{app.student?.fullName}</div>
                                                            <div className="text-xs text-muted-foreground">{app.student?.email}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{app.program?.name}</div>
                                                            <div className="text-xs text-muted-foreground">{app.program?.faculty?.name}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {app.agent ? (
                                                            <div>
                                                                <div className="font-medium">{app.agent.firstName} {app.agent.lastName}</div>
                                                                {app.agency?.companyName && <div className="text-xs text-muted-foreground">{app.agency.companyName}</div>}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={STAGE_COLORS[app.stage] || 'bg-gray-100 text-gray-700'}>
                                                            {app.stage}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {canDelete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(app.id)}
                                                                disabled={deleteId === app.id}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                {deleteId === app.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                disabled={meta.page <= 1}
                                                onClick={() => setMeta(prev => ({ ...prev, page: prev.page - 1 }))}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm">Page {meta.page} of {meta.totalPages}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                disabled={meta.page >= meta.totalPages}
                                                onClick={() => setMeta(prev => ({ ...prev, page: prev.page + 1 }))}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
