'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, ShieldAlert, ShieldCheck, Plus, Edit, Trash2, Users, CheckSquare, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/lib/hooks/use-permissions';

// ── Types ──────────────────────────────────────────────────────────────────
interface Permission { module: string; action: string; }
interface Role {
    id: string; name: string; description: string | null; isSystem: boolean;
    permissions: Permission[];
    _count?: { userGroups: number };
}

// ── Constants ──────────────────────────────────────────────────────────────
const MODULES = [
    'Dashboard', 'Students', 'Applications', 'Leads', 'Programs',
    'Academic Years', 'Faculties', 'Countries & Cities', 'Languages & Titles',
    'Agents', 'User Management', 'Roles & Permissions', 'Settings', 'Profile',
];

const ACTIONS: { key: string; label: string; color: string }[] = [
    { key: 'menu_access', label: 'Menu', color: 'text-gray-600' },
    { key: 'view', label: 'View Own', color: 'text-blue-600' },
    { key: 'view_all', label: 'View All', color: 'text-cyan-600' },
    { key: 'add', label: 'Add', color: 'text-green-600' },
    { key: 'edit', label: 'Edit', color: 'text-amber-600' },
    { key: 'delete', label: 'Delete', color: 'text-red-600' },
    { key: 'export', label: 'Export', color: 'text-purple-600' },
    { key: 'import', label: 'Import', color: 'text-indigo-600' },
];

// Only these modules support View Own / View All (owner-based RBAC)
const VIEW_OWN_MODULES = ['Students', 'Leads', 'Applications'];

// ── Permission matrix helpers ──────────────────────────────────────────────
function hasPermission(permissions: Permission[], module: string, action: string) {
    return permissions.some(p => p.module === module && p.action === action);
}
function togglePerm(permissions: Permission[], module: string, action: string): Permission[] {
    if (hasPermission(permissions, module, action)) {
        const remainingPerms = permissions.filter(p => !(p.module === module && p.action === action));
        // If unchecking menu_access, clear ALL permissions for this module
        if (action === 'menu_access') {
            return remainingPerms.filter(p => p.module !== module);
        }
        // If unchecking the last view permission, cascade remove all other permissions for this module
        const hasAnyView = remainingPerms.some(p => p.module === module && (p.action === 'view' || p.action === 'view_all'));
        if (!hasAnyView && (action === 'view' || action === 'view_all')) {
            return remainingPerms.filter(p => p.module !== module);
        }
        return remainingPerms;
    }
    // Auto-add menu_access when adding any permission
    if (action !== 'menu_access' && !hasPermission(permissions, module, 'menu_access')) {
        permissions = [...permissions, { module, action: 'menu_access' }];
    }
    // Automatically add 'view' if a non-view action is checked and no view is present
    if (action !== 'view' && action !== 'view_all' && action !== 'menu_access' && !hasPermission(permissions, module, 'view') && !hasPermission(permissions, module, 'view_all')) {
        return [...permissions, { module, action: 'view' }, { module, action }];
    }
    return [...permissions, { module, action }];
}
function toggleModuleAll(permissions: Permission[], module: string): Permission[] {
    const allChecked = ACTIONS.every(a => hasPermission(permissions, module, a.key));
    const rest = permissions.filter(p => p.module !== module);
    if (allChecked) return rest;
    return [...rest, ...ACTIONS.map(a => ({ module, action: a.key }))];
}
function toggleActionAll(permissions: Permission[], action: string): Permission[] {
    const allChecked = MODULES.every(m => hasPermission(permissions, m, action));
    const rest = permissions.filter(p => p.action !== action);
    if (allChecked) return rest;
    return [...rest, ...MODULES.map(m => ({ module: m, action }))];
}
function selectAll(permissions: Permission[]): Permission[] {
    return MODULES.flatMap(m => ACTIONS.map(a => ({ module: m, action: a.key })));
}

// ════════════════════════════════════════════════════════════════════════════
export default function RolesPage() {
    const { toast } = useToast();
    const { canAdd, canEdit, canDelete } = usePermissions('Roles & Permissions');
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deleteRole, setDeleteRole] = useState<Role | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formPerms, setFormPerms] = useState<Permission[]>([]);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/roles');
            if (res.ok) setRoles(await res.json());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const openCreate = () => {
        setEditingRole(null);
        setFormName(''); setFormDesc(''); setFormPerms([]);
        setShowDialog(true);
    };
    const openEdit = (role: Role) => {
        setEditingRole(role);
        setFormName(role.name); setFormDesc(role.description || '');
        setFormPerms(role.permissions.map(p => ({ module: p.module, action: p.action })));
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            toast({ title: 'Error', description: 'Group name is required', variant: 'destructive' });
            return;
        }
        setSubmitting(true);
        try {
            const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
            const method = editingRole ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formName, description: formDesc, permissions: formPerms }),
            });
            if (res.ok) {
                toast({ title: 'Success', description: `Group ${editingRole ? 'updated' : 'created'}` });
                setShowDialog(false);
                fetchRoles();
            } else {
                const err = await res.json();
                toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteRole) return;
        const res = await fetch(`/api/roles/${deleteRole.id}`, { method: 'DELETE' });
        if (res.ok) {
            toast({ title: 'Success', description: 'Group deleted' });
            setDeleteRole(null); fetchRoles();
        } else {
            const err = await res.json();
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
            setDeleteRole(null);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" /> Groups & Permissions
                    </h1>
                    <p className="text-muted-foreground mt-1">Create groups with granular module-level permissions. Users can belong to multiple groups.</p>
                </div>
                {canAdd && (
                    <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Group</Button>
                )}
            </div>

            {/* Group Cards */}
            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map(role => (
                        <Card key={role.id} className="border border-border/50 shadow-sm relative overflow-hidden">
                            {role.isSystem && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">SYSTEM</div>
                            )}
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${role.isSystem ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : 'bg-green-100 text-green-600 dark:bg-green-900/40'}`}>
                                        {role.isSystem ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <CardTitle className="capitalize text-base">{role.name}</CardTitle>
                                        <div className="flex gap-1.5 mt-1">
                                            <Badge variant="secondary" className="text-xs">{role.permissions.length} permissions</Badge>
                                            <Badge variant="outline" className="text-xs">
                                                <Users className="h-3 w-3 mr-1" />{role._count?.userGroups ?? 0} members
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground min-h-[36px] line-clamp-2">{role.description || 'No description'}</p>
                                <div className="flex gap-2 justify-end mt-3">
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                    </Button>
                                    {!role.isSystem && (
                                        <Button variant="ghost" size="sm" onClick={() => setDeleteRole(role)} className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
                    <div className="p-6 pb-3 border-b shrink-0">
                        <DialogHeader>
                            <DialogTitle className="text-xl">{editingRole ? 'Edit Group' : 'Create New Group'}</DialogTitle>
                            <DialogDescription>
                                Configure the group name and select permissions for each module.
                                {editingRole?.isSystem && <span className="text-amber-500 font-medium block mt-1">⚠ System group: you can edit permissions but not rename or delete.</span>}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-1.5">
                                <Label>Group Name <span className="text-destructive">*</span></Label>
                                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Data Entry Manager" disabled={editingRole?.isSystem} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Description</Label>
                                <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Brief description" />
                            </div>
                        </div>
                    </div>

                    {/* Permission Matrix */}
                    <div className="flex-1 overflow-auto p-6 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-base">Permission Matrix</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setFormPerms(selectAll(formPerms))}>Select All</Button>
                                <Button variant="outline" size="sm" onClick={() => setFormPerms([])}>Clear All</Button>
                            </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="py-2.5 px-4 text-left font-semibold w-48">Module</th>
                                        {ACTIONS.map(a => (
                                            <th key={a.key} className="py-2.5 px-3 text-center font-semibold">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`text-xs ${a.color}`}>{a.label}</span>
                                                    <Button
                                                        variant="ghost" size="icon" className="h-5 w-5"
                                                        onClick={() => setFormPerms(prev => toggleActionAll(prev, a.key))}
                                                        title={`Toggle all ${a.label}`}
                                                    >
                                                        {MODULES.every(m => hasPermission(formPerms, m, a.key))
                                                            ? <CheckSquare className="h-3.5 w-3.5 text-primary" />
                                                            : <Square className="h-3.5 w-3.5 text-muted-foreground" />}
                                                    </Button>
                                                </div>
                                            </th>
                                        ))}
                                        <th className="py-2.5 px-3 text-center font-semibold text-xs text-muted-foreground">All</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {MODULES.map((module, idx) => {
                                        const allRow = ACTIONS.every(a => hasPermission(formPerms, module, a.key));
                                        return (
                                            <tr key={module} className={`${idx % 2 === 0 ? '' : 'bg-muted/20'} hover:bg-muted/40 transition-colors`}>
                                                <td className="py-2.5 px-4 font-medium text-sm">{module}</td>
                                                {ACTIONS.map(a => {
                                                    const isMenuAction = a.key === 'menu_access';
                                                    const isViewOwnAction = a.key === 'view' || a.key === 'view_all';
                                                    const supportsViewOwn = VIEW_OWN_MODULES.includes(module);
                                                    // For modules that don't support View Own, disable view/view_all checkboxes
                                                    if (isViewOwnAction && !supportsViewOwn) {
                                                        return (
                                                            <td key={a.key} className="py-2.5 px-3 text-center">
                                                                <span className="text-muted-foreground text-xs">—</span>
                                                            </td>
                                                        );
                                                    }
                                                    const hasMenuAccess = hasPermission(formPerms, module, 'menu_access');
                                                    const hasAnyView = hasPermission(formPerms, module, 'view') || hasPermission(formPerms, module, 'view_all');
                                                    // Disable non-menu actions if no menu_access
                                                    const isCheckboxDisabled =
                                                        (!isMenuAction && !hasMenuAccess) ||
                                                        (!isViewOwnAction && !isMenuAction && !hasAnyView && supportsViewOwn);

                                                    return (
                                                        <td key={a.key} className={`py-2.5 px-3 text-center ${isMenuAction ? 'border-r border-border/50' : ''}`}>
                                                            <Checkbox
                                                                checked={hasPermission(formPerms, module, a.key)}
                                                                onCheckedChange={() => setFormPerms(prev => togglePerm(prev, module, a.key))}
                                                                disabled={isCheckboxDisabled}
                                                                className={isMenuAction ? 'border-gray-400' : ''}
                                                            />
                                                        </td>
                                                    );
                                                })}
                                                <td className="py-2.5 px-3 text-center">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFormPerms(prev => toggleModuleAll(prev, module))}>
                                                        {allRow ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{formPerms.length} permissions selected</p>
                    </div>

                    <div className="p-6 pt-3 border-t shrink-0">
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : 'Save Group'}</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteRole} onOpenChange={v => !v && setDeleteRole(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Group?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Delete <strong>{deleteRole?.name}</strong>? If users are still assigned to this group the deletion will be blocked. Remove members first, then delete.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
