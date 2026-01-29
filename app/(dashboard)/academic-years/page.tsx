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
import { AcademicYearsTable } from '@/components/academic-years/academic-years-table';
import { AddAcademicYearDialog } from '@/components/academic-years/add-academic-year-dialog';

export default function AcademicYearsPage() {
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const fetchAcademicYears = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/academic-years?page=${page}&pageSize=${pageSize}&search=${searchQuery}`
            );

            if (response.ok) {
                const data = await response.json();
                setAcademicYears(data.data || []);
                setTotalCount(data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching academic years:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAcademicYears();
    }, [page, pageSize, searchQuery]);

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Academic Years</CardTitle>
                            <CardDescription>
                                Manage academic years for student applications
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchAcademicYears}
                                disabled={isLoading}
                            >
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Academic Year
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <AcademicYearsTable
                        academicYears={academicYears}
                        totalCount={totalCount}
                        page={page}
                        pageSize={pageSize}
                        searchQuery={searchQuery}
                        isLoading={isLoading}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        onSearchChange={setSearchQuery}
                        onRefresh={fetchAcademicYears}
                    />
                </CardContent>
            </Card>

            <AddAcademicYearDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={fetchAcademicYears}
            />
        </div>
    );
}
