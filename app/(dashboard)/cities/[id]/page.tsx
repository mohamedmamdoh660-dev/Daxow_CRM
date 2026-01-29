'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    MapPin,
    Calendar,
    Globe,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Timeline } from '@/components/shared/timeline';
import { CityDialog } from '@/components/cities/city-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CityViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [city, setCity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCity = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/cities/${id}`);
            if (response.ok) {
                const data = await response.json();
                setCity(data);
            } else {
                toast.error('Failed to load city details');
            }
        } catch (error) {
            console.error('Error fetching city:', error);
            toast.error('Failed to load city details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCity();
        }
    }, [id]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(
                `http://localhost:3001/api/cities/${id}`,
                {
                    method: 'DELETE',
                    headers: { 'x-performed-by': 'Admin User' }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete city');
            }

            toast.success('City deleted successfully');
            router.push('/cities');
        } catch (error) {
            console.error('Error deleting city:', error);
            toast.error('Failed to delete city');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[200px]" />
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        );
    }

    if (!city) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <h3 className="text-lg font-medium">City not found</h3>
                <Button variant="link" onClick={() => router.push('/cities')}>
                    Go back to Cities
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/cities')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            {city.name}
                            <Badge variant={city.isActive ? 'default' : 'secondary'}>
                                {city.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </h2>
                        <p className="text-muted-foreground">
                            City Details & History
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> City Name
                                </span>
                                <p className="text-base">{city.name}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Globe className="h-4 w-4" /> Country
                                </span>
                                <p className="text-base">{city.country?.name || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Created At
                                </span>
                                <p className="text-base">
                                    {format(new Date(city.createdAt), 'PPP')}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Last Updated
                                </span>
                                <p className="text-base">
                                    {format(new Date(city.updatedAt), 'PPP')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Timeline entityType="City" entityId={city.id} />
                    </CardContent>
                </Card>
            </div>

            <CityDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                city={city}
                onSuccess={fetchCity}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the city "{city.name}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
