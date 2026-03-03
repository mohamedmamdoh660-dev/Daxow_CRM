'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Webhook as WebhookIcon, Code2, Globe } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { loadButtons, loadWebhooks, appendLog, type CustomButton, type Webhook, type WebhookParam, type PositionType, type PageType } from '@/lib/types/buttons-webhooks';
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

export function ModuleActionButtons({
    module,
    userRole = 'admin',
    record = {},
    position,
    page,
    className,
}: ModuleActionButtonsProps) {
    const [buttons, setButtons] = useState<CustomButton[]>([]);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const allButtons = loadButtons();
        const moduleButtons = (allButtons[module] || []).filter((b: CustomButton) => {
            if (!b.isActive) return false;
            if (b.page !== 'both' && b.page !== page) return false;
            if (b.position !== 'both' && b.position !== position) return false;
            if (b.roles.includes('all')) return true;
            if (!userRole) return false;
            return b.roles.includes(userRole);
        });
        setButtons(moduleButtons);
        setWebhooks(loadWebhooks());

        console.log('[ModuleActionButtons] module:', module, 'position:', position, 'page:', page);
        console.log('[ModuleActionButtons] buttons found:', moduleButtons.length, moduleButtons.map((b: CustomButton) => b.name));
    }, [module, userRole, position, page]);

    if (buttons.length === 0) return null;

    const interpolate = (str: string): string =>
        str.replace(/\{\{record\.(\w+)\}\}/g, (_, field) => String(record[field] ?? ''));

    const handleClick = async (btn: CustomButton) => {
        console.log('[ModuleActionButtons] Button clicked:', btn.name, 'actionType:', btn.actionType, 'actionValue:', btn.actionValue);
        setLoading(prev => ({ ...prev, [btn.id]: true }));
        const startTime = Date.now();

        try {
            // ── URL action ────────────────────────────────────────────────────
            if (btn.actionType === 'url') {
                const url = interpolate(btn.actionValue);
                window.open(url, '_blank');
                sonnerToast.success(`${btn.name}`, { description: 'Opening URL...' });
                return;
            }

            // ── Function action ───────────────────────────────────────────────
            if (btn.actionType === 'function') {
                const fn = (window as any)[btn.actionValue];
                if (typeof fn === 'function') {
                    await fn(record);
                    sonnerToast.success(`${btn.name}`, { description: 'Function executed' });
                } else {
                    sonnerToast.error(`Function not found`, { description: `"${btn.actionValue}" is not defined on window` });
                }
                return;
            }

            // ── Webhook action ────────────────────────────────────────────────
            const webhook = webhooks.find((w: Webhook) => w.id === btn.actionValue);
            console.log('[ModuleActionButtons] Looking for webhook id:', btn.actionValue);
            console.log('[ModuleActionButtons] Available webhooks:', webhooks.map((w: Webhook) => ({ id: w.id, name: w.name })));

            if (!webhook) {
                sonnerToast.error('Webhook not found', {
                    description: 'The webhook associated with this button no longer exists. Please reconfigure the button.',
                });
                return;
            }

            // Build query params
            const queryParams = new URLSearchParams();
            (webhook.moduleParams || []).forEach((p: WebhookParam) => {
                const val = p.field ? (record[p.field] ?? '') : '';
                queryParams.set(p.name, String(val));
            });
            (webhook.customParams || []).forEach((p: WebhookParam) => {
                queryParams.set(p.name, p.value ?? '');
            });
            const finalUrl = queryParams.toString() ? `${webhook.url}?${queryParams}` : webhook.url;
            console.log('[ModuleActionButtons] Final URL:', finalUrl, 'method:', webhook.method);

            // Build body
            let bodyPayload: any = { record, module };
            if (webhook.bodyType === 'json' && webhook.bodyContent) {
                try { bodyPayload = JSON.parse(interpolate(webhook.bodyContent)); }
                catch { bodyPayload = interpolate(webhook.bodyContent); }
            } else if (webhook.bodyType === 'form_data') {
                const fd: Record<string, string> = {};
                (webhook.moduleParams || []).forEach((p: WebhookParam) => {
                    fd[p.name] = p.field ? String(record[p.field] ?? '') : '';
                });
                (webhook.customParams || []).forEach((p: WebhookParam) => { fd[p.name] = p.value ?? ''; });
                bodyPayload = fd;
            }

            // 🔑 Use server-side proxy to avoid CORS
            const toastId = sonnerToast.loading(`${btn.name}`, { description: 'Sending request...' });

            const proxyRes = await fetch('/api/webhook-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: finalUrl,
                    method: webhook.method,
                    body: ['GET', 'HEAD'].includes(webhook.method) ? undefined : bodyPayload,
                }),
            });

            const result = await proxyRes.json();
            const duration = Date.now() - startTime;
            console.log('[ModuleActionButtons] Proxy result:', result);

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
                sonnerToast.success(`${btn.name} — Success`, {
                    id: toastId,
                    description: `HTTP ${result.status} • ${duration}ms`,
                });
            } else {
                sonnerToast.error(`${btn.name} — Failed`, {
                    id: toastId,
                    description: result.error || `HTTP ${result.status} ${result.statusText}`,
                });
            }

        } catch (err: any) {
            console.error('[ModuleActionButtons] Error:', err);
            sonnerToast.error(`${btn.name} — Error`, { description: err.message });
        } finally {
            setLoading(prev => ({ ...prev, [btn.id]: false }));
        }
    };

    return (
        <div className={cn('flex flex-wrap gap-2 justify-end', className)}>
            {buttons.map(btn => (
                <Button
                    key={btn.id}
                    variant="outline"
                    disabled={!!loading[btn.id]}
                    onClick={() => handleClick(btn)}
                    className="gap-2"
                    type="button"
                >
                    {loading[btn.id]
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : btn.actionType === 'webhook'
                            ? <WebhookIcon className="h-4 w-4 text-purple-600" />
                            : btn.actionType === 'function'
                                ? <Code2 className="h-4 w-4 text-blue-600" />
                                : <Globe className="h-4 w-4 text-green-600" />
                    }
                    {btn.name}
                </Button>
            ))}
        </div>
    );
}
