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

const formSchema = z.object({
    name: z.string().min(1, 'Country name is required'),
    code: z.string().optional(),
    activeOnNationalities: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCountryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    country: any | null;
    onSuccess: () => void;
}

export function EditCountryDialog({
    open,
    onOpenChange,
    country,
    onSuccess,
}: EditCountryDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            code: '',
            activeOnNationalities: true,
        },
    });

    // Reset form when country changes
    useEffect(() => {
        if (country) {
            form.reset({
                name: country.name || '',
                code: country.code || '',
                activeOnNationalities: country.activeOnNationalities ?? true,
            });
        }
    }, [country, form]);

    const onSubmit = async (values: FormValues) => {
        if (!country) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/countries/${country.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update country');
            }

            toast.success('Country updated successfully');
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            console.error('Error updating country:', error);
            toast.error(error.message || 'Failed to update country');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Country</DialogTitle>
                    <DialogDescription>
                        Update country information and activation status.
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
                                        <Input placeholder="Egypt" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="EG" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        ISO 2-letter country code (e.g., US, EG, TR)
                                    </FormDescription>
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
                                            Active for Nationalities
                                        </FormLabel>
                                        <FormDescription>
                                            Show this country in nationality dropdowns
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
                                {isSubmitting ? 'Updating...' : 'Update Country'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
