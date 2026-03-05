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
        { key: 'nationalityName', label: 'Nationality' },   // API returns nationalityName (resolved string)
        { key: 'status', label: 'Status' },
        { key: 'gender', label: 'Gender' },
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
        { key: 'stage', label: 'Stage' },
        { key: 'studentId', label: 'Student ID' },
        { key: 'programId', label: 'Program ID' },
        { key: 'createdAt', label: 'Created At' },
    ],
    'Agents': [
        { key: 'id', label: 'ID' },
        { key: 'companyName', label: 'Company Name' },
        { key: 'contactPerson', label: 'Contact Person' },
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

// ── Button Condition ──────────────────────────────────────────────────────────
export type ConditionOperator = 'is' | 'is_not' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty';
export type ConditionLogic = 'and' | 'or';

/** A single condition row: field + operator + value */
export interface ButtonConditionRule {
    field: string;
    operator: ConditionOperator;
    value?: string;
}

/** Multiple rules combined with AND or OR */
export interface ButtonCondition {
    logic: ConditionLogic;      // 'and' | 'or'
    rules: ButtonConditionRule[];
}

export const CONDITION_OPERATORS: { value: ConditionOperator; label: string }[] = [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
];

/** Migrate old single-field condition to new rules format if needed */
export function normalizeCondition(condition: any): ButtonCondition | undefined {
    if (!condition) return undefined;
    // Already new format
    if (condition.rules && Array.isArray(condition.rules)) return condition as ButtonCondition;
    // Old format: { field, operator, value }
    if (condition.field) {
        return { logic: 'and', rules: [{ field: condition.field, operator: condition.operator, value: condition.value }] };
    }
    return undefined;
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
    condition?: ButtonCondition; // optional show condition
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

// ── Webhook Execution Log ─────────────────────────────────────────────────────
export interface WebhookLog {
    id: string;
    webhookId: string;
    webhookName: string;
    buttonName: string;
    timestamp: string;
    status: 'success' | 'error';
    statusCode?: number;
    duration: number;       // milliseconds
    error?: string;
    recordId?: string;
    module: string;
}

const LOGS_KEY = 'crm_webhook_logs';
const MAX_LOGS = 500;       // keep last 500 entries

export function loadLogs(): WebhookLog[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]'); } catch { return []; }
}
export function appendLog(log: WebhookLog) {
    const existing = loadLogs();
    const updated = [log, ...existing].slice(0, MAX_LOGS);
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
}
export function clearLogsForWebhook(webhookId: string) {
    const existing = loadLogs();
    localStorage.setItem(LOGS_KEY, JSON.stringify(existing.filter(l => l.webhookId !== webhookId)));
}

