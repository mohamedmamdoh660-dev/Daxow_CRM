'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DegreesTable } from '@/components/degrees/degrees-table';
import { DegreeFormDialog } from '@/components/degrees/degree-form-dialog';

export default function DegreesPage() {
    const [degrees, setDegrees] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const fetchDegrees = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/degrees?page=${page}&pageSize=${pageSize}&search=${searchQuery}`
            );

            if (response.ok) {
                const data = await response.json();
                // Handle different response structures gracefully
                if (Array.isArray(data)) {
                    setDegrees(data);
                    setTotalCount(data.length);
                } else if (data.data) {
                    setDegrees(data.data);
                    setTotalCount(data.total || data.data.length);
                } else if (data.degrees) {
                    setDegrees(data.degrees);
                    setTotalCount(data.totalCount || data.degrees.length);
                } else {
                    setDegrees([]);
                    setTotalCount(0);
                }
            }
        } catch (error) {
            console.error('Error fetching degrees:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDegrees();
    }, [page, pageSize, searchQuery]);

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Degrees</CardTitle>
                            <CardDescription>
                                Manage academic degrees (e.g., Bachelor, Master, PhD)
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchDegrees}
                                disabled={isLoading}
                            >
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Degree
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DegreesTable
                        degrees={degrees}
                        totalCount={totalCount}
                        page={page}
                        pageSize={pageSize}
                        searchQuery={searchQuery}
                        isLoading={isLoading}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        onSearchChange={setSearchQuery}
                        onRefresh={fetchDegrees}
                    />
                </CardContent>
            </Card>

            <DegreeFormDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={fetchDegrees}
            />
        </div>
    );
}
