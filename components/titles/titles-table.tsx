'use client';

import { useState } from 'react';
import { Search, X, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHead,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TitlesRowActions } from './titles-row-actions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SpecialtyTitlesTableProps {
    titles: any[];
    totalCount: number;
    page: number;
    pageSize: number;
    searchQuery: string;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onSearchChange: (query: string) => void;
    onRefresh: () => void;
}

export function TitlesTable({
    titles,
    totalCount,
    page,
    pageSize,
    searchQuery,
    isLoading,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onRefresh,
}: SpecialtyTitlesTableProps) {
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const totalPages = Math.ceil(totalCount / pageSize);

    const toggleRow = (id: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const toggleAll = () => {
        if (selectedRows.size === titles.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(titles.map(t => t.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRows.size === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedRows.size} titles?`)) {
            return;
        }

        setIsBatchProcessing(true);
        try {
            const promises = Array.from(selectedRows).map(id =>
                fetch(`/api/titles/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-performed-by': 'Bulk Delete' }
                })
            );

            await Promise.all(promises);
            toast.success(`Deleted ${selectedRows.size} titles successfully`);
            setSelectedRows(new Set());
            onRefresh();
        } catch (error) {
            toast.error('Failed to delete some titles');
            console.error(error);
        } finally {
            setIsBatchProcessing(false);
        }
    };

    const handleBulkActivate = async (active: boolean) => {
        if (selectedRows.size === 0) return;

        setIsBatchProcessing(true);
        try {
            const promises = Array.from(selectedRows).map(id =>
                fetch(`/api/titles/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-performed-by': 'Bulk Update'
                    },
                    body: JSON.stringify({ isActive: active })
                })
            );

            await Promise.all(promises);
            toast.success(`${active ? 'Activated' : 'Deactivated'} ${selectedRows.size} titles`);
            setSelectedRows(new Set());
            onRefresh();
        } catch (error) {
            toast.error('Failed to update some titles');
            console.error(error);
        } finally {
            setIsBatchProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search titles..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8"
                    />
                </div>
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSearchChange('')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Rows per page:
                    </span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                            onPageSizeChange(Number(value));
                            onPageChange(1);
                        }}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedRows.size > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">
                        {selectedRows.size} selected
                    </span>
                    <div className="flex gap-2 ml-auto">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkActivate(true)}
                            disabled={isBatchProcessing}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkActivate(false)}
                            disabled={isBatchProcessing}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deactivate
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={isBatchProcessing}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border max-h-[500px] overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedRows.size === titles.length && titles.length > 0}
                                    onCheckedChange={toggleAll}
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : titles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No titles found
                                </TableCell>
                            </TableRow>
                        ) : (
                            titles.map((title) => (
                                <TableRow
                                    key={title.id}
                                    className={selectedRows.has(title.id) ? 'bg-muted' : ''}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRows.has(title.id)}
                                            onCheckedChange={() => toggleRow(title.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {title.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={title.isActive ? 'default' : 'secondary'}>
                                            {title.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {title.createdAt ? format(new Date(title.createdAt), 'PPP') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <TitlesRowActions title={title} onRefresh={onRefresh} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{' '}
                        {totalCount} titles
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={page === pageNum ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => onPageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages || isLoading}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
