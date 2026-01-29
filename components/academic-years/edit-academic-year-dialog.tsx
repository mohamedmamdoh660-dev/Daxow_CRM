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
    name: z.string().min(1, 'Academic year name is required'),
    isActive: z.boolean(),
    isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditAcademicYearDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    academicYear: any;
    onSuccess: () => void;
}

export function EditAcademicYearDialog({
    open,
    onOpenChange,
    academicYear,
    onSuccess,
}: EditAcademicYearDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            isActive: true,
            isDefault: false,
        },
    });

    useEffect(() => {
        if (academicYear) {
            form.reset({
                name: academicYear.name,
                isActive: academicYear.isActive,
                isDefault: academicYear.isDefault,
            });
        }
    }, [academicYear, form]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(
                `http://localhost:3001/api/academic-years/${academicYear.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-performed-by': 'Admin User'
                    },
                    body: JSON.stringify(values),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update academic year');
            }

            toast.success('Academic year updated successfully');
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            console.error('Error updating academic year:', error);
            toast.error(error.message || 'Failed to update academic year');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Academic Year</DialogTitle>
                    <DialogDescription>
                        Update the academic year details.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Academic Year *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="2024-2025" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Format: YYYY-YYYY (e.g., 2024-2025)
                                    </FormDescription>
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
                                            Make this academic year available for selection
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

                        <FormField
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Default
                                        </FormLabel>
                                        <FormDescription>
                                            Set as the default academic year
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
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
