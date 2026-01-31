'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    name: z.string().min(1, 'Program name is required'),
    facultyId: z.string().min(1, 'Faculty is required'),
    specialtyId: z.string().min(1, 'Specialty is required'),
    degreeId: z.string().min(1, 'Degree is required'),
    languageId: z.string().min(1, 'Language is required'),
    countryId: z.string().optional(),
    cityId: z.string().optional(),
    studyYears: z.string().optional(),
    officialTuition: z.string().optional(),
    discountedTuition: z.string().optional(),
    tuitionCurrency: z.string().optional(),
    isActive: z.boolean().optional(),
    activeApplications: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProgramFormProps {
    initialData?: any;
}

export function ProgramForm({ initialData }: ProgramFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Dropdown Data
    const [faculties, setFaculties] = useState<any[]>([]);
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [degrees, setDegrees] = useState<any[]>([]);
    const [languages, setLanguages] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || '',
            facultyId: initialData?.facultyId || '',
            specialtyId: initialData?.specialtyId || '',
            degreeId: initialData?.degreeId || '',
            languageId: initialData?.languageId || '',
            countryId: initialData?.countryId || undefined,
            cityId: initialData?.cityId || undefined,
            studyYears: initialData?.studyYears || '',
            officialTuition: initialData?.officialTuition || '',
            discountedTuition: initialData?.discountedTuition || '',
            tuitionCurrency: initialData?.tuitionCurrency || 'USD',
            isActive: initialData?.isActive ?? false,
            activeApplications: initialData?.activeApplications ?? false,
        } as any,
    });

    // Watchers for cascading
    const watchedFacultyId = form.watch('facultyId');
    const watchedCountryId = form.watch('countryId');

    // Fetch Initial Static Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [facultiesRes, degreesRes, languagesRes, countriesRes] = await Promise.all([
                    fetch('/api/faculties?isActive=true'),
                    fetch('/api/degrees'),
                    fetch('/api/languages?isActive=true'),
                    fetch('/api/countries?isActive=true')
                ]);

                if (facultiesRes.ok) {
                    const data = await facultiesRes.json();
                    setFaculties(Array.isArray(data) ? data : data.data || []);
                }
                if (degreesRes.ok) {
                    const data = await degreesRes.json();
                    setDegrees(Array.isArray(data) ? data : data.data || []);
                }
                if (languagesRes.ok) {
                    const data = await languagesRes.json();
                    setLanguages(Array.isArray(data) ? data : data.data || []);
                }
                if (countriesRes.ok) {
                    const data = await countriesRes.json();
                    setCountries(Array.isArray(data) ? data : data.data || data.countries || []);
                }

            } catch (error) {
                console.error('Error fetching form data:', error);
                toast.error('Failed to load form data');
            }
        };
        fetchData();
    }, []);

    // Fetch Specialties when Faculty changes
    useEffect(() => {
        if (!watchedFacultyId) {
            setSpecialties([]);
            return;
        }

        const fetchSpecialties = async () => {
            try {
                const res = await fetch(`/api/specialties?facultyId=${watchedFacultyId}&isActive=true`);
                if (res.ok) {
                    const data = await res.json();
                    setSpecialties(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching specialties:', error);
            }
        };
        fetchSpecialties();
    }, [watchedFacultyId]);

    // Fetch Cities when Country changes
    useEffect(() => {
        if (!watchedCountryId) {
            setCities([]);
            return;
        }

        const fetchCities = async () => {
            try {
                const res = await fetch(`/api/cities?countryId=${watchedCountryId}&isActive=true`);
                if (res.ok) {
                    const data = await res.json();
                    setCities(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };
        fetchCities();
    }, [watchedCountryId]);


    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            const url = initialData
                ? `/api/programs/${initialData.id}`
                : '/api/programs';

            const method = initialData ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Something went wrong');
            }

            toast.success(initialData ? 'Program updated' : 'Program created');
            router.push('/programs');
            router.refresh(); // Refresh server components
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Program Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. BSc Computer Science" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="facultyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Faculty *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Faculty" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {faculties.map((f) => (
                                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="specialtyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specialty</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!watchedFacultyId}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Specialty" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {specialties.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.title?.name || 'Unknown'}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="degreeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Degree Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Degree" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {degrees.map((d) => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="languageId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Language</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {languages.map((l) => (
                                                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="studyYears"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Study Duration (e.g. 4 Years)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="4 Years" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Location & Financials */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium border-b pb-2">Location & Financials</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="countryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Country" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {countries.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cityId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!watchedCountryId}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select City" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {cities.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="officialTuition"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Official Tuition</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 5000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="discountedTuition"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discounted Tuition</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 4500" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Active</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="activeApplications"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base text-xs">Accepting Applicants</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>



                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (initialData ? 'Update Program' : 'Create Program')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
