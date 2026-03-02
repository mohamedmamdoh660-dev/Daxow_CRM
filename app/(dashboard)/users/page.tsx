'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Users, UserPlus, Search, Shield, UserCheck, UserX,
    Edit, Trash2, ToggleLeft, ToggleRight, RefreshCw, KeyRound, AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/lib/hooks/use-permissions';

// ── Types ────────────────────────────────────────────────────────────────────
interface Group { id: string; name: string; description: string | null; isSystem: boolean; }
interface User {
    id: string; email: string; name: string | null;
    firstName: string | null; lastName: string | null; phone: string | null;
    avatar: string | null; profileImage: string | null;
    isActive: boolean; lastLogin: string | null; createdAt: string;
    roleName?: string; groupIds?: string[]; groupNames?: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const groupColor: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    staff: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    agent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
};
const getGroupColor = (name: string) =>
    groupColor[name.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';

function initials(name: string | null, email: string) {
    if (name) return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    return email[0].toUpperCase();
}

// ════════════════════════════════════════════════════════════════════════════
export default function UsersPage() {
    const { toast } = useToast();
    const { canAdd, canEdit, canDelete } = usePermissions('User Management');
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');

    // Dialogs
    const [showCreate, setShowCreate] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [resetUser, setResetUser] = useState<User | null>(null);
    const [transferToId, setTransferToId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Forms
    const emptyCreate = { name: '', email: '', password: '', firstName: '', lastName: '', phone: '', groupIds: [] as string[] };
    const [createForm, setCreateForm] = useState(emptyCreate);
    const [editForm, setEditForm] = useState({ name: '', email: '', firstName: '', lastName: '', phone: '', groupIds: [] as string[] });
    const [newPassword, setNewPassword] = useState('');

    // ── Data fetching ─────────────────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: '1', pageSize: '50', search });
            if (groupFilter !== 'all') params.set('groupId', groupFilter);
            const res = await fetch(`/api/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } finally { setLoading(false); }
    }, [search, groupFilter]);

    const fetchGroups = useCallback(async () => {
        try {
            const res = await fetch('/api/roles');
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
                // Auto-select staff group by default for new user creation
                const staffGroup = data.find((g: Group) => g.name === 'staff');
                if (staffGroup) {
                    setCreateForm(prev => ({ ...prev, groupIds: prev.groupIds.length === 0 ? [staffGroup.id] : prev.groupIds }));
                }
            }
        } catch { /* silent */ }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { fetchGroups(); }, [fetchGroups]);

    // ── Group Checkbox helpers ─────────────────────────────────────────────────
    const toggleGroupId = (ids: string[], id: string) =>
        ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];

    // ── Stats ─────────────────────────────────────────────────────────────────
    const activeCount = users.filter(u => u.isActive).length;
    const adminCount = users.filter(u => u.groupNames?.includes('admin')).length;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleCreate = async () => {
        if (!createForm.email || !createForm.password) {
            toast({ title: 'Error', description: 'Email and password are required', variant: 'destructive' }); return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...createForm, name: createForm.name || createForm.email }),
            });
            if (res.ok) {
                toast({ title: 'User Created ✅', description: `${createForm.email} has been added successfully.` });
                setShowCreate(false); setCreateForm(emptyCreate); fetchUsers();
            } else {
                const err = await res.json();
                const msg = Array.isArray(err.message) ? err.message.join(', ') : (err.message || 'Failed to create user');
                toast({ title: 'Error', description: msg, variant: 'destructive' });
            }
        } finally { setSubmitting(false); }
    };

    const openEdit = (user: User) => {
        setEditUser(user);
        setEditForm({
            name: user.name || '', email: user.email,
            firstName: user.firstName || '', lastName: user.lastName || '',
            phone: user.phone || '', groupIds: user.groupIds || [],
        });
    };

    const handleUpdate = async () => {
        if (!editUser) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/users/${editUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                toast({ title: 'Success', description: 'User updated' });
                setEditUser(null); fetchUsers();
            } else {
                const err = await res.json();
                toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
            }
        } finally { setSubmitting(false); }
    };

    const handleToggle = async (user: User) => {
        await fetch(`/api/users/${user.id}/toggle`, { method: 'PATCH' });
        fetchUsers();
    };

    const handleResetPassword = async () => {
        if (!resetUser || !newPassword) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/users/${resetUser.id}/reset-password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });
            if (res.ok) {
                toast({ title: 'Success', description: 'Password reset successfully' });
                setResetUser(null); setNewPassword('');
            } else {
                const err = await res.json();
                toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
            }
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!deleteUser) return;
        const url = transferToId
            ? `/api/users/${deleteUser.id}?transferToId=${transferToId}`
            : `/api/users/${deleteUser.id}`;
        const res = await fetch(url, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            toast({ title: 'Success', description: 'User deleted' });
            setDeleteUser(null); setTransferToId(''); fetchUsers();
        } else if (data.requiresTransfer) {
            toast({ title: 'Transfer required', description: data.message, variant: 'destructive' });
        } else {
            toast({ title: 'Error', description: data.message || 'Failed', variant: 'destructive' });
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-7 w-7 text-primary" /> User Management</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Manage staff accounts, assign groups, and control access</p>
                </div>
                {canAdd && (
                    <Button onClick={() => setShowCreate(true)}><UserPlus className="mr-2 h-4 w-4" /> Add User</Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500' },
                    { label: 'Active', value: activeCount, icon: UserCheck, color: 'text-green-500' },
                    { label: 'Inactive', value: users.length - activeCount, icon: UserX, color: 'text-red-500' },
                    { label: 'Admins', value: adminCount, icon: Shield, color: 'text-purple-500' },
                ].map(s => (
                    <Card key={s.label} className="border-none shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <s.icon className={`h-8 w-8 ${s.color}`} />
                            <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="All Groups" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {groups.map(g => <SelectItem key={g.id} value={g.id} className="capitalize">{g.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchUsers}><RefreshCw className="h-4 w-4" /></Button>
            </div>

            {/* Table */}
            <Card className="border-none shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Groups</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
                        ) : users.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No users found</TableCell></TableRow>
                        ) : users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{user.name || '—'}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {(user.groupNames || []).length > 0
                                            ? (user.groupNames || []).map(g => (
                                                <span key={g} className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getGroupColor(g)}`}>{g}</span>
                                            ))
                                            : <span className="text-xs text-muted-foreground">No group</span>
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.isActive ? 'default' : 'secondary'} className={user.isActive ? 'bg-green-100 text-green-800' : ''}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 justify-end">
                                        {canEdit && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(user)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canEdit && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Reset Password" onClick={() => setResetUser(user)}>
                                                <KeyRound className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canEdit && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" title={user.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggle(user)}>
                                                {user.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete" onClick={() => setDeleteUser(user)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* ── Create User Dialog ─────────────────────────────────────────────────── */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label>First Name</Label>
                                <Input value={createForm.firstName} onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })} /></div>
                            <div className="space-y-1.5"><Label>Last Name</Label>
                                <Input value={createForm.lastName} onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })} /></div>
                        </div>
                        <div className="space-y-1.5"><Label>Email <span className="text-destructive">*</span></Label>
                            <Input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label>Password <span className="text-destructive">*</span></Label>
                            <Input type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label>Phone</Label>
                            <Input value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} /></div>
                        <div className="space-y-2">
                            <Label>Groups</Label>
                            <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                                {groups.map(g => (
                                    <label key={g.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer">
                                        <Checkbox
                                            checked={createForm.groupIds.includes(g.id)}
                                            onCheckedChange={() => setCreateForm(prev => ({ ...prev, groupIds: toggleGroupId(prev.groupIds, g.id) }))}
                                        />
                                        <span className="capitalize text-sm font-medium">{g.name}</span>
                                        {g.isSystem && <Badge variant="outline" className="text-xs">System</Badge>}
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{createForm.groupIds.length} group(s) selected</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={submitting}>{submitting ? 'Creating...' : 'Create User'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Edit User Dialog ───────────────────────────────────────────────────── */}
            <Dialog open={!!editUser} onOpenChange={v => !v && setEditUser(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Edit User — {editUser?.name || editUser?.email}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label>First Name</Label>
                                <Input value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} /></div>
                            <div className="space-y-1.5"><Label>Last Name</Label>
                                <Input value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} /></div>
                        </div>
                        <div className="space-y-1.5"><Label>Email</Label>
                            <Input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label>Phone</Label>
                            <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                        <div className="space-y-2">
                            <Label>Groups</Label>
                            <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                                {groups.map(g => (
                                    <label key={g.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer">
                                        <Checkbox
                                            checked={editForm.groupIds.includes(g.id)}
                                            onCheckedChange={() => setEditForm(prev => ({ ...prev, groupIds: toggleGroupId(prev.groupIds, g.id) }))}
                                        />
                                        <span className="capitalize text-sm font-medium">{g.name}</span>
                                        {g.isSystem && <Badge variant="outline" className="text-xs">System</Badge>}
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{editForm.groupIds.length} group(s) selected</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Reset Password Dialog ──────────────────────────────────────────────── */}
            <Dialog open={!!resetUser} onOpenChange={v => !v && (setResetUser(null), setNewPassword(''))}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Reset Password</DialogTitle>
                        <DialogDescription>Set a new password for <strong>{resetUser?.name || resetUser?.email}</strong>.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label>New Password <span className="text-destructive">*</span></Label>
                            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setResetUser(null); setNewPassword(''); }}>Cancel</Button>
                        <Button onClick={handleResetPassword} disabled={submitting || !newPassword}>{submitting ? 'Updating...' : 'Reset Password'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete User Dialog (with transfer) ────────────────────────────────── */}
            <AlertDialog open={!!deleteUser} onOpenChange={v => !v && (setDeleteUser(null), setTransferToId(''))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" /> Delete User?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Delete <strong>{deleteUser?.name || deleteUser?.email}</strong>? If this user has records (leads, students, applications) you must transfer them first.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 px-1 py-2">
                        <Label className="text-sm font-medium">Transfer records to (optional)</Label>
                        <Select value={transferToId} onValueChange={setTransferToId}>
                            <SelectTrigger><SelectValue placeholder="Select a user to transfer records to" /></SelectTrigger>
                            <SelectContent>
                                {users.filter(u => u.id !== deleteUser?.id).map(u => (
                                    <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">If the user has no records, this step is optional.</p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setDeleteUser(null); setTransferToId(''); }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete User</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
