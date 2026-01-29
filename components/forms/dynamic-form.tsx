'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useDynamicFields } from '@/hooks/use-dynamic-fields';
import { FieldRenderer } from './field-renderer';
import { validateFieldData, separateFixedAndMetadata } from '@/lib/field-manager';
import { Loader2 } from 'lucide-react';

interface DynamicFormProps {
    module: string;
    fixedFields?: React.ReactNode;
    fixedFieldNames?: string[];
    existingData?: Record<string, any>;
    onSubmit: (data: { fixed: Record<string, any>; metadata: Record<string, any> }) => Promise<void>;
    submitLabel?: string;
}

export function DynamicForm({
    module,
    fixedFields,
    fixedFieldNames = [],
    existingData = {},
    onSubmit,
    submitLabel = 'Save',
}: DynamicFormProps) {
    const { fields, loading, error: fetchError } = useDynamicFields(module);
    const [formData, setFormData] = useState<Record<string, any>>(existingData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleFieldChange = (apiName: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [apiName]: value,
        }));

        // Clear error for this field
        if (errors[apiName]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[apiName];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate custom fields
        const customData: Record<string, any> = {};
        for (const field of fields) {
            customData[field.apiName] = formData[field.apiName];
        }

        const validation = validateFieldData(customData, fields);

        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        setSubmitting(true);

        try {
            // Separate fixed columns from metadata
            const separated = separateFixedAndMetadata(formData, fixedFieldNames);

            await onSubmit(separated);

            // Reset form on success
            setFormData({});
            setErrors({});
        } catch (error: any) {
            console.error('Submit error:', error);
            setErrors({ _form: error.message || 'Failed to submit form' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (fetchError) {
        console.warn('Failed to load custom fields, showing form with fixed fields only:', fetchError);
        // Continue with empty fields array instead of blocking the form
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fixed Fields Section */}
            {fixedFields && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                        {fixedFields}
                    </div>
                    {fields.length > 0 && <Separator />}
                </>
            )}

            {/* Dynamic Custom Fields */}
            {fields.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map((field) => (
                            <div key={field.id} className={field.fieldType === 'textarea' ? 'md:col-span-2' : ''}>
                                <FieldRenderer
                                    field={field}
                                    value={formData[field.apiName]}
                                    onChange={(value) => handleFieldChange(field.apiName, value)}
                                    error={errors[field.apiName]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Form-level Error */}
            {errors._form && (
                <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
                    <p className="text-sm text-destructive">{errors._form}</p>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
