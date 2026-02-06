'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
} from "@/components/ui/select"

const formSchema = z.object({
    name: z.string().min(1, 'City name is required'),
    countryId: z.string().min(1, 'Country is required'),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    city?: any; // If present, we are in Edit mode
    defaultCountryId?: string; // Pre-select country for new cities
    onSuccess: () => void;
}

export function CityDialog({
    open,
    onOpenChange,
    city,
    defaultCountryId,
    onSuccess,
}: CityDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countries, setCountries] = useState<any[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            countryId: defaultCountryId || '',
            isActive: true,
        },
    });

    // Fetch countries for the dropdown
    useEffect(() => {
        async function fetchCountries() {
            try {
                // Fetch active countries with a high limit for the dropdown
                const response = await fetch('/api/countries?isActive=true&take=100');
                if (response.ok) {
                    const result = await response.json();
                    setCountries(result.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch countries', error);
                toast.error('Failed to load countries list');
            }
        }
        if (open) {
            fetchCountries();
        }
    }, [open]);

    useEffect(() => {
        if (city) {
            form.reset({
                name: city.name,
                countryId: city.countryId,
                isActive: city.isActive,
            });
        } else {
            form.reset({
                name: '',
                countryId: defaultCountryId || '',
                isActive: true,
            });
        }
    }, [city, form, open, defaultCountryId]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const url = city
                ? `/api/cities/${city.id}`
                : '/api/cities';

            const method = city ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-performed-by': 'Admin User'
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to ${city ? 'update' : 'create'} city`);
            }

            toast.success(`City ${city ? 'updated' : 'created'} successfully`);
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            console.error('Error saving city:', error);
            toast.error(error.message || `Failed to ${city ? 'update' : 'create'} city`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{city ? 'Edit City' : 'Add City'}</DialogTitle>
                    <DialogDescription>
                        {city ? 'Update the city details.' : 'Add a new city to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Istanbul" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="countryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a country" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {countries.map((country) => (
                                                <SelectItem key={country.id} value={country.id}>
                                                    {country.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Active
                                        </FormLabel>
                                        <FormDescription>
                                            Make this city available for selection
                                        </FormDescription>
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
