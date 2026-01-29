'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    MapPin,
    Calendar,
    Globe,
    Clock,
    Phone,
    Map
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Timeline } from '@/components/shared/timeline';
import { CountryDialog } from '@/components/countries/country-dialog';
import { CitiesTable } from '@/components/cities/cities-table';
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

export default function CountryViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [country, setCountry] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Country Actions State
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Cities Tab State
    const [cities, setCities] = useState<any[]>([]);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [showAddCityDialog, setShowAddCityDialog] = useState(false);

    const fetchCountry = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/countries/${id}`);
            if (response.ok) {
                const data = await response.json();
                setCountry(data);
            } else {
                toast.error('Failed to load country details');
            }
        } catch (error) {
            console.error('Error fetching country:', error);
            toast.error('Failed to load country details');
        } finally {
            setLoading(false);
        }
    };

    const fetchCities = useCallback(async () => {
        try {
            setCitiesLoading(true);
            // Fetch cities filtered by this country ID
            const response = await fetch(`http://localhost:3001/api/cities?countryId=${id}&take=100`);
            if (response.ok) {
                const data = await response.json();
                setCities(data.data);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setCitiesLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchCountry();
            fetchCities();
        }
    }, [id, fetchCities]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(
                `http://localhost:3001/api/countries/${id}`,
                {
                    method: 'DELETE',
                    headers: { 'x-performed-by': 'Admin User' }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete country');
            }

            toast.success('Country deleted successfully');
            router.push('/countries');
        } catch (error) {
            console.error('Error deleting country:', error);
            toast.error('Failed to delete country');
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

    if (!country) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <h3 className="text-lg font-medium">Country not found</h3>
                <Button variant="link" onClick={() => router.push('/countries')}>
                    Go back to Countries
                </Button>
            </div>
        );
    }

    // Default city object for adding new city to this country
    const defaultCityForAdd = {
        name: '',
        countryId: id, // Pre-select this country
        isActive: true
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/countries')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            {country.name}
                            <Badge variant={country.isActive ? 'default' : 'secondary'}>
                                {country.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{country.code}</Badge>
                            <span className="text-sm">• {country.region}</span>
                        </div>
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

            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="cities">Cities</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
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
                                            <Globe className="h-4 w-4" /> Country Name
                                        </span>
                                        <p className="text-base">{country.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Map className="h-4 w-4" /> Region
                                        </span>
                                        <p className="text-base">{country.region}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <MapPin className="h-4 w-4" /> ISO Code
                                        </span>
                                        <p className="text-base font-mono">{country.code}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Phone className="h-4 w-4" /> Phone Code
                                        </span>
                                        <p className="text-base">{country.phoneCode || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> Created At
                                        </span>
                                        <p className="text-base">
                                            {format(new Date(country.createdAt), 'PPP')}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-4 w-4" /> Last Updated
                                        </span>
                                        <p className="text-base">
                                            {format(new Date(country.updatedAt), 'PPP')}
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
                                <Timeline entityType="Country" entityId={country.id} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="cities" className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium">Cities in {country.name}</h3>
                            <p className="text-sm text-muted-foreground">Manage cities for this country</p>
                        </div>
                        <Button onClick={() => setShowAddCityDialog(true)}>
                            Add City
                        </Button>
                    </div>
                    {citiesLoading ? (
                        <div className="flex items-center justify-center h-24">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <CitiesTable data={cities} onRefresh={fetchCities} />
                    )}
                </TabsContent>
            </Tabs>

            {/* Edit Country Dialog */}
            <CountryDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                country={country}
                onSuccess={fetchCountry}
            />

            {/* Delete Country Alert */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{country.name}".
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

            {/* Add City Dialog (Pre-filled with Country) */}
            {/* Note: We need to modify CityDialog slightly to accept partial default values or we handle it via state */}
            {/* Actually CityDialog takes 'city' for edit. For new city with default country, we might need a prop or just pass a partial object treating it as 'edit' but without ID? */}
            {/* The cleanest way is to pass defaultValues prop to CityDialog, but let's see if we can trick it or if we need to update CityDialog */}
            {/* I will update CityDialog to accept 'defaultCountryId' prop */}
            <CityDialog
                open={showAddCityDialog}
                onOpenChange={setShowAddCityDialog}
                onSuccess={fetchCities}
                defaultCountryId={id}
            />
        </div>
    );
}
