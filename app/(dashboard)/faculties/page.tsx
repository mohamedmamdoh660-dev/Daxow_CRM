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
import { FacultiesTable } from '@/components/faculties/faculties-table';
import { FacultyFormDialog } from '@/components/faculties/faculty-form-dialog';

export default function FacultiesPage() {
    const [faculties, setFaculties] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const fetchFaculties = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3001/api/faculties?page=${page}&pageSize=${pageSize}&search=${searchQuery}`
            );

            if (response.ok) {
                const data = await response.json();
                setFaculties(data.data || []);
                setTotalCount(data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching faculties:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculties();
    }, [page, pageSize, searchQuery]);

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Faculties</CardTitle>
                            <CardDescription>
                                Manage university faculties
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchFaculties}
                                disabled={isLoading}
                            >
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Faculty
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <FacultiesTable
                        faculties={faculties}
                        totalCount={totalCount}
                        page={page}
                        pageSize={pageSize}
                        searchQuery={searchQuery}
                        isLoading={isLoading}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        onSearchChange={setSearchQuery}
                        onRefresh={fetchFaculties}
                    />
                </CardContent>
            </Card>

            <FacultyFormDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={fetchFaculties}
            />
        </div>
    );
}
