'use server';

import {
    createFieldDefinition,
    updateFieldDefinition,
    deleteFieldDefinition,
    getFieldDefinitions,
    reorderFields,
    type FieldType,
} from '@/lib/field-manager';

export async function createField(data: {
    module: string;
    apiName: string;
    label: string;
    fieldType: FieldType;
    isRequired?: boolean;
    options?: string[];
    placeholder?: string;
    helpText?: string;
    validation?: Record<string, any>;
}) {
    try {
        const field = await createFieldDefinition(data);
        return { success: true, data: field };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateField(
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
    try {
        const field = await updateFieldDefinition(id, data);
        return { success: true, data: field };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteField(id: string) {
    try {
        await deleteFieldDefinition(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getModuleFields(module: string) {
    try {
        const fields = await getFieldDefinitions(module);
        return { success: true, data: fields };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function reorderModuleFields(module: string, fieldIds: string[]) {
    try {
        await reorderFields(module, fieldIds);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
