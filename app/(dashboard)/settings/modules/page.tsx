'use client';

import { useState, useEffect } from 'react';
import { NAV_ITEMS } from '@/lib/config/modules';
import { Search, Plus, Edit2, Trash2, ChevronRight, Webhook, Code2, Link2, Globe, Loader2, Save, X, CheckSquare } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ── Types ─────────────────────────────────────────────────────────────────────
type ActionType = 'webhook' | 'function' | 'url';
type PageType = 'in_record' | 'list_view' | 'both';
type PositionType = 'details' | 'header' | 'both';

interface CustomButton {
    id: string;
    name: string;
    description?: string;
    actionType: ActionType;
    actionValue: string;     // webhook URL / function name / URL
    page: PageType;
    position: PositionType;
    isActive: boolean;
    roles: string[];          // which roles can see it ('all' = everyone)
    createdAt: string;
}

// ── Unique modules list ───────────────────────────────────────────────────────
const UNIQUE_MODULES = NAV_ITEMS.reduce<{ module: string; label: string }[]>((acc, item) => {
    if (!acc.find(m => m.module === item.permissionModule)) {
        acc.push({ module: item.permissionModule, label: item.label });
    }
    return acc;
}, []);

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = ['Layouts', 'Layout Rules', 'Validation Rules', 'Fields', 'Links', 'Buttons', 'Summary'];

// ── Local storage helpers ─────────────────────────────────────────────────────
const STORAGE_KEY = 'crm_module_buttons';
function loadButtons(): Record<string, CustomButton[]> {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveButtons(data: Record<string, CustomButton[]>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Coming Soon component ─────────────────────────────────────────────────────
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

// ── Action type icons ─────────────────────────────────────────────────────────
const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
    webhook: <Webhook className="h-4 w-4" />,
    function: <Code2 className="h-4 w-4" />,
    url: <Globe className="h-4 w-4" />,
};
const ACTION_LABELS: Record<ActionType, string> = {
    webhook: 'Webhook',
    function: 'Function',
    url: 'Open URL',
};
const ACTION_COLORS: Record<ActionType, string> = {
    webhook: 'bg-purple-100 text-purple-700 border-purple-200',
    function: 'bg-blue-100 text-blue-700 border-blue-200',
    url: 'bg-green-100 text-green-700 border-green-200',
};

// ── Button Form ───────────────────────────────────────────────────────────────
interface ButtonFormProps {
    initial?: Partial<CustomButton>;
    moduleLabel: string;
    onSave: (btn: Omit<CustomButton, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}
function ButtonForm({ initial, moduleLabel, onSave, onCancel }: ButtonFormProps) {
    const [name, setName] = useState(initial?.name || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [actionType, setActionType] = useState<ActionType>(initial?.actionType || 'webhook');
    const [actionValue, setActionValue] = useState(initial?.actionValue || '');
    const [page, setPage] = useState<PageType>(initial?.page || 'in_record');
    const [position, setPosition] = useState<PositionType>(initial?.position || 'details');
    const [isActive, setIsActive] = useState(initial?.isActive ?? true);
    const [showDesc, setShowDesc] = useState(!!initial?.description);

    const isValid = name.trim() && actionValue.trim();

    const ACTION_PLACEHOLDER: Record<ActionType, string> = {
        webhook: 'https://your-webhook-url.com/hook',
        function: 'my_function_name',
        url: 'https://example.com/page',
    };
    const ACTION_HINT: Record<ActionType, string> = {
        webhook: 'POST request will be sent with record data as JSON body',
        function: 'Enter the function name to call when button is clicked',
        url: 'The user will be redirected to this URL (use {{record.id}} for record ID)',
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-2xl">
            <h3 className="text-base font-semibold mb-6">{initial?.name ? 'Edit Button' : 'New Button'} — {moduleLabel}</h3>

            <div className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                    <Label>Button Name <span className="text-destructive">*</span></Label>
                    <Input
                        placeholder="e.g. Send Application, Sync to Portal"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    {!showDesc && (
                        <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => setShowDesc(true)}
                        >+ Add Description</button>
                    )}
                </div>

                {showDesc && (
                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Describe what this button does..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={2}
                        />
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
                        {actionType === 'webhook' ? 'Webhook URL' : actionType === 'function' ? 'Function Name' : 'Target URL'}
                        <span className="text-destructive"> *</span>
                    </Label>
                    <Input
                        placeholder={ACTION_PLACEHOLDER[actionType]}
                        value={actionValue}
                        onChange={e => setActionValue(e.target.value)}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">{ACTION_HINT[actionType]}</p>
                </div>

                {/* Page + Position */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Show On</Label>
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

                {/* Active toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                        <p className="text-sm font-medium">Button Active</p>
                        <p className="text-xs text-muted-foreground">Toggle to enable or disable this button</p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                    disabled={!isValid}
                    onClick={() => onSave({ name: name.trim(), description: description.trim() || undefined, actionType, actionValue: actionValue.trim(), page, position, isActive, roles: ['all'] })}
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Button
                </Button>
                <Button variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// ── Buttons Tab ───────────────────────────────────────────────────────────────
function ButtonsTab({ moduleKey, moduleLabel }: { moduleKey: string; moduleLabel: string }) {
    const { toast } = useToast();
    const [allButtons, setAllButtons] = useState<Record<string, CustomButton[]>>({});
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => { setAllButtons(loadButtons()); }, [moduleKey]);

    const buttons = allButtons[moduleKey] || [];

    const persist = (updated: Record<string, CustomButton[]>) => {
        setAllButtons(updated);
        saveButtons(updated);
    };

    const handleSave = (data: Omit<CustomButton, 'id' | 'createdAt'>) => {
        if (editingId) {
            const updated = { ...allButtons, [moduleKey]: buttons.map(b => b.id === editingId ? { ...b, ...data } : b) };
            persist(updated);
            toast({ title: 'Button updated successfully' });
        } else {
            const newBtn: CustomButton = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
            const updated = { ...allButtons, [moduleKey]: [...buttons, newBtn] };
            persist(updated);
            toast({ title: 'Button created successfully' });
        }
        setShowForm(false);
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        const updated = { ...allButtons, [moduleKey]: buttons.filter(b => b.id !== id) };
        persist(updated);
        setDeleteId(null);
        toast({ title: 'Button deleted', variant: 'destructive' });
    };

    const handleToggle = (id: string) => {
        const updated = { ...allButtons, [moduleKey]: buttons.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b) };
        persist(updated);
    };

    const editingBtn = editingId ? buttons.find(b => b.id === editingId) : undefined;

    if (showForm || editingId) {
        return (
            <ButtonForm
                initial={editingBtn}
                moduleLabel={moduleLabel}
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
                        Add action buttons to {moduleLabel} records — trigger webhooks, functions, or open URLs
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Button
                </Button>
            </div>

            {buttons.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-600 mb-1">No buttons yet</p>
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
                                    <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate max-w-xs">{btn.actionValue}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                        {btn.page === 'in_record' ? 'In Record' : btn.page === 'list_view' ? 'List View' : 'Both'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {btn.position === 'details' ? 'Details' : btn.position === 'header' ? 'Header' : 'Both'}
                                    </Badge>
                                </div>
                                <Switch
                                    checked={btn.isActive}
                                    onCheckedChange={() => handleToggle(btn.id)}
                                />
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

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Button?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. The button will be permanently removed.</AlertDialogDescription>
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

// ── Main Page ─────────────────────────────────────────────────────────────────
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
            {/* Left Sidebar — Modules List */}
            <aside className="w-56 border-r bg-white flex flex-col shrink-0">
                <div className="p-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search modules..."
                            className="pl-8 h-8 text-xs bg-gray-50"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
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
                                    ? 'bg-primary/8 text-primary font-medium border-r-2 border-primary bg-primary/5'
                                    : 'text-gray-600 hover:bg-gray-50'
                            )}
                        >
                            <span>{m.label}</span>
                            {selectedModule.module === m.module && (
                                <ChevronRight className="h-3.5 w-3.5" />
                            )}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Right Panel */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Module Header */}
                <div className="bg-white border-b px-6 pt-5 pb-0">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">{selectedModule.label}</h2>

                    {/* Tabs */}
                    <div className="flex gap-0">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                                    activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-gray-700'
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'Buttons' ? (
                        <ButtonsTab
                            key={selectedModule.module}
                            moduleKey={selectedModule.module}
                            moduleLabel={selectedModule.label}
                        />
                    ) : (
                        <ComingSoonTab tab={activeTab} />
                    )}
                </div>
            </main>
        </div>
    );
}
