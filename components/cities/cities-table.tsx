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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import { CitiesRowActions } from './cities-row-actions';
import { toast } from 'sonner';

interface CitiesTableProps {
    data: any[];
    onRefresh: () => void;
}

export function CitiesTable({ data, onRefresh }: CitiesTableProps) {
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

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
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map(c => c.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRows.size === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedRows.size} cities?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const promises = Array.from(selectedRows).map(id =>
                fetch(`http://localhost:3001/api/cities/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-performed-by': 'Bulk Delete' }
                })
            );

            await Promise.all(promises);
            toast.success(`Deleted ${selectedRows.size} cities successfully`);
            setSelectedRows(new Set());
            onRefresh();
        } catch (error) {
            toast.error('Failed to delete some cities');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkActivate = async (active: boolean) => {
        if (selectedRows.size === 0) return;

        setIsDeleting(true);
        try {
            const promises = Array.from(selectedRows).map(id =>
                fetch(`http://localhost:3001/api/cities/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-performed-by': 'Bulk Update'
                    },
                    body: JSON.stringify({ isActive: active })
                })
            );

            await Promise.all(promises);
            toast.success(`${active ? 'Activated' : 'Deactivated'} ${selectedRows.size} cities`);
            setSelectedRows(new Set());
            onRefresh();
        } catch (error) {
            toast.error('Failed to update some cities');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
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

            <div className="rounded-md border max-h-[500px] overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedRows.size === data.length && data.length > 0}
                                    onCheckedChange={toggleAll}
                                />
                            </TableHead>
                            <TableHead>City Name</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No cities found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((city) => (
                                <TableRow
                                    key={city.id}
                                    className={`cursor-pointer hover:bg-muted/50 ${selectedRows.has(city.id) ? 'bg-muted' : ''
                                        }`}
                                    onClick={() => window.location.href = `/cities/${city.id}`}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedRows.has(city.id)}
                                            onCheckedChange={() => toggleRow(city.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{city.name}</TableCell>
                                    <TableCell>{city.country?.name || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={city.isActive ? 'default' : 'secondary'}>
                                            {city.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <CitiesRowActions city={city} onRefresh={onRefresh} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
