'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, GraduationCap, History } from 'lucide-react';
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
import { EditSemesterDialog } from '@/components/semesters/edit-semester-dialog';
import { Timeline } from '@/components/shared/timeline';

export default function SemesterDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [semester, setSemester] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditDialog, setShowEditDialog] = useState(false);

    const fetchSemester = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/semesters/${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setSemester(data);
            }
        } catch (error) {
            console.error('Error fetching semester:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchSemester();
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

    if (!semester) {
        return (
            <div className="container py-8 text-center">
                <h2 className="text-2xl font-bold">Semester not found</h2>
                <Button variant="link" onClick={() => router.push('/semesters')}>
                    Go back
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/semesters')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{semester.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={semester.isActive ? 'default' : 'secondary'}>
                                {semester.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {semester.isDefault && (
                                <Badge variant="outline" className="border-primary text-primary">
                                    Default
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <Button onClick={() => setShowEditDialog(true)}>
                    Edit Semester
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
                                Programs available in this semester.
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
                                Student applications for this semester.
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
                                Audit log of all changes made to this semester.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Timeline entityType="Semester" entityId={params.id as string} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <EditSemesterDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                semester={semester}
                onSuccess={fetchSemester}
            />
        </div>
    );
}
