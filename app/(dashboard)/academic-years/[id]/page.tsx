'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, FileText, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EditAcademicYearDialog } from '@/components/academic-years/edit-academic-year-dialog';
import { Timeline } from '@/components/shared/timeline';
import { History } from 'lucide-react';

export default function AcademicYearDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [academicYear, setAcademicYear] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditDialog, setShowEditDialog] = useState(false);

    const fetchAcademicYear = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/academic-years/${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setAcademicYear(data);
            }
        } catch (error) {
            console.error('Error fetching academic year:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchAcademicYear();
        }
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="container py-8 space-y-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (!academicYear) {
        return (
            <div className="container py-8 text-center">
                <h2 className="text-2xl font-bold">Academic Year not found</h2>
                <Button variant="link" onClick={() => router.push('/academic-years')}>
                    Go back
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/academic-years')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{academicYear.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={academicYear.isActive ? 'default' : 'secondary'}>
                                {academicYear.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {academicYear.isDefault && (
                                <Badge variant="outline" className="border-primary text-primary">
                                    Default
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <Button onClick={() => setShowEditDialog(true)}>
                    Edit Academic Year
                </Button>
            </div>

            <Tabs defaultValue="programs" className="w-full">
                <TabsList>
                    <TabsTrigger value="programs" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Programs
                    </TabsTrigger>
                    <TabsTrigger value="applications" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Applications
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="programs" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Related Programs</CardTitle>
                            <CardDescription>
                                Programs associated with this academic year.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                No programs linked yet. (Coming soon...)
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="applications" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Applications</CardTitle>
                            <CardDescription>
                                Student applications for this academic year.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                No applications linked yet. (Coming soon...)
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                            <CardDescription>
                                Audit log of all changes made to this academic year.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Timeline entityType="AcademicYear" entityId={params.id as string} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <EditAcademicYearDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                academicYear={academicYear}
                onSuccess={fetchAcademicYear}
            />
        </div>
    );
}
