'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { StudentsTable } from '@/components/students/students-table';

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/students?page=${page}&pageSize=${pageSize}&search=${searchQuery}`
            );

            if (response.ok) {
                const data = await response.json();
                setStudents(data.students || []);
                setTotalCount(data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [page, pageSize, searchQuery]);

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <GraduationCap className="h-8 w-8" />
                        Students
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage enrolled and active students
                    </p>
                </div>
                <Link href="/students/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Students</CardTitle>
                    <CardDescription>
                        {totalCount} student{totalCount !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StudentsTable
                        students={students}
                        totalCount={totalCount}
                        page={page}
                        pageSize={pageSize}
                        searchQuery={searchQuery}
                        isLoading={loading}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        onSearchChange={setSearchQuery}
                        onRefresh={fetchStudents}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
