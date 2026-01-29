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
import { SpecialtiesTable } from '@/components/specialties/specialties-table';
import { SpecialtyFormDialog } from '@/components/specialties/specialty-form-dialog';

export default function SpecialtiesPage() {
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const fetchSpecialties = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/specialties?page=${page}&pageSize=${pageSize}&search=${searchQuery}`
            );

            if (response.ok) {
                const data = await response.json();
                setSpecialties(data.data || []);
                setTotalCount(data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching specialties:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecialties();
    }, [page, pageSize, searchQuery]);

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Specialties</CardTitle>
                            <CardDescription>
                                Manage university specialties and programs
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchSpecialties}
                                disabled={isLoading}
                            >
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Specialty
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <SpecialtiesTable
                        specialties={specialties}
                        totalCount={totalCount}
                        page={page}
                        pageSize={pageSize}
                        searchQuery={searchQuery}
                        isLoading={isLoading}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        onSearchChange={setSearchQuery}
                        onRefresh={fetchSpecialties}
                    />
                </CardContent>
            </Card>

            <SpecialtyFormDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={fetchSpecialties}
            />
        </div>
    );
}
