'use client';

import { useState, useEffect } from 'react';

export interface Permissions {
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    canImport: boolean;
    isAdmin: boolean;
}

export function usePermissions(moduleName: string): Permissions {
    const [permissions, setPermissions] = useState<Permissions>({
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
        canImport: false,
        isAdmin: false,
    });

    useEffect(() => {
        try {
            const storedMeta = localStorage.getItem('userMeta');
            const userRole = localStorage.getItem('userRole') || '';
            const isAdmin = userRole === 'admin' || (storedMeta && JSON.parse(storedMeta)?.role === 'admin');

            if (isAdmin) {
                setPermissions({
                    canView: true,
                    canAdd: true,
                    canEdit: true,
                    canDelete: true,
                    canExport: true,
                    canImport: true,
                    isAdmin: true,
                });
                return;
            }

            if (storedMeta) {
                const meta = JSON.parse(storedMeta);
                const userPerms: { module: string, action: string }[] = meta?.permissions || [];

                // Helper to check if permission exists for the module and action + legacy 'read'/'create' etc defaults
                const hasAction = (action: string, legacyAction?: string) => {
                    return userPerms.some(p =>
                        p.module === moduleName &&
                        (p.action === action || (legacyAction && p.action === legacyAction))
                    );
                };

                setPermissions({
                    canView: hasAction('view', 'read') || hasAction('view_all'),
                    canAdd: hasAction('add', 'create'),
                    canEdit: hasAction('edit', 'update'),
                    canDelete: hasAction('delete'),
                    canExport: hasAction('export'),
                    canImport: hasAction('import'),
                    isAdmin: false,
                });
            }
        } catch (error) {
            console.error('Error parsing permissions from local storage:', error);
            // Default to restricted
            setPermissions({
                canView: false,
                canAdd: false,
                canEdit: false,
                canDelete: false,
                canExport: false,
                canImport: false,
                isAdmin: false,
            });
        }
    }, [moduleName]);

    return permissions;
}
