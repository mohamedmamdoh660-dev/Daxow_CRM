import { prisma } from './prisma';

// Types
export type FieldType =
    | 'text'
    | 'email'
    | 'phone'
    | 'number'
    | 'date'
    | 'select'
    | 'multiselect'
    | 'boolean'
    | 'textarea'
    | 'url';

export interface FieldDefinition {
    id: string;
    module: string;
    apiName: string;
    label: string;
    fieldType: FieldType;
    isRequired: boolean;
    isIndexed: boolean;
    options?: string[];
    placeholder?: string;
    helpText?: string;
    validation?: Record<string, any>;
    displayOrder: number;
    isActive: boolean;
}

export interface ValidationRule {
    type: 'regex' | 'min' | 'max' | 'minLength' | 'maxLength' | 'email' | 'url' | 'phone';
    value?: any;
    message?: string;
}

/**
 * Get all field definitions for a specific module
 */
export async function getFieldDefinitions(module: string): Promise<FieldDefinition[]> {
    const fields = await prisma.fieldDefinition.findMany({
        where: {
            module,
            isActive: true,
        },
        orderBy: {
            displayOrder: 'asc',
        },
    });

    return fields.map((field: any) => ({
        ...field,
        fieldType: field.fieldType as FieldType,
        options: field.options ? (field.options as string[]) : undefined,
        placeholder: field.placeholder || undefined,
        helpText: field.helpText || undefined,
        validation: field.validation ? (field.validation as Record<string, any>) : undefined,
    }));
}

/**
 * Create a new field definition
 */
export async function createFieldDefinition(data: {
    module: string;
    apiName: string;
    label: string;
    fieldType: FieldType;
    isRequired?: boolean;
    isIndexed?: boolean;
    options?: string[];
    placeholder?: string;
    helpText?: string;
    validation?: Record<string, any>;
    displayOrder?: number;
}) {
    // Check for duplicate apiName in the same module
    const existing = await prisma.fieldDefinition.findUnique({
        where: {
            module_apiName: {
                module: data.module,
                apiName: data.apiName,
            },
        },
    });

    if (existing) {
        throw new Error(`Field with apiName "${data.apiName}" already exists in module "${data.module}"`);
    }

    return await prisma.fieldDefinition.create({
        data: {
            ...data,
            isRequired: data.isRequired ?? false,
            isIndexed: data.isIndexed ?? false,
            displayOrder: data.displayOrder ?? 0,
            options: data.options ? (data.options as any) : null,
            validation: data.validation ? (data.validation as any) : null,
        },
    });
}

/**
 * Update a field definition
 */
export async function updateFieldDefinition(
    id: string,
    data: Partial<{
        label: string;
        fieldType: FieldType;
        isRequired: boolean;
        options: string[];
        placeholder: string;
        helpText: string;
        validation: Record<string, any>;
        displayOrder: number;
        isActive: boolean;
    }>
) {
    return await prisma.fieldDefinition.update({
        where: { id },
        data: {
            ...data,
            options: data.options !== undefined ? (data.options as any) : undefined,
            validation: data.validation !== undefined ? (data.validation as any) : undefined,
        },
    });
}

/**
 * Delete a field definition
 */
export async function deleteFieldDefinition(id: string) {
    return await prisma.fieldDefinition.delete({
        where: { id },
    });
}

/**
 * Validate custom field data against field definitions
 */
export function validateFieldData(
    data: Record<string, any>,
    definitions: FieldDefinition[]
): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const field of definitions) {
        const value = data[field.apiName];

        // Check required fields
        if (field.isRequired && (value === undefined || value === null || value === '')) {
            errors[field.apiName] = `${field.label} is required`;
            continue;
        }

        // Skip validation if field is not required and value is empty
        if (!value && !field.isRequired) {
            continue;
        }

        // Type-specific validation
        switch (field.fieldType) {
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors[field.apiName] = `${field.label} must be a valid email`;
                }
                break;

            case 'url':
                try {
                    new URL(value);
                } catch {
                    errors[field.apiName] = `${field.label} must be a valid URL`;
                }
                break;

            case 'number':
                if (isNaN(Number(value))) {
                    errors[field.apiName] = `${field.label} must be a number`;
                }
                break;

            case 'phone':
                if (!/^[\d\s\-\+\(\)]+$/.test(value)) {
                    errors[field.apiName] = `${field.label} must be a valid phone number`;
                }
                break;

            case 'select':
                if (field.options && !field.options.includes(value)) {
                    errors[field.apiName] = `${field.label} must be one of: ${field.options.join(', ')}`;
                }
                break;

            case 'multiselect':
                if (Array.isArray(value) && field.options) {
                    const invalid = value.filter(v => !field.options!.includes(v));
                    if (invalid.length > 0) {
                        errors[field.apiName] = `${field.label} contains invalid options: ${invalid.join(', ')}`;
                    }
                }
                break;
        }

        // Custom validation rules
        if (field.validation) {
            const rules = field.validation as Record<string, any>;

            if (rules.regex && typeof value === 'string') {
                const regex = new RegExp(rules.regex);
                if (!regex.test(value)) {
                    errors[field.apiName] = rules.message || `${field.label} has invalid format`;
                }
            }

            if (rules.min !== undefined && Number(value) < rules.min) {
                errors[field.apiName] = `${field.label} must be at least ${rules.min}`;
            }

            if (rules.max !== undefined && Number(value) > rules.max) {
                errors[field.apiName] = `${field.label} must be at most ${rules.max}`;
            }

            if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) {
                errors[field.apiName] = `${field.label} must be at least ${rules.minLength} characters`;
            }

            if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
                errors[field.apiName] = `${field.label} must be at most ${rules.maxLength} characters`;
            }
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Merge fixed database columns with custom JSONB metadata
 */
export function mergeFixedAndCustomFields(
    entity: any,
    customFields: FieldDefinition[]
): Record<string, any> {
    const result: Record<string, any> = { ...entity };

    // Extract metadata and merge
    if (entity.metadata && typeof entity.metadata === 'object') {
        Object.assign(result, entity.metadata);
    }

    return result;
}

/**
 * Separate form data into fixed columns and metadata
 */
export function separateFixedAndMetadata(
    formData: Record<string, any>,
    fixedFields: string[]
): { fixed: Record<string, any>; metadata: Record<string, any> } {
    const fixed: Record<string, any> = {};
    const metadata: Record<string, any> = {};

    for (const [key, value] of Object.entries(formData)) {
        if (fixedFields.includes(key)) {
            fixed[key] = value;
        } else {
            metadata[key] = value;
        }
    }

    return { fixed, metadata };
}

/**
 * Get available modules that support custom fields
 */
export function getAvailableModules(): string[] {
    return [
        'Student',
        'Application',
        'University',
        'Program',
        'Campus',
        'Agent',
        'Document',
        'Task',
    ];
}

/**
 * Reorder field definitions
 */
export async function reorderFields(module: string, fieldIds: string[]) {
    const updates = fieldIds.map((id, index) =>
        prisma.fieldDefinition.update({
            where: { id },
            data: { displayOrder: index },
        })
    );

    return await prisma.$transaction(updates);
}
