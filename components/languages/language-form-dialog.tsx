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
    name: z.string().min(1, 'Language name is required'),
    code: z.string().optional(),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface LanguageFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    languageToEdit?: any;
}

export function LanguageFormDialog({
    open,
    onOpenChange,
    onSuccess,
    languageToEdit,
}: LanguageFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            code: '',
            isActive: true,
        },
    });

    useEffect(() => {
        if (languageToEdit) {
            form.reset({
                name: languageToEdit.name,
                code: languageToEdit.code || '',
                isActive: languageToEdit.isActive,
            });
        } else {
            form.reset({
                name: '',
                code: '',
                isActive: true,
            });
        }
    }, [languageToEdit, form, open]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const url = languageToEdit
                ? `/api/languages/${languageToEdit.id}`
                : '/api/languages';

            const method = languageToEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to ${languageToEdit ? 'update' : 'create'} language`);
            }

            toast.success(`Language ${languageToEdit ? 'updated' : 'created'} successfully`);
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            console.error('Error saving language:', error);
            toast.error(error.message || `Failed to ${languageToEdit ? 'update' : 'create'} language`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{languageToEdit ? 'Edit Language' : 'Add Language'}</DialogTitle>
                    <DialogDescription>
                        {languageToEdit ? 'Update language details.' : 'Add a new language (e.g., "English", "French").'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Language Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="English" {...field} />
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
                                    <FormLabel>Code (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="EN" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        ISO code like EN, FR, AR
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
                                            Make this language available for selection
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
                                {isSubmitting ? 'Saving...' : (languageToEdit ? 'Update Language' : 'Create Language')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
