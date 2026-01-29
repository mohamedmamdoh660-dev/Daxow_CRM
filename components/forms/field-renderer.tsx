'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { FieldDefinition } from '@/lib/field-manager';

interface FieldRendererProps {
    field: FieldDefinition;
    value: any;
    onChange: (value: any) => void;
    error?: string;
}

export function FieldRenderer({ field, value, onChange, error }: FieldRendererProps) {
    const renderField = () => {
        switch (field.fieldType) {
            case 'text':
            case 'email':
            case 'phone':
            case 'url':
                return (
                    <Input
                        type={field.fieldType === 'email' ? 'email' : field.fieldType === 'url' ? 'url' : 'text'}
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className={error ? 'border-destructive' : ''}
                    />
                );

            case 'number':
                return (
                    <Input
                        type="number"
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
                        className={error ? 'border-destructive' : ''}
                    />
                );

            case 'textarea':
                return (
                    <Textarea
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className={error ? 'border-destructive' : ''}
                        rows={4}
                    />
                );

            case 'boolean':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={value || false}
                            onCheckedChange={onChange}
                        />
                        <Label className="text-sm font-normal cursor-pointer">
                            {field.placeholder || 'Enable'}
                        </Label>
                    </div>
                );

            case 'date':
                return (
                    <div className="relative">
                        <Button
                            variant="outline"
                            className={cn(
                                'w-full justify-start text-left font-normal',
                                !value && 'text-muted-foreground',
                                error && 'border-destructive'
                            )}
                            onClick={() => {
                                // This would open a date picker dialog
                                const date = prompt('Enter date (YYYY-MM-DD):');
                                if (date) onChange(date);
                            }}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
                        </Button>
                    </div>
                );

            case 'select':
                return (
                    <Select value={value || ''} onValueChange={onChange}>
                        <SelectTrigger className={error ? 'border-destructive' : ''}>
                            <SelectValue placeholder={field.placeholder || 'Select an option'} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'multiselect':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    checked={(value || []).includes(option)}
                                    onCheckedChange={(checked) => {
                                        const currentValues = value || [];
                                        if (checked) {
                                            onChange([...currentValues, option]);
                                        } else {
                                            onChange(currentValues.filter((v: string) => v !== option));
                                        }
                                    }}
                                />
                                <Label className="text-sm font-normal cursor-pointer">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </div>
                );

            default:
                return (
                    <Input
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );
        }
    };

    return (
        <div className="space-y-2">
            <Label>
                {field.label}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            {renderField()}
            {field.helpText && (
                <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}
