import { Prisma } from '@prisma/client';

/**
 * Parse query params that follow the `field__operator=value` pattern
 * and convert them into a Prisma `where` clause condition object.
 *
 * Supported operators:
 *   Text:       contains | not_contains | equals | not_equals | starts_with | ends_with
 *   Select:     is | is_not
 *   Date:       is | is_before | is_after | is_between | this_week | this_month | last_7_days | last_30_days
 *   Number:     eq | neq | gt | gte | lt | lte | between
 *   Boolean:    is_true | is_false
 *   universal:  is_empty | is_not_empty
 *
 * Format in URL:
 *   name__contains=ahmed
 *   status__is=Active
 *   createdAt__is_after=2025-01-01
 *   fees__between=1000,5000
 *   isActive__is_true=true
 *
 * @param query  - Raw query string object from NestJS `@Query()` / Express `req.query`
 * @param allowedFields - Whitelist of field keys that can be filtered
 * @returns Prisma `where` conditions to spread into your existing where clause
 */
export function parseSmartFilters(
    query: Record<string, any>,
    allowedFields: string[],
): Record<string, any> {
    const conditions: Record<string, any> = {};

    for (const [key, raw] of Object.entries(query)) {
        // Only process keys that match pattern field__operator
        const separatorIdx = key.indexOf('__');
        if (separatorIdx === -1) continue;

        const fieldKey = key.substring(0, separatorIdx);
        const operator = key.substring(separatorIdx + 2);
        const value = typeof raw === 'string' ? raw.trim() : '';

        // Validate field is in whitelist
        if (!allowedFields.includes(fieldKey)) continue;
        if (!operator) continue;

        const condition = buildCondition(fieldKey, operator, value);
        if (condition !== null) {
            // Merge conditions for same field (AND semantics)
            if (conditions[fieldKey]) {
                conditions[fieldKey] = { ...conditions[fieldKey], ...condition[fieldKey] };
            } else {
                Object.assign(conditions, condition);
            }
        }
    }

    return conditions;
}

function buildCondition(
    field: string,
    operator: string,
    value: string,
): Record<string, any> | null {
    // ── Universal operators ───────────────────────────────────────────────────
    if (operator === 'is_empty') {
        return { [field]: null };
    }
    if (operator === 'is_not_empty') {
        return { [field]: { not: null } };
    }
    if (operator === 'is_true') {
        return { [field]: true };
    }
    if (operator === 'is_false') {
        return { [field]: false };
    }

    // ── No-value date operators ───────────────────────────────────────────────
    if (['this_week', 'this_month', 'last_7_days', 'last_30_days'].includes(operator)) {
        const now = new Date();
        let from: Date;
        if (operator === 'this_week') {
            const day = now.getDay();
            from = new Date(now);
            from.setDate(now.getDate() - day);
            from.setHours(0, 0, 0, 0);
        } else if (operator === 'this_month') {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (operator === 'last_7_days') {
            from = new Date(now);
            from.setDate(now.getDate() - 7);
        } else {
            from = new Date(now);
            from.setDate(now.getDate() - 30);
        }
        return { [field]: { gte: from } };
    }

    // ── Require a value after this point ─────────────────────────────────────
    if (!value) return null;

    // ── Text operators ────────────────────────────────────────────────────────
    if (operator === 'contains') {
        return { [field]: { contains: value, mode: Prisma.QueryMode.insensitive } };
    }
    if (operator === 'not_contains') {
        return { [field]: { not: { contains: value }, mode: Prisma.QueryMode.insensitive } };
    }
    if (operator === 'equals') {
        return { [field]: { equals: value, mode: Prisma.QueryMode.insensitive } };
    }
    if (operator === 'not_equals') {
        return { [field]: { not: { equals: value } } };
    }
    if (operator === 'starts_with') {
        return { [field]: { startsWith: value, mode: Prisma.QueryMode.insensitive } };
    }
    if (operator === 'ends_with') {
        return { [field]: { endsWith: value, mode: Prisma.QueryMode.insensitive } };
    }

    // ── Select operators ──────────────────────────────────────────────────────
    if (operator === 'is') {
        return { [field]: value };
    }
    if (operator === 'is_not') {
        return { [field]: { not: value } };
    }

    // ── Date operators ────────────────────────────────────────────────────────
    if (operator === 'is' || operator === 'date_is') {
        const d = parseDate(value);
        if (!d) return null;
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);
        return { [field]: { gte: d, lt: nextDay } };
    }
    if (operator === 'is_before') {
        const d = parseDate(value);
        return d ? { [field]: { lt: d } } : null;
    }
    if (operator === 'is_after') {
        const d = parseDate(value);
        return d ? { [field]: { gt: d } } : null;
    }
    if (operator === 'is_between') {
        const [from, to] = value.split(',').map((v) => parseDate(v.trim()));
        if (!from || !to) return null;
        return { [field]: { gte: from, lte: to } };
    }

    // ── Number operators ──────────────────────────────────────────────────────
    const num = parseFloat(value);
    if (!isNaN(num)) {
        if (operator === 'eq') return { [field]: num };
        if (operator === 'neq') return { [field]: { not: num } };
        if (operator === 'gt') return { [field]: { gt: num } };
        if (operator === 'gte') return { [field]: { gte: num } };
        if (operator === 'lt') return { [field]: { lt: num } };
        if (operator === 'lte') return { [field]: { lte: num } };
        if (operator === 'between') {
            const [from, to] = value.split(',').map(Number);
            if (!isNaN(from) && !isNaN(to)) {
                return { [field]: { gte: from, lte: to } };
            }
        }
    }

    return null;
}

function parseDate(value: string): Date | null {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
}
