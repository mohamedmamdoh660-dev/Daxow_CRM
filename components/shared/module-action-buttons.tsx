'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Webhook as WebhookIcon, Code2, Globe } from 'lucide-react';
import { loadButtons, loadWebhooks, appendLog, type CustomButton, type Webhook, type WebhookParam, type PositionType, type PageType } from '@/lib/types/buttons-webhooks';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ModuleActionButtonsProps {
    /** The permission module key, e.g. 'Students', 'Leads' */
    module: string;
    /** Current user's role name */
    userRole?: string;
    /** The record data — passed to webhook / URL as context */
    record?: Record<string, any>;
    /** Where to render: 'header' or 'details' */
    position: PositionType;
    /** Which page context: 'in_record' or 'list_view' */
    page: PageType;
    className?: string;
}

export function ModuleActionButtons({ module, userRole = 'admin', record = {}, position, page, className }: ModuleActionButtonsProps) {
    const { toast } = useToast();
    const [buttons, setButtons] = useState<CustomButton[]>([]);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const allButtons = loadButtons();
        const moduleButtons = (allButtons[module] || []).filter(b => {
            if (!b.isActive) return false;
            // Page filter
            if (b.page !== 'both' && b.page !== page) return false;
            // Position filter
            if (b.position !== 'both' && b.position !== position) return false;
            // Role filter
            if (b.roles.includes('all')) return true;
            if (!userRole) return false;
            return b.roles.includes(userRole);
        });
        setButtons(moduleButtons);
        setWebhooks(loadWebhooks());
    }, [module, userRole, position, page]);

    if (buttons.length === 0) return null;

    /** Interpolate {{record.fieldName}} placeholders in a string */
    const interpolate = (str: string): string => {
        return str.replace(/\{\{record\.(\w+)\}\}/g, (_, field) => record[field] ?? '');
    };

    const handleClick = async (btn: CustomButton) => {
        setLoading(p => ({ ...p, [btn.id]: true }));
        const startTime = Date.now();
        try {
            if (btn.actionType === 'url') {
                const url = interpolate(btn.actionValue);
                window.open(url, '_blank');
                toast({ title: `${btn.name} — opening URL...` });

            } else if (btn.actionType === 'webhook') {
                const webhook = webhooks.find(w => w.id === btn.actionValue);
                if (!webhook) {
                    toast({ title: 'Webhook not found — check button configuration', variant: 'destructive' });
                    return;
                }

                // Build query params
                const queryParams = new URLSearchParams();
                webhook.moduleParams.forEach((p: WebhookParam) => {
                    const val = p.field ? (record[p.field] ?? '') : '';
                    queryParams.set(p.name, String(val));
                });
                webhook.customParams.forEach((p: WebhookParam) => {
                    queryParams.set(p.name, p.value ?? '');
                });
                const finalUrl = queryParams.toString() ? `${webhook.url}?${queryParams}` : webhook.url;

                // Build body
                let bodyPayload: any = { record, module };
                if (webhook.bodyType === 'json' && webhook.bodyContent) {
                    try { bodyPayload = JSON.parse(interpolate(webhook.bodyContent)); }
                    catch { bodyPayload = interpolate(webhook.bodyContent); }
                } else if (webhook.bodyType === 'form_data') {
                    const fd: Record<string, string> = {};
                    webhook.moduleParams.forEach((p: WebhookParam) => { fd[p.name] = p.field ? String(record[p.field] ?? '') : ''; });
                    webhook.customParams.forEach((p: WebhookParam) => { fd[p.name] = p.value ?? ''; });
                    bodyPayload = fd;
                }

                // 🔑 Use server-side proxy to avoid CORS
                const proxyRes = await fetch('/api/webhook-proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: finalUrl, method: webhook.method, body: bodyPayload }),
                });
                const result = await proxyRes.json();
                const duration = Date.now() - startTime;

                // Save execution log
                appendLog({
                    id: crypto.randomUUID(),
                    webhookId: webhook.id,
                    webhookName: webhook.name,
                    buttonName: btn.name,
                    timestamp: new Date().toISOString(),
                    status: result.ok ? 'success' : 'error',
                    statusCode: result.status,
                    duration,
                    error: result.error || (!result.ok ? `HTTP ${result.status} ${result.statusText}` : undefined),
                    recordId: record.id,
                    module,
                });

                if (result.ok) {
                    toast({ title: `✅ ${btn.name} — success (${result.status}) • ${duration}ms` });
                } else {
                    toast({ title: `❌ ${btn.name} — ${result.error || `HTTP ${result.status}`}`, variant: 'destructive' });
                }

            } else if (btn.actionType === 'function') {
                const fn = (window as any)[btn.actionValue];
                if (typeof fn === 'function') {
                    await fn(record);
                    toast({ title: `${btn.name} — executed` });
                } else {
                    toast({ title: `Function "${btn.actionValue}" not found`, variant: 'destructive' });
                }
            }
        } catch (err: any) {
            toast({ title: `❌ ${btn.name} — ${err.message}`, variant: 'destructive' });
        } finally {
            setLoading(p => ({ ...p, [btn.id]: false }));
        }
    };

    return (
        <div className={cn('flex flex-wrap gap-2 justify-end', className)}>
            {buttons.map(btn => (
                <Button
                    key={btn.id}
                    variant="outline"
                    disabled={loading[btn.id]}
                    onClick={() => handleClick(btn)}
                    className="gap-2"
                >
                    {loading[btn.id]
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : btn.actionType === 'webhook' ? <WebhookIcon className="h-4 w-4 text-purple-600" />
                            : btn.actionType === 'function' ? <Code2 className="h-4 w-4 text-blue-600" />
                                : <Globe className="h-4 w-4 text-green-600" />
                    }
                    {btn.name}
                </Button>
            ))}
        </div>
    );
}
