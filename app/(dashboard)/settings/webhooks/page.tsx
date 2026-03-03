'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, ChevronDown, ExternalLink, Eye,
    Webhook as WebhookIcon, Search, Copy, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    loadWebhooks, saveWebhooks, MODULE_FIELDS,
    type Webhook, type WebhookParam, type HttpMethod, type BodyType
} from '@/lib/types/buttons-webhooks';
import { PERMISSION_MODULES } from '@/lib/config/modules';

// ── Helpers ───────────────────────────────────────────────────────────────────
const HTTP_METHODS: HttpMethod[] = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'];
const BODY_TYPES: { value: BodyType; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'json', label: 'JSON' },
    { value: 'form_data', label: 'Form Data' },
    { value: 'raw', label: 'Raw' },
];
const METHOD_COLORS: Record<HttpMethod, string> = {
    POST: 'bg-green-100 text-green-700',
    GET: 'bg-blue-100 text-blue-700',
    PUT: 'bg-amber-100 text-amber-700',
    PATCH: 'bg-orange-100 text-orange-700',
    DELETE: 'bg-red-100 text-red-700',
};

function uid() { return crypto.randomUUID(); }

// ── Param Row ─────────────────────────────────────────────────────────────────
function ParamRow({
    param, onChange, onRemove, type, selectedModule,
}: {
    param: WebhookParam;
    onChange: (p: WebhookParam) => void;
    onRemove: () => void;
    type: 'module' | 'custom';
    selectedModule: string;
}) {
    const fields = MODULE_FIELDS[selectedModule] || [];

    return (
        <div className="flex items-center gap-2 mb-2">
            <Input
                placeholder="Parameter name"
                value={param.name}
                onChange={e => onChange({ ...param, name: e.target.value })}
                className="w-40 text-sm"
            />
            {type === 'module' ? (
                <>
                    <Select value={param.module || selectedModule} onValueChange={v => onChange({ ...param, module: v, field: '' })}>
                        <SelectTrigger className="w-36 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {PERMISSION_MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={param.field || ''} onValueChange={v => onChange({ ...param, field: v })}>
                        <SelectTrigger className="w-40 text-sm">
                            <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                            {(MODULE_FIELDS[param.module || selectedModule] || []).map(f => (
                                <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </>
            ) : (
                <Input
                    placeholder="Value"
                    value={param.value || ''}
                    onChange={e => onChange({ ...param, value: e.target.value })}
                    className="flex-1 text-sm"
                />
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={onRemove}>
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

// ── Webhook Form ──────────────────────────────────────────────────────────────
function WebhookForm({ initial, onSave, onCancel }: {
    initial?: Webhook;
    onSave: (w: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(initial?.name || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [method, setMethod] = useState<HttpMethod>(initial?.method || 'POST');
    const [url, setUrl] = useState(initial?.url || '');
    const [module, setModule] = useState(initial?.module || 'Students');
    const [bodyType, setBodyType] = useState<BodyType>(initial?.bodyType || 'json');
    const [bodyContent, setBodyContent] = useState(initial?.bodyContent || '');
    const [moduleParams, setModuleParams] = useState<WebhookParam[]>(initial?.moduleParams || []);
    const [customParams, setCustomParams] = useState<WebhookParam[]>(initial?.customParams || []);

    const isValid = name.trim() && url.trim();

    // Preview URL
    const previewUrl = url + (moduleParams.length || customParams.length
        ? '?' + [...moduleParams.map(p => `${p.name}={{record.${p.field}}}`),
        ...customParams.map(p => `${p.name}=${p.value}`)]
            .filter(Boolean).join('&')
        : '');

    return (
        <div className="bg-white rounded-xl border shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="font-semibold">{initial ? 'Edit Webhook' : 'Create Webhook'}</h3>
                <Button variant="ghost" size="icon" onClick={onCancel}><X className="h-4 w-4" /></Button>
            </div>

            <div className="p-6 space-y-5 max-h-[calc(100vh-180px)] overflow-y-auto">
                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Name <span className="text-destructive">*</span></Label>
                        <Input placeholder="e.g. Sync Student to Portal" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Module</Label>
                        <Select value={module} onValueChange={setModule}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {PERMISSION_MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Input placeholder="Optional description" value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                {/* Method + URL */}
                <div className="space-y-1.5">
                    <Label>URL to Notify <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                        <Select value={method} onValueChange={v => setMethod(v as HttpMethod)}>
                            <SelectTrigger className="w-28">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {HTTP_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="https://your-endpoint.com/webhook"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className="flex-1 font-mono text-sm"
                        />
                    </div>
                </div>

                {/* Module Parameters */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>Module Parameters</Label>
                        <button
                            type="button"
                            onClick={() => setModuleParams(p => [...p, { id: uid(), name: '', module, field: '', type: 'module' }])}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            <Plus className="h-3 w-3" /> Add parameter
                        </button>
                    </div>
                    {moduleParams.length === 0 && (
                        <p className="text-xs text-muted-foreground">No module parameters — click "Add parameter" to map record fields</p>
                    )}
                    {moduleParams.map(p => (
                        <ParamRow
                            key={p.id}
                            param={p}
                            type="module"
                            selectedModule={module}
                            onChange={updated => setModuleParams(prev => prev.map(x => x.id === p.id ? updated : x))}
                            onRemove={() => setModuleParams(prev => prev.filter(x => x.id !== p.id))}
                        />
                    ))}
                </div>

                {/* Custom Parameters */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>Custom Parameters</Label>
                        <button
                            type="button"
                            onClick={() => setCustomParams(p => [...p, { id: uid(), name: '', value: '', type: 'custom' }])}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            <Plus className="h-3 w-3" /> Add parameter
                        </button>
                    </div>
                    {customParams.length === 0 && (
                        <p className="text-xs text-muted-foreground">No custom parameters — these are static key/value pairs</p>
                    )}
                    {customParams.map(p => (
                        <ParamRow
                            key={p.id}
                            param={p}
                            type="custom"
                            selectedModule={module}
                            onChange={updated => setCustomParams(prev => prev.map(x => x.id === p.id ? updated : x))}
                            onRemove={() => setCustomParams(prev => prev.filter(x => x.id !== p.id))}
                        />
                    ))}
                </div>

                {/* Body */}
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <Label>Body</Label>
                        <Select value={bodyType} onValueChange={v => setBodyType(v as BodyType)}>
                            <SelectTrigger className="w-32 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {BODY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {(bodyType === 'json' || bodyType === 'raw') && (
                        <Textarea
                            placeholder={bodyType === 'json'
                                ? '{\n  "student_id": "{{record.id}}",\n  "email": "{{record.email}}"\n}'
                                : 'Raw body content (use {{record.field}} for dynamic values)'}
                            value={bodyContent}
                            onChange={e => setBodyContent(e.target.value)}
                            rows={5}
                            className="font-mono text-sm"
                        />
                    )}
                </div>

                {/* Preview URL */}
                <div className="space-y-1.5">
                    <Label className="text-muted-foreground">Preview URL</Label>
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs break-all text-gray-600 border">
                        <span className={cn('font-bold mr-2', METHOD_COLORS[method].split(' ')[1])}>{method}</span>
                        {previewUrl || <span className="text-muted-foreground italic">Enter URL above...</span>}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t">
                <Button
                    disabled={!isValid}
                    onClick={() => onSave({ name: name.trim(), description: description.trim() || undefined, method, url: url.trim(), module, bodyType, bodyContent: bodyContent.trim() || undefined, moduleParams, customParams })}
                >
                    <Save className="h-4 w-4 mr-2" /> Save Webhook
                </Button>
                <Button variant="outline" onClick={onCancel}><X className="h-4 w-4 mr-2" />Cancel</Button>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WebhooksPage() {
    const { toast } = useToast();
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [moduleFilter, setModuleFilter] = useState('all');

    useEffect(() => { setWebhooks(loadWebhooks()); }, []);

    const persist = (data: Webhook[]) => { setWebhooks(data); saveWebhooks(data); };

    const handleSave = (data: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        if (editingId) {
            persist(webhooks.map(w => w.id === editingId ? { ...w, ...data, updatedAt: now } : w));
            toast({ title: 'Webhook updated' });
        } else {
            persist([...webhooks, { ...data, id: uid(), createdAt: now, updatedAt: now }]);
            toast({ title: 'Webhook created' });
        }
        setShowForm(false);
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        persist(webhooks.filter(w => w.id !== id));
        setDeleteId(null);
        toast({ title: 'Webhook deleted', variant: 'destructive' });
    };

    const filtered = webhooks.filter(w => {
        const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.url.toLowerCase().includes(search.toLowerCase());
        const matchModule = moduleFilter === 'all' || w.module === moduleFilter;
        return matchSearch && matchModule;
    });

    const editingWebhook = editingId ? webhooks.find(w => w.id === editingId) : undefined;

    if (showForm || editingId) {
        return (
            <div className="p-6">
                <WebhookForm
                    initial={editingWebhook}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setEditingId(null); }}
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <WebhookIcon className="h-5 w-5 text-purple-600" />
                        Webhooks
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Configure webhooks to notify external services when CRM events occur
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Configure Webhook
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search webhooks..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="All Modules" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Modules</SelectItem>
                        {PERMISSION_MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 text-center">
                    <WebhookIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-500 mb-1">No webhooks configured</p>
                    <p className="text-sm text-muted-foreground mb-4">Create your first webhook to connect with external services</p>
                    <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Configure Webhook
                    </Button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500">Module</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500">URL to Notify</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-500">Modified</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((w, i) => (
                                <tr key={w.id} className={cn('border-b last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')}>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setEditingId(w.id)}
                                            className="font-medium text-primary hover:underline"
                                        >{w.name}</button>
                                        {w.description && <p className="text-xs text-muted-foreground">{w.description}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-xs">{w.module}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', METHOD_COLORS[w.method])}>
                                                {w.method}
                                            </span>
                                            <span className="text-muted-foreground font-mono text-xs truncate max-w-xs">{w.url}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {new Date(w.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(w.id)}>
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(w.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete confirm */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
                        <AlertDialogDescription>Any buttons using this webhook will stop working.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
