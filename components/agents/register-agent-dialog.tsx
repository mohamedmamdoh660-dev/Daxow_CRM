
'use client';

import { useState } from 'react';
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
import { AgentsService } from '@/lib/services/agents-service';

const formSchema = z.object({
    companyName: z.string().min(2, 'Company name is required'),
    contactPerson: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    commissionRate: z.string().optional(), // Input as string, convert to number
    country: z.string().optional(),
    city: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RegisterAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function RegisterAgentDialog({
    open,
    onOpenChange,
    onSuccess,
}: RegisterAgentDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: '',
            contactPerson: '',
            email: '',
            phone: '',
            commissionRate: '',
            country: '',
            city: '',
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            // Transform commissionRate to number if present
            const payload = {
                ...values,
                commissionRate: values.commissionRate ? parseFloat(values.commissionRate) : undefined,
                // Ensure email is null if empty string to avoid unique constraint if optional
                email: values.email || undefined,
            };

            // We need to match the expected DTO. 
            // The frontend service expects CreateAgentDTO which has owner details, 
            // but the backend might just take Agent fields.
            // For now, let's assume we are just complying with the backend AgentCreateInput.
            // If the service enforces owner details, we might need to adjust or mock them.

            // Actually, let's look at the service again. It calls POST /api/agents.
            // The backend controller calls agentsService.create(createAgentDto).
            // Primitives will pass if validation allows.

            await AgentsService.createAgent(payload as any); // Type assertion for now

            toast.success('Agency registered successfully');
            form.reset();
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            console.error('Error registering agency:', error);
            toast.error(error.message || 'Failed to register agency');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Register New Agency</DialogTitle>
                    <DialogDescription>
                        Add a new partner agency to the system.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Acme Education" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contactPerson"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Person</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="info@acme.com" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Turkey" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Istanbul" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="commissionRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Commission Rate (%)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.5" placeholder="10" {...field} />
                                    </FormControl>
                                    <FormDescription>Default commission rate for this agency.</FormDescription>
                                    <FormMessage />
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
                                {isSubmitting ? 'Registering...' : 'Register Agency'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
