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
    name: z.string().min(1, 'Faculty name is required'),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface FacultyFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    facultyToEdit?: any; // If provided, we are in edit mode
}

export function FacultyFormDialog({
    open,
    onOpenChange,
    onSuccess,
    facultyToEdit,
}: FacultyFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            isActive: true,
        },
    });

    useEffect(() => {
        if (facultyToEdit) {
            form.reset({
                name: facultyToEdit.name,
                isActive: facultyToEdit.isActive,
            });
        } else {
            form.reset({
                name: '',
                isActive: true,
            });
        }
    }, [facultyToEdit, form, open]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const url = facultyToEdit
                ? `http://localhost:3001/api/faculties/${facultyToEdit.id}`
                : 'http://localhost:3001/api/faculties';

            const method = facultyToEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to ${facultyToEdit ? 'update' : 'create'} faculty`);
            }

            toast.success(`Faculty ${facultyToEdit ? 'updated' : 'created'} successfully`);
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            console.error('Error saving faculty:', error);
            toast.error(error.message || `Failed to ${facultyToEdit ? 'update' : 'create'} faculty`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{facultyToEdit ? 'Edit Faculty' : 'Add Faculty'}</DialogTitle>
                    <DialogDescription>
                        {facultyToEdit ? 'Update faculty details.' : 'Add a new faculty (e.g., "Engineering", "Medicine").'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Faculty Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Engineering" {...field} />
                                    </FormControl>
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
                                            Make this faculty available for selection
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
                                {isSubmitting ? 'Saving...' : (facultyToEdit ? 'Update Faculty' : 'Create Faculty')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
