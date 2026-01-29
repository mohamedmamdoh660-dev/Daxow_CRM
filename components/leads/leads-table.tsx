'use client';

import { useState } from 'react';
import { Search, X, CheckCircle, XCircle, Trash2, Mail, Phone, MapPin, Building, User } from 'lucide-react';
import Link from 'next/link';
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
import { LeadsRowActions } from './leads-row-actions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface LeadsTableProps {
    leads: any[];
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

const statusColors: Record<string, string> = {
    'New': '#6366f1',
    'Contacted': '#8b5cf6',
    'Qualified': '#3b82f6',
    'Converted': '#10b981',
    'Lost': '#ef4444',
};

export function LeadsTable({
    leads,
    totalCount,
    page,
    pageSize,
    searchQuery,
    isLoading,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onRefresh,
}: LeadsTableProps) {
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
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
        if (selectedRows.size === leads.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(leads.map(l => l.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRows.size === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedRows.size} leads?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const promises = Array.from(selectedRows).map(id =>
                fetch(`http://localhost:3001/api/leads/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-performed-by': 'Bulk Delete' }
                })
            );

            await Promise.all(promises);
            toast.success(`Deleted ${selectedRows.size} leads successfully`);
            setSelectedRows(new Set());
            onRefresh();
        } catch (error) {
            toast.error('Failed to delete some leads');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkActivate = async (active: boolean) => {
        if (selectedRows.size === 0) return;

        setIsDeleting(true);
        try {
            const promises = Array.from(selectedRows).map(id =>
                fetch(`http://localhost:3001/api/leads/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-performed-by': 'Bulk Update'
                    },
                    body: JSON.stringify({ isActive: active })
                })
            );

            await Promise.all(promises);
            toast.success(`${active ? 'Activated' : 'Deactivated'} ${selectedRows.size} leads`);
            setSelectedRows(new Set());
            onRefresh();
        } catch (error) {
            toast.error('Failed to update some leads');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search leads..."
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
                            <SelectItem value="200">200</SelectItem>
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
                            disabled={isDeleting}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkActivate(false)}
                            disabled={isDeleting}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deactivate
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
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
                                    checked={selectedRows.size === leads.length && leads.length > 0}
                                    onCheckedChange={toggleAll}
                                />
                            </TableHead>
                            <TableHead>Name / Company</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No leads found
                                </TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow
                                    key={lead.id}
                                    className={`cursor-pointer ${selectedRows.has(lead.id) ? 'bg-muted' : ''}`}
                                    onClick={(e) => {
                                        if (!(e.target as HTMLElement).closest('.checkbox-cell') && !(e.target as HTMLElement).closest('button')) {
                                            window.location.href = `/leads/${lead.id}`;
                                        }
                                    }}
                                >
                                    <TableCell className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedRows.has(lead.id)}
                                            onCheckedChange={() => toggleRow(lead.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="space-y-1">
                                            <div className="font-semibold">
                                                {lead.type === 'Agent' ? lead.companyName : lead.fullName}
                                            </div>
                                            {lead.leadId && (
                                                <div className="text-xs text-muted-foreground">
                                                    {lead.leadId}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="flex w-fit items-center gap-1">
                                            {lead.type === 'Agent' ? <Building className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                            {lead.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm space-y-1">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="h-3 w-3" />
                                                {lead.email || '-'}
                                            </div>
                                            {lead.phone && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="h-3 w-3" />
                                                    {lead.phone}
                                                </div>
                                            )}
                                            {(lead.city || lead.country) && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    {[lead.city, lead.country].filter(Boolean).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            style={{ backgroundColor: statusColors[lead.status] || '#6b7280', color: 'white' }}
                                        >
                                            {lead.status}
                                        </Badge>
                                        {!lead.isActive && (
                                            <Badge variant="secondary" className="ml-2">
                                                Inactive
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {lead.createdAt ? format(new Date(lead.createdAt), 'PPP') : 'N/A'}
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <LeadsRowActions lead={lead} onRefresh={onRefresh} />
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
                        {totalCount} leads
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
