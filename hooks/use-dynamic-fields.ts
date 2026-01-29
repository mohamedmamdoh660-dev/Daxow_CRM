'use client';

import { useState, useEffect } from 'react';
import type { FieldDefinition } from '@/lib/field-manager';

export function useDynamicFields(module: string) {
    const [fields, setFields] = useState<FieldDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFields() {
            try {
                setLoading(true);
                const response = await fetch(`/api/fields?module=${module}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch field definitions');
                }

                const data = await response.json();
                setFields(data.fields || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (module) {
            fetchFields();
        }
    }, [module]);

    return { fields, loading, error, refetch: () => setLoading(true) };
}
