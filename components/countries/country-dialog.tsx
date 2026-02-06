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
    name: z.string().min(1, 'Country name is required'),
    code: z.string().min(2, 'ISO Code must be at least 2 characters').max(3, 'ISO Code max 3 chars'),
    phoneCode: z.string().optional(),
    region: z.string().min(1, 'Region is required'),
    isActive: z.boolean(),
    activeOnNationalities: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CountryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    country?: any;
    onSuccess: () => void;
}

const REGIONS = [
    'Africa',
    'Europe',
    'Asia',
    'Americas',
    'Oceania',
    'Middle East'
];

export function CountryDialog({
    open,
    onOpenChange,
    country,
    onSuccess,
}: CountryDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            code: '',
            phoneCode: '',
            region: '',
            isActive: true,
            activeOnNationalities: true,
        },
    });

    useEffect(() => {
        if (country) {
            form.reset({
                name: country.name,
                code: country.code,
                phoneCode: country.phoneCode || '',
                region: country.region,
                isActive: country.isActive,
                activeOnNationalities: country.activeOnNationalities,
            });
        } else {
            form.reset({
                name: '',
                code: '',
                phoneCode: '',
                region: '',
                isActive: true,
                activeOnNationalities: true,
            });
        }
    }, [country, form, open]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const url = country
                ? `/api/countries/${country.id}`
                : '/api/countries';

            const method = country ? 'PATCH' : 'POST';

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
                throw new Error(error.message || `Failed to ${country ? 'update' : 'create'} country`);
            }

            toast.success(`Country ${country ? 'updated' : 'created'} successfully`);
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            console.error('Error saving country:', error);
            toast.error(error.message || `Failed to ${country ? 'update' : 'create'} country`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{country ? 'Edit Country' : 'Add Country'}</DialogTitle>
                    <DialogDescription>
                        {country ? 'Update the country details.' : 'Add a new country to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="United Kingdom" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ISO Code *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="GB" {...field} maxLength={3} className="uppercase" />
                                        </FormControl>
                                        <FormDescription>2-3 letter code</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+44" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="region"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Region *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select region" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {REGIONS.map((region) => (
                                                <SelectItem key={region} value={region}>
                                                    {region}
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
                            name="activeOnNationalities"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Active on Nationalities
                                        </FormLabel>
                                        <FormDescription>
                                            Show this country in nationality selection lists
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
