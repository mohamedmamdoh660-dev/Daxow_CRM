// ─────────────────────────────────────────────────────────────────────────────
// Shared types for the Module Buttons & Webhooks system
// ─────────────────────────────────────────────────────────────────────────────

export type ActionType = 'webhook' | 'function' | 'url';
export type PageType = 'in_record' | 'list_view' | 'both';
export type PositionType = 'details' | 'header' | 'both';
export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
export type BodyType = 'none' | 'json' | 'form_data' | 'raw';

// ── Module Fields (used in webhook parameters) ────────────────────────────────
export const MODULE_FIELDS: Record<string, { key: string; label: string }[]> = {
    'Students': [
        { key: 'id', label: 'ID' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created At' },
    ],
    'Leads': [
        { key: 'id', label: 'ID' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'status', label: 'Status' },
        { key: 'source', label: 'Source' },
        { key: 'createdAt', label: 'Created At' },
    ],
    'Applications': [
        { key: 'id', label: 'ID' },
        { key: 'status', label: 'Status' },
        { key: 'studentId', label: 'Student ID' },
        { key: 'programId', label: 'Program ID' },
        { key: 'createdAt', label: 'Created At' },
    ],
    'Agents': [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'status', label: 'Status' },
    ],
};

// ── Webhook ───────────────────────────────────────────────────────────────────
export interface WebhookParam {
    id: string;
    name: string;           // parameter name sent to webhook
    module?: string;        // for module params: which module
    field?: string;         // for module params: which field
    value?: string;         // for custom params: static value
    type: 'module' | 'custom';
}

export interface Webhook {
    id: string;
    name: string;
    description?: string;
    method: HttpMethod;
    url: string;
    module: string;         // which CRM module this belongs to
    bodyType: BodyType;
    bodyContent?: string;   // raw JSON body template
    moduleParams: WebhookParam[];
    customParams: WebhookParam[];
    createdAt: string;
    updatedAt: string;
}

// ── Custom Button ─────────────────────────────────────────────────────────────
export interface CustomButton {
    id: string;
    name: string;
    description?: string;
    actionType: ActionType;
    actionValue: string;    // webhookId / function name / URL
    page: PageType;
    position: PositionType;
    isActive: boolean;
    roles: string[];        // ['all'] or specific role names
    createdAt: string;
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const BUTTONS_KEY = 'crm_module_buttons';
const WEBHOOKS_KEY = 'crm_webhooks';

export function loadButtons(): Record<string, CustomButton[]> {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(BUTTONS_KEY) || '{}'); } catch { return {}; }
}
export function saveButtons(data: Record<string, CustomButton[]>) {
    localStorage.setItem(BUTTONS_KEY, JSON.stringify(data));
}

export function loadWebhooks(): Webhook[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(WEBHOOKS_KEY) || '[]'); } catch { return []; }
}
export function saveWebhooks(data: Webhook[]) {
    localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(data));
}
