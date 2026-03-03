'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Webhook as WebhookIcon, Code2, Globe } from 'lucide-react';
import { loadButtons, loadWebhooks, type CustomButton, type Webhook, type WebhookParam, type PositionType, type PageType } from '@/lib/types/buttons-webhooks';
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
        try {
            if (btn.actionType === 'url') {
                const url = interpolate(btn.actionValue);
                window.open(url, '_blank');
                toast({ title: `${btn.name} — navigating...` });

            } else if (btn.actionType === 'webhook') {
                // Find webhook config
                const webhook = webhooks.find(w => w.id === btn.actionValue);
                if (!webhook) {
                    toast({ title: 'Webhook not configured', variant: 'destructive' });
                    return;
                }

                // Build URL with params
                let url = webhook.url;
                const queryParams = new URLSearchParams();

                // Module params → resolve field values from record
                webhook.moduleParams.forEach((p: WebhookParam) => {
                    const val = p.field ? (record[p.field] ?? '') : '';
                    queryParams.set(p.name, String(val));
                });

                // Custom params → static values
                webhook.customParams.forEach((p: WebhookParam) => {
                    queryParams.set(p.name, p.value ?? '');
                });

                // Body
                let body: string | undefined;
                let headers: Record<string, string> = { 'Content-Type': 'application/json' };

                if (webhook.bodyType === 'json') {
                    body = webhook.bodyContent ? interpolate(webhook.bodyContent) : JSON.stringify({ record });
                    headers['Content-Type'] = 'application/json';
                } else if (webhook.bodyType === 'form_data') {
                    const formData = new URLSearchParams();
                    webhook.moduleParams.forEach((p: WebhookParam) => {
                        const val = p.field ? (record[p.field] ?? '') : '';
                        formData.append(p.name, String(val));
                    });
                    webhook.customParams.forEach((p: WebhookParam) => formData.append(p.name, p.value ?? ''));
                    body = formData.toString();
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }

                if (queryParams.toString()) url += '?' + queryParams.toString();

                const res = await fetch(url, {
                    method: webhook.method,
                    headers,
                    body: ['GET', 'DELETE'].includes(webhook.method) ? undefined : (body || JSON.stringify({ record })),
                });

                if (res.ok) {
                    toast({ title: `${btn.name} — executed successfully ✅` });
                } else {
                    toast({ title: `${btn.name} — server returned ${res.status}`, variant: 'destructive' });
                }

            } else if (btn.actionType === 'function') {
                // Function: call the named function on window if available
                const fn = (window as any)[btn.actionValue];
                if (typeof fn === 'function') {
                    await fn(record);
                    toast({ title: `${btn.name} — executed` });
                } else {
                    toast({ title: `Function "${btn.actionValue}" not found`, variant: 'destructive' });
                }
            }
        } catch (err: any) {
            toast({ title: `${btn.name} — Error: ${err.message}`, variant: 'destructive' });
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
