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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
    name: z.string().min(1, 'Specialty name is required'),
    facultyId: z.string().min(1, 'Faculty is required'),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface SpecialtyFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    specialtyToEdit?: any;
}

export function SpecialtyFormDialog({
    open,
    onOpenChange,
    onSuccess,
    specialtyToEdit,
}: SpecialtyFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [faculties, setFaculties] = useState<any[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            facultyId: '',
            isActive: true,
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/faculties?pageSize=100&isActive=true');
                if (response.ok) {
                    const data = await response.json();
                    setFaculties(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load dependency data');
            }
        };

        if (open) {
            fetchData();
        }
    }, [open]);

    useEffect(() => {
        if (specialtyToEdit) {
            form.reset({
                name: specialtyToEdit.name,
                facultyId: specialtyToEdit.facultyId,
                isActive: specialtyToEdit.isActive,
            });
        } else {
            form.reset({
                name: '',
                facultyId: '',
                isActive: true,
            });
        }
    }, [specialtyToEdit, form, open]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const url = specialtyToEdit
                ? `/api/specialties/${specialtyToEdit.id}`
                : '/api/specialties';

            const method = specialtyToEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to ${specialtyToEdit ? 'update' : 'create'} specialty`);
            }

            toast.success(`Specialty ${specialtyToEdit ? 'updated' : 'created'} successfully`);
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            console.error('Error saving specialty:', error);
            toast.error(error.message || `Failed to ${specialtyToEdit ? 'update' : 'create'} specialty`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{specialtyToEdit ? 'Edit Specialty' : 'Add Specialty'}</DialogTitle>
                    <DialogDescription>
                        {specialtyToEdit ? 'Update specialty details.' : 'Add a new specialty under a faculty.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Specialty Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Computer Science" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the name of the specialty. It must be unique.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="facultyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Faculty *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a faculty" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[300px]">
                                            {faculties.map((faculty) => (
                                                <SelectItem key={faculty.id} value={faculty.id}>
                                                    {faculty.name}
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
                                            Make this specialty available for selection
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
                                {isSubmitting ? 'Saving...' : (specialtyToEdit ? 'Update Specialty' : 'Create Specialty')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
