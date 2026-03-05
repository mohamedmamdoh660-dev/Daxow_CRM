'use client';

import { useState, useEffect } from 'react';
import { NAV_ITEMS } from '@/lib/config/modules';
import {
    Search, Plus, Edit2, Trash2, Save, X, ChevronRight,
    CheckSquare, Webhook as WebhookIcon, Code2, Globe, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    loadButtons, saveButtons, loadWebhooks,
    MODULE_FIELDS, CONDITION_OPERATORS,
    type CustomButton, type Webhook, type ActionType, type PageType, type PositionType,
    type ButtonCondition, type ConditionOperator,
} from '@/lib/types/buttons-webhooks';

// ── Constants ──────────────────────────────────────────────────────────────────
const UNIQUE_MODULES = NAV_ITEMS.reduce<{ module: string; label: string }[]>((acc, item) => {
    if (!acc.find(m => m.module === item.permissionModule))
        acc.push({ module: item.permissionModule, label: item.label });
    return acc;
}, []);

const TABS = ['Layouts', 'Layout Rules', 'Validation Rules', 'Fields', 'Links', 'Buttons', 'Summary'];

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
    webhook: <WebhookIcon className="h-4 w-4" />,
    function: <Code2 className="h-4 w-4" />,
    url: <Globe className="h-4 w-4" />,
};
const ACTION_LABELS: Record<ActionType, string> = {
    webhook: 'Webhook', function: 'Function', url: 'Open URL',
};
const ACTION_COLORS: Record<ActionType, string> = {
    webhook: 'bg-purple-100 text-purple-700 border-purple-200',
    function: 'bg-blue-100 text-blue-700 border-blue-200',
    url: 'bg-green-100 text-green-700 border-green-200',
};

const DEFAULT_ROLES = ['admin', 'staff', 'agent'];

// ── Coming Soon Tab ────────────────────────────────────────────────────────────
function ComingSoonTab({ tab }: { tab: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CheckSquare className="h-8 w-8 opacity-40" />
            </div>
            <p className="text-lg font-medium mb-1">{tab}</p>
            <p className="text-sm opacity-60">This section is coming soon</p>
        </div>
    );
}

// ── Button Form ────────────────────────────────────────────────────────────────
interface ButtonFormProps {
    initial?: Partial<CustomButton>;
    moduleLabel: string;
    moduleKey: string;
    onSave: (btn: Omit<CustomButton, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}

function ButtonForm({ initial, moduleLabel, moduleKey, onSave, onCancel }: ButtonFormProps) {
    const [name, setName] = useState(initial?.name || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [actionType, setActionType] = useState<ActionType>(initial?.actionType || 'webhook');
    const [actionValue, setActionValue] = useState(initial?.actionValue || '');
    const [page, setPage] = useState<PageType>(initial?.page || 'in_record');
    const [position, setPosition] = useState<PositionType>(initial?.position || 'details');
    const [isActive, setIsActive] = useState(initial?.isActive ?? true);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(initial?.roles || ['all']);
    const [showDesc, setShowDesc] = useState(!!initial?.description);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES);

    // Condition state
    const [useCondition, setUseCondition] = useState(!!initial?.condition);
    const [condField, setCondField] = useState(initial?.condition?.field || '');
    const [condOperator, setCondOperator] = useState<ConditionOperator>(initial?.condition?.operator || 'is');
    const [condValue, setCondValue] = useState(initial?.condition?.value || '');
    const [fieldValues, setFieldValues] = useState<string[]>([]);
    const [loadingValues, setLoadingValues] = useState(false);

    const moduleFields = MODULE_FIELDS[moduleKey] || [];
    const needsValue = !['is_empty', 'is_not_empty'].includes(condOperator);

    useEffect(() => {
        setWebhooks(loadWebhooks());
        fetch('/api/roles').then(r => r.json()).then(data => {
            if (Array.isArray(data)) setRoles(data.map((r: any) => r.name));
        }).catch(() => { });
    }, []);

    // Fetch field values dynamically when condField changes
    useEffect(() => {
        if (!condField || !useCondition) { setFieldValues([]); return; }
        setLoadingValues(true);
        fetch(`/api/field-values?module=${moduleKey}&field=${condField}`)
            .then(r => r.json())
            .then(d => setFieldValues(d.values || []))
            .catch(() => setFieldValues([]))
            .finally(() => setLoadingValues(false));
    }, [condField, moduleKey, useCondition]);

    const toggleRole = (role: string) => {
        if (role === 'all') { setSelectedRoles(['all']); return; }
        setSelectedRoles(prev => {
            const without = prev.filter(r => r !== 'all' && r !== role);
            if (prev.includes(role)) return without.length ? without : ['all'];
            return [...without, role];
        });
    };

    const ACTION_PLACEHOLDER: Record<ActionType, string> = {
        webhook: 'Select a configured webhook...',
        function: 'my_function_name',
        url: 'https://example.com/page (use {{record.id}} for record ID)',
    };

    const isValid = !!(name.trim() && actionValue.trim());

    const buildCondition = (): ButtonCondition | undefined => {
        if (!useCondition || !condField || !condOperator) return undefined;
        return { field: condField, operator: condOperator, value: needsValue ? condValue : undefined };
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-2xl">
            <h3 className="text-base font-semibold mb-6">
                {initial?.name ? 'Edit Button' : 'New Button'} — {moduleLabel}
            </h3>

            <div className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                    <Label>Button Name <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g. Send Application, Sync to Portal" value={name} onChange={e => setName(e.target.value)} />
                    {!showDesc && (
                        <button type="button" className="text-xs text-primary hover:underline" onClick={() => setShowDesc(true)}>
                            + Add Description
                        </button>
                    )}
                </div>

                {showDesc && (
                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea placeholder="Describe what this button does..." value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                    </div>
                )}

                {/* Action Type */}
                <div className="space-y-1.5">
                    <Label>Define Action <span className="text-destructive">*</span></Label>
                    <div className="grid grid-cols-3 gap-3">
                        {(['webhook', 'function', 'url'] as ActionType[]).map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => { setActionType(type); setActionValue(''); }}
                                className={cn(
                                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-sm font-medium',
                                    actionType === type
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                )}
                            >
                                <div className={cn('p-2 rounded-lg', actionType === type ? 'bg-primary/10' : 'bg-gray-100')}>
                                    {ACTION_ICONS[type]}
                                </div>
                                {ACTION_LABELS[type]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Value */}
                <div className="space-y-1.5">
                    <Label>
                        {actionType === 'webhook' ? 'Select Webhook' : actionType === 'function' ? 'Function Name' : 'Target URL'}
                        <span className="text-destructive"> *</span>
                    </Label>
                    {actionType === 'webhook' ? (
                        <div className="space-y-2">
                            <Select value={actionValue} onValueChange={setActionValue}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a configured webhook..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {webhooks.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">No webhooks configured yet.</div>
                                    ) : (
                                        webhooks.map(w => (
                                            <SelectItem key={w.id} value={w.id}>
                                                <span className="font-medium">{w.name}</span>
                                                <span className="text-muted-foreground ml-2 text-xs">({w.module})</span>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <a href="/settings/webhooks" className="text-xs text-primary hover:underline flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Configure a new webhook in Settings → Automation → Webhooks
                            </a>
                        </div>
                    ) : (
                        <Input
                            placeholder={ACTION_PLACEHOLDER[actionType]}
                            value={actionValue}
                            onChange={e => setActionValue(e.target.value)}
                            className="font-mono text-sm"
                        />
                    )}
                </div>

                {/* Page + Position */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Show On Page</Label>
                        <Select value={page} onValueChange={v => setPage(v as PageType)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="in_record">In Record</SelectItem>
                                <SelectItem value="list_view">List View</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Position</Label>
                        <Select value={position} onValueChange={v => setPosition(v as PositionType)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="details">Details Section</SelectItem>
                                <SelectItem value="header">Header</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Role Visibility */}
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg border">
                    <Label>Button Visibility — Which roles can see this button</Label>
                    <div className="flex flex-wrap gap-3 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={selectedRoles.includes('all')}
                                onCheckedChange={() => toggleRole('all')}
                            />
                            <span className="text-sm font-medium">All Roles</span>
                        </label>
                        {roles.map(role => (
                            <label key={role} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={selectedRoles.includes(role) && !selectedRoles.includes('all')}
                                    onCheckedChange={() => toggleRole(role)}
                                    disabled={selectedRoles.includes('all')}
                                />
                                <span className="text-sm capitalize">{role}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* ── Condition Builder ─────────────────────────────────────────── */}
                <div className="space-y-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-amber-800">Show Condition</Label>
                            <p className="text-xs text-amber-600 mt-0.5">Only show this button when a field matches a value</p>
                        </div>
                        <div className="flex">
                            <button
                                type="button"
                                onClick={() => setUseCondition(false)}
                                className={cn('px-3 py-1 rounded-l-md border text-sm font-medium transition-colors',
                                    !useCondition ? 'bg-white border-amber-400 text-amber-700 shadow-sm z-10' : 'bg-amber-100 border-amber-200 text-amber-500'
                                )}
                            >Always</button>
                            <button
                                type="button"
                                onClick={() => setUseCondition(true)}
                                className={cn('px-3 py-1 rounded-r-md border text-sm font-medium transition-colors -ml-px',
                                    useCondition ? 'bg-white border-amber-400 text-amber-700 shadow-sm z-10' : 'bg-amber-100 border-amber-200 text-amber-500'
                                )}
                            >Condition</button>
                        </div>
                    </div>

                    {useCondition && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Field picker */}
                            <Select value={condField} onValueChange={v => { setCondField(v); setCondValue(''); }}>
                                <SelectTrigger className="w-44 bg-white">
                                    <SelectValue placeholder="Select field..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {moduleFields.length > 0 ? moduleFields.map(f => (
                                        <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                                    )) : (
                                        <div className="p-2 text-xs text-muted-foreground">No fields mapped for this module</div>
                                    )}
                                </SelectContent>
                            </Select>

                            {/* Operator */}
                            <Select value={condOperator} onValueChange={v => setCondOperator(v as ConditionOperator)}>
                                <SelectTrigger className="w-36 bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONDITION_OPERATORS.map(op => (
                                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Value — dynamic dropdown or free text */}
                            {needsValue && condField && (
                                loadingValues ? (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                                    </div>
                                ) : fieldValues.length > 0 ? (
                                    <Select value={condValue} onValueChange={setCondValue}>
                                        <SelectTrigger className="w-44 bg-white">
                                            <SelectValue placeholder="Select value..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fieldValues.map(v => (
                                                <SelectItem key={v} value={v}>{v}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        placeholder="Enter value..."
                                        value={condValue}
                                        onChange={e => setCondValue(e.target.value)}
                                        className="w-44 bg-white text-sm"
                                    />
                                )
                            )}

                            {/* Preview label */}
                            {condField && condOperator && (needsValue ? condValue : true) && (
                                <span className="text-xs text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                                    Show when <strong>{moduleFields.find(f => f.key === condField)?.label || condField}</strong>{' '}
                                    {CONDITION_OPERATORS.find(o => o.value === condOperator)?.label}
                                    {needsValue && <> <strong>{condValue}</strong></>}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                    <div>
                        <p className="text-sm font-medium">Button Active</p>
                        <p className="text-xs text-muted-foreground">Inactive buttons won't appear in records</p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                    disabled={!isValid}
                    onClick={() => onSave({
                        name: name.trim(),
                        description: description.trim() || undefined,
                        actionType,
                        actionValue: actionValue.trim(),
                        page, position, isActive,
                        roles: selectedRoles,
                        condition: buildCondition(),
                    })}
                >
                    <Save className="h-4 w-4 mr-2" /> Save Button
                </Button>
                <Button variant="outline" onClick={onCancel}><X className="h-4 w-4 mr-2" />Cancel</Button>
            </div>
        </div>
    );
}

// ── Buttons Tab ────────────────────────────────────────────────────────────────
function ButtonsTab({ moduleKey, moduleLabel }: { moduleKey: string; moduleLabel: string }) {
    const [allButtons, setAllButtons] = useState<Record<string, CustomButton[]>>({});
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => { setAllButtons(loadButtons()); }, [moduleKey]);

    const buttons = allButtons[moduleKey] || [];
    const persist = (updated: Record<string, CustomButton[]>) => { setAllButtons(updated); saveButtons(updated); };

    const handleSave = (data: Omit<CustomButton, 'id' | 'createdAt'>) => {
        if (editingId) {
            persist({ ...allButtons, [moduleKey]: buttons.map(b => b.id === editingId ? { ...b, ...data } : b) });
            sonnerToast.success('Button updated');
        } else {
            const newBtn: CustomButton = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
            persist({ ...allButtons, [moduleKey]: [...buttons, newBtn] });
            sonnerToast.success('Button created');
        }
        setShowForm(false); setEditingId(null);
    };

    const handleDelete = (id: string) => {
        persist({ ...allButtons, [moduleKey]: buttons.filter(b => b.id !== id) });
        setDeleteId(null);
        sonnerToast.error('Button deleted');
    };

    const handleToggle = (id: string) => {
        persist({ ...allButtons, [moduleKey]: buttons.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b) });
    };

    if (showForm || editingId) {
        return (
            <ButtonForm
                initial={editingId ? buttons.find(b => b.id === editingId) : undefined}
                moduleLabel={moduleLabel}
                moduleKey={moduleKey}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditingId(null); }}
            />
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-gray-800">Custom Buttons</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Buttons appear in {moduleLabel} record pages — trigger webhooks, functions, or URLs
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" /> New Button
                </Button>
            </div>

            {buttons.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 text-center">
                    <Plus className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-500 mb-1">No buttons yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Add custom action buttons to {moduleLabel} records</p>
                    <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Create First Button
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {buttons.map(btn => (
                        <div key={btn.id} className="flex items-center justify-between p-4 bg-white rounded-xl border hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border', ACTION_COLORS[btn.actionType])}>
                                    {ACTION_ICONS[btn.actionType]}
                                    {ACTION_LABELS[btn.actionType]}
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-gray-800">{btn.name}</p>
                                    {btn.description && <p className="text-xs text-muted-foreground mt-0.5">{btn.description}</p>}
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                        <Badge variant="outline" className="text-xs">
                                            {btn.page === 'in_record' ? 'In Record' : btn.page === 'list_view' ? 'List View' : 'Both Pages'}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {btn.position === 'details' ? 'Details' : btn.position === 'header' ? 'Header' : 'Both Positions'}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {btn.roles.includes('all') ? 'All Roles' : btn.roles.join(', ')}
                                        </Badge>
                                        {btn.condition && (
                                            <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                                When {btn.condition.field} {btn.condition.operator.replace('_', ' ')} {btn.condition.value || ''}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={btn.isActive} onCheckedChange={() => handleToggle(btn.id)} />
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(btn.id)}>
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(btn.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Button?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ModulesSettingsPage() {
    const [selectedModule, setSelectedModule] = useState(UNIQUE_MODULES[0]);
    const [activeTab, setActiveTab] = useState('Buttons');
    const [search, setSearch] = useState('');

    const filteredModules = UNIQUE_MODULES.filter(m =>
        m.label.toLowerCase().includes(search.toLowerCase()) ||
        m.module.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-full bg-[#f5f6fa]">
            {/* Left Sidebar */}
            <aside className="w-56 border-r bg-white flex flex-col shrink-0">
                <div className="p-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="Search modules..." className="pl-8 h-8 text-xs bg-gray-50" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto py-1">
                    {filteredModules.map(m => (
                        <button
                            key={m.module}
                            onClick={() => { setSelectedModule(m); setActiveTab('Buttons'); }}
                            className={cn(
                                'w-full flex items-center justify-between px-4 py-2 text-sm transition-colors text-left',
                                selectedModule.module === m.module
                                    ? 'bg-primary/5 text-primary font-medium border-r-2 border-primary'
                                    : 'text-gray-600 hover:bg-gray-50'
                            )}
                        >
                            <span>{m.label}</span>
                            {selectedModule.module === m.module && <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Right Panel */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white border-b px-6 pt-5 pb-0">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">{selectedModule.label}</h2>
                    <div className="flex gap-0">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                                    activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-gray-700'
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'Buttons' ? (
                        <ButtonsTab key={selectedModule.module} moduleKey={selectedModule.module} moduleLabel={selectedModule.label} />
                    ) : (
                        <ComingSoonTab tab={activeTab} />
                    )}
                </div>
            </main>
        </div>
    );
}
