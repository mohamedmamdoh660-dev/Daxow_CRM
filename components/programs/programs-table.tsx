'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ProgramsTableProps {
    data: any[];
    meta: any;
    onPageChange: (page: number) => void;
    onSearchChange: (search: string) => void;
    onFilterChange: (filters: any) => void;
    filters: any;
    loading: boolean;
    faculties: any[];
    degrees: any[];
    onRefresh?: () => void;
}

export function ProgramsTable({
    data,
    meta,
    onPageChange,
    onSearchChange,
    onFilterChange,
    filters,
    loading,
    faculties,
    degrees,
    onRefresh,
}: ProgramsTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearchChange(e.target.value);
    };

    const handleFilterChange = (key: string, value: string) => {
        onFilterChange({ ...filters, [key]: value === 'all' ? undefined : value });
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/programs/${deleteId}`, { method: 'DELETE' });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete');
            }
            toast.success('Program deleted successfully');
            onRefresh?.();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete program');
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading programs...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
                <Input
                    placeholder="Search programs..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="max-w-sm"
                />
                <div className="flex gap-2">
                    <Select
                        value={filters.facultyId || 'all'}
                        onValueChange={(val) => handleFilterChange('facultyId', val)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Faculties" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Faculties</SelectItem>
                            {faculties.map((f) => (
                                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.degreeId || 'all'}
                        onValueChange={(val) => handleFilterChange('degreeId', val)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Degrees" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Degrees</SelectItem>
                            {degrees.map((d) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Faculty</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead>Degree</TableHead>
                            <TableHead>Official Tuition</TableHead>
                            <TableHead>Study Years</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No programs found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((program) => (
                                <TableRow key={program.id}>
                                    <TableCell className="font-medium">
                                        {program.name}
                                        {program.languageRel && (
                                            <Badge variant="outline" className="ml-2 text-xs">
                                                {program.languageRel.code || program.languageRel.name}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{program.faculty?.name || '-'}</TableCell>
                                    <TableCell>{program.specialty?.name || program.specialty?.title?.name || '-'}</TableCell>
                                    <TableCell>{program.degree?.name || '-'}</TableCell>
                                    <TableCell>
                                        {program.officialTuition ? (
                                            <>
                                                {Number(program.officialTuition).toLocaleString()} {program.tuitionCurrency || 'USD'}
                                                {program.discountedTuition && (
                                                    <div className="text-xs text-green-600 font-medium">
                                                        → {Number(program.discountedTuition).toLocaleString()} {program.tuitionCurrency || 'USD'}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-green-600 font-medium">Free</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{program.studyYears || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Badge variant={program.isActive ? 'default' : 'secondary'}>
                                                {program.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                            {program.activeApplications ? (
                                                <Badge variant="outline" className="text-green-600 border-green-600">Open</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">Closed</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/programs/${program.id}`}>
                                                <Button variant="ghost" size="icon" title="Edit">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Delete"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeleteId(program.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages} ({meta.total} items)
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(meta.page - 1)}
                        disabled={meta.page <= 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(meta.page + 1)}
                        disabled={meta.page >= meta.totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Program</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this program? This action cannot be undone.
                            Any linked applications will also be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
