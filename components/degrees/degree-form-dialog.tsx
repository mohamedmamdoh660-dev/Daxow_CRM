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
    name: z.string().min(1, 'Degree name is required'),
    code: z.string().optional(),
    displayOrder: z.coerce.number().optional(),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface DegreeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    degreeToEdit?: any;
}

export function DegreeFormDialog({
    open,
    onOpenChange,
    onSuccess,
    degreeToEdit,
}: DegreeFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            code: '',
            displayOrder: 0,
            isActive: true,
        },
    });

    useEffect(() => {
        if (degreeToEdit) {
            form.reset({
                name: degreeToEdit.name,
                code: degreeToEdit.code || '',
                displayOrder: degreeToEdit.displayOrder || 0,
                isActive: degreeToEdit.isActive,
            });
        } else {
            form.reset({
                name: '',
                code: '',
                displayOrder: 0,
                isActive: true,
            });
        }
    }, [degreeToEdit, form, open]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const url = degreeToEdit
                ? `/api/degrees/${degreeToEdit.id}`
                : '/api/degrees';

            const method = degreeToEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to ${degreeToEdit ? 'update' : 'create'} degree`);
            }

            toast.success(`Degree ${degreeToEdit ? 'updated' : 'created'} successfully`);
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            console.error('Error saving degree:', error);
            toast.error(error.message || `Failed to ${degreeToEdit ? 'update' : 'create'} degree`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{degreeToEdit ? 'Edit Degree' : 'Add Degree'}</DialogTitle>
                    <DialogDescription>
                        {degreeToEdit ? 'Update degree details.' : 'Add a new degree (e.g., "Bachelor", "Master").'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Degree Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Bachelor's Degree" {...field} />
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
                                        <FormLabel>Code (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="BSC" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="displayOrder"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Order</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                            Make this degree available for selection
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
                                {isSubmitting ? 'Saving...' : (degreeToEdit ? 'Update Degree' : 'Create Degree')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
