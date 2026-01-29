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
import { TitlesTable } from '@/components/titles/titles-table';
import { TitleFormDialog } from '@/components/titles/title-form-dialog';

export default function SpecialtyTitlesPage() {
    const [titles, setTitles] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const fetchTitles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/titles?page=${page}&pageSize=${pageSize}&search=${searchQuery}`
            );

            if (response.ok) {
                const data = await response.json();
                setTitles(data.data || []);
                setTotalCount(data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching titles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTitles();
    }, [page, pageSize, searchQuery]);

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Specialty Titles</CardTitle>
                            <CardDescription>
                                Manage unique specialty names to prevent duplication
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchTitles}
                                disabled={isLoading}
                            >
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Title
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <TitlesTable
                        titles={titles}
                        totalCount={totalCount}
                        page={page}
                        pageSize={pageSize}
                        searchQuery={searchQuery}
                        isLoading={isLoading}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        onSearchChange={setSearchQuery}
                        onRefresh={fetchTitles}
                    />
                </CardContent>
            </Card>

            <TitleFormDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={fetchTitles}
            />
        </div>
    );
}
