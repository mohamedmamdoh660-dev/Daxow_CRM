'use client';

import { useState, useId } from 'react';
import {
    Filter,
    SlidersHorizontal,
    Plus,
    X,
    ChevronDown,
    Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'select' | 'date' | 'number' | 'boolean';

export interface SmartFilterOption {
    id: string;
    label: string;
    value: string;
}

export interface SmartFilterField {
    /** API query param key, e.g. 'status', 'agentId', 'createdAt' */
    key: string;
    /** Display label shown in the panel */
    label: string;
    type: FieldType;
    /** Required for type === 'select' */
    options?: SmartFilterOption[];
}

export interface AppliedFilter {
    /** Unique per-row id so we can have multiple filters on same field */
    id: string;
    fieldKey: string;
    fieldLabel: string;
    fieldType: FieldType;
    operator: string;
    value: string;
    valueTo?: string; // for "between" ranges
    options?: SmartFilterOption[]; // carried over from field def
}

// ─── Operators per type ───────────────────────────────────────────────────────

const OPERATORS: Record<FieldType, { value: string; label: string }[]> = {
    text: [
        { value: 'contains', label: 'contains' },
        { value: 'not_contains', label: 'does not contain' },
        { value: 'equals', label: 'equals' },
        { value: 'not_equals', label: 'not equals' },
        { value: 'starts_with', label: 'starts with' },
        { value: 'ends_with', label: 'ends with' },
        { value: 'is_empty', label: 'is empty' },
        { value: 'is_not_empty', label: 'is not empty' },
    ],
    select: [
        { value: 'is', label: 'is' },
        { value: 'is_not', label: 'is not' },
        { value: 'is_empty', label: 'is empty' },
        { value: 'is_not_empty', label: 'is not empty' },
    ],
    date: [
        { value: 'is', label: 'is' },
        { value: 'is_before', label: 'is before' },
        { value: 'is_after', label: 'is after' },
        { value: 'is_between', label: 'is between' },
        { value: 'this_week', label: 'this week' },
        { value: 'this_month', label: 'this month' },
        { value: 'last_7_days', label: 'last 7 days' },
        { value: 'last_30_days', label: 'last 30 days' },
        { value: 'is_empty', label: 'is empty' },
    ],
    number: [
        { value: 'eq', label: '= equals' },
        { value: 'neq', label: '≠ not equals' },
        { value: 'gt', label: '> greater than' },
        { value: 'gte', label: '≥ greater than or equal' },
        { value: 'lt', label: '< less than' },
        { value: 'lte', label: '≤ less than or equal' },
        { value: 'between', label: 'between' },
        { value: 'is_empty', label: 'is empty' },
    ],
    boolean: [
        { value: 'is_true', label: 'is true' },
        { value: 'is_false', label: 'is false' },
    ],
};

/** Operators that don't need a value input */
const NO_VALUE_OPERATORS = new Set([
    'is_empty', 'is_not_empty', 'this_week',
    'this_month', 'last_7_days', 'last_30_days',
    'is_true', 'is_false',
]);

const DEFAULT_OPERATOR: Record<FieldType, string> = {
    text: 'contains',
    select: 'is',
    date: 'is',
    number: 'eq',
    boolean: 'is_true',
};

/** Uses "between" or similar dual-value operators */
const DUAL_VALUE_OPERATORS = new Set(['is_between', 'between']);

// ─── ValueInput ───────────────────────────────────────────────────────────────

function ValueInput({
    filter,
    onChange,
}: {
    filter: AppliedFilter;
    onChange: (id: string, patch: Partial<AppliedFilter>) => void;
}) {
    if (NO_VALUE_OPERATORS.has(filter.operator)) return null;

    const isDual = DUAL_VALUE_OPERATORS.has(filter.operator);

    if (filter.fieldType === 'select' && filter.options && filter.options.length > 0) {
        return (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Select
                    value={filter.value}
                    onValueChange={(v) => onChange(filter.id, { value: v })}
                >
                    <SelectTrigger className="h-8 text-xs flex-1 min-w-0">
                        <SelectValue placeholder="Select value..." />
                    </SelectTrigger>
                    <SelectContent>
                        {filter.options.map((opt) => (
                            <SelectItem key={opt.id} value={opt.value} className="text-xs">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    if (filter.fieldType === 'date') {
        return (
            <div className="flex items-center gap-1 flex-1 min-w-0">
                <div className="relative flex-1 min-w-0">
                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                    <Input
                        type="date"
                        value={filter.value}
                        onChange={(e) => onChange(filter.id, { value: e.target.value })}
                        className="h-8 text-xs pl-6 flex-1"
                    />
                </div>
                {isDual && (
                    <>
                        <span className="text-xs text-muted-foreground shrink-0">and</span>
                        <div className="relative flex-1 min-w-0">
                            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                            <Input
                                type="date"
                                value={filter.valueTo || ''}
                                onChange={(e) => onChange(filter.id, { valueTo: e.target.value })}
                                className="h-8 text-xs pl-6 flex-1"
                            />
                        </div>
                    </>
                )}
            </div>
        );
    }

    if (filter.fieldType === 'number') {
        return (
            <div className="flex items-center gap-1 flex-1 min-w-0">
                <Input
                    type="number"
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) => onChange(filter.id, { value: e.target.value })}
                    className="h-8 text-xs flex-1 min-w-0"
                />
                {isDual && (
                    <>
                        <span className="text-xs text-muted-foreground shrink-0">and</span>
                        <Input
                            type="number"
                            placeholder="To"
                            value={filter.valueTo || ''}
                            onChange={(e) => onChange(filter.id, { valueTo: e.target.value })}
                            className="h-8 text-xs flex-1 min-w-0"
                        />
                    </>
                )}
            </div>
        );
    }

    // text fallback
    return (
        <Input
            placeholder="Value..."
            value={filter.value}
            onChange={(e) => onChange(filter.id, { value: e.target.value })}
            className="h-8 text-xs flex-1 min-w-0"
        />
    );
}

// ─── FilterRow ────────────────────────────────────────────────────────────────

function FilterRow({
    filter,
    fields,
    onChange,
    onRemove,
}: {
    filter: AppliedFilter;
    fields: SmartFilterField[];
    onChange: (id: string, patch: Partial<AppliedFilter>) => void;
    onRemove: (id: string) => void;
}) {
    const operators = OPERATORS[filter.fieldType] || OPERATORS.text;

    const handleFieldChange = (fieldKey: string) => {
        const field = fields.find((f) => f.key === fieldKey);
        if (!field) return;
        onChange(filter.id, {
            fieldKey: field.key,
            fieldLabel: field.label,
            fieldType: field.type,
            operator: DEFAULT_OPERATOR[field.type],
            value: '',
            valueTo: undefined,
            options: field.options,
        });
    };

    const handleOperatorChange = (op: string) => {
        onChange(filter.id, {
            operator: op,
            value: '',
            valueTo: undefined,
        });
    };

    return (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/30 rounded-lg border border-border/60 group">
            {/* Field Selector */}
            <Select value={filter.fieldKey} onValueChange={handleFieldChange}>
                <SelectTrigger className="h-8 text-xs w-[130px] shrink-0 bg-background">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {fields.map((f) => (
                        <SelectItem key={f.key} value={f.key} className="text-xs">
                            {f.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Operator Selector */}
            <Select value={filter.operator} onValueChange={handleOperatorChange}>
                <SelectTrigger className="h-8 text-xs w-[150px] shrink-0 bg-background">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value} className="text-xs">
                            {op.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Value Input */}
            <div className="flex-1 min-w-0">
                <ValueInput filter={filter} onChange={onChange} />
            </div>

            {/* Remove */}
            <button
                onClick={() => onRemove(filter.id)}
                className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

// ─── SmartFilterPanel ─────────────────────────────────────────────────────────

interface SmartFilterPanelProps {
    fields: SmartFilterField[];
    appliedFilters: AppliedFilter[];
    onFiltersChange: (filters: AppliedFilter[]) => void;
    className?: string;
}

let _idCounter = 0;
function genId() {
    return `filter-${++_idCounter}-${Date.now()}`;
}

export function SmartFilterPanel({
    fields,
    appliedFilters,
    onFiltersChange,
    className,
}: SmartFilterPanelProps) {
    const addFilter = () => {
        if (fields.length === 0) return;
        const field = fields[0];
        const newFilter: AppliedFilter = {
            id: genId(),
            fieldKey: field.key,
            fieldLabel: field.label,
            fieldType: field.type,
            operator: DEFAULT_OPERATOR[field.type],
            value: '',
            options: field.options,
        };
        onFiltersChange([...appliedFilters, newFilter]);
    };

    const updateFilter = (id: string, patch: Partial<AppliedFilter>) => {
        onFiltersChange(
            appliedFilters.map((f) => (f.id === id ? { ...f, ...patch } : f))
        );
    };

    const removeFilter = (id: string) => {
        onFiltersChange(appliedFilters.filter((f) => f.id !== id));
    };

    return (
        <div className={cn('flex flex-col h-full bg-background border-r border-border', className)}>
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Filter By</span>
                {appliedFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                        {appliedFilters.length}
                    </Badge>
                )}
            </div>

            {/* Filter Rows */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {appliedFilters.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                        <SlidersHorizontal className="h-8 w-8 mb-2 opacity-30" />
                        <p className="text-sm font-medium">No filters applied</p>
                        <p className="text-xs mt-1">Click "+ Add Filter" to start</p>
                    </div>
                )}
                {appliedFilters.map((filter) => (
                    <FilterRow
                        key={filter.id}
                        filter={filter}
                        fields={fields}
                        onChange={updateFilter}
                        onRemove={removeFilter}
                    />
                ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/20 space-y-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={addFilter}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Filter
                </Button>
                {appliedFilters.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => onFiltersChange([])}
                    >
                        Clear All Filters
                    </Button>
                )}
            </div>
        </div>
    );
}

// ─── FilterToggleButton ───────────────────────────────────────────────────────

interface FilterToggleButtonProps {
    activeCount: number;
    onClick: () => void;
    isOpen: boolean;
}

export function SmartFilterToggleButton({ activeCount, onClick, isOpen }: FilterToggleButtonProps) {
    return (
        <Button
            variant={isOpen ? 'default' : 'outline'}
            size="sm"
            onClick={onClick}
            className="relative gap-2"
        >
            <Filter className="h-4 w-4" />
            Filter
            {activeCount > 0 && (
                <Badge
                    variant="secondary"
                    className={cn(
                        'h-5 px-1.5 text-xs',
                        isOpen && 'bg-primary-foreground text-primary'
                    )}
                >
                    {activeCount}
                </Badge>
            )}
        </Button>
    );
}

// ─── ActiveFilterChips ────────────────────────────────────────────────────────

interface ActiveFilterChipsProps {
    appliedFilters: AppliedFilter[];
    onRemove: (id: string) => void;
    onClearAll: () => void;
}

export function SmartActiveFilterChips({
    appliedFilters,
    onRemove,
    onClearAll,
}: ActiveFilterChipsProps) {
    if (appliedFilters.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 px-1 py-1">
            <span className="text-xs text-muted-foreground font-medium">Active Filters:</span>
            {appliedFilters.map((f) => {
                const operators = OPERATORS[f.fieldType] || [];
                const opLabel = operators.find((o) => o.value === f.operator)?.label ?? f.operator;
                let chipLabel = `${f.fieldLabel} ${opLabel}`;
                if (!NO_VALUE_OPERATORS.has(f.operator)) {
                    // resolve option label for select fields
                    const optLabel = f.options?.find((o) => o.value === f.value)?.label ?? f.value;
                    chipLabel += ` "${optLabel}"`;
                    if (f.valueTo && DUAL_VALUE_OPERATORS.has(f.operator)) {
                        chipLabel += ` → "${f.valueTo}"`;
                    }
                }

                return (
                    <Badge
                        key={f.id}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1 text-xs max-w-xs"
                    >
                        <span className="truncate">{chipLabel}</span>
                        <button
                            className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 shrink-0"
                            onClick={() => onRemove(f.id)}
                        >
                            <X className="h-2.5 w-2.5" />
                        </button>
                    </Badge>
                );
            })}
            <Button
                variant="ghost"
                size="sm"
                className="h-5 text-xs px-2 text-muted-foreground hover:text-destructive"
                onClick={onClearAll}
            >
                Clear All
            </Button>
        </div>
    );
}

// ─── buildQueryParams helper ──────────────────────────────────────────────────

/**
 * Converts AppliedFilter[] into URLSearchParams entries.
 * Format: field__operator=value
 * Example: status__is=Active    createdAt__is_after=2025-01-01
 */
export function buildSmartFilterParams(
    params: URLSearchParams,
    filters: AppliedFilter[]
): void {
    for (const f of filters) {
        if (NO_VALUE_OPERATORS.has(f.operator)) {
            // No value needed — just send the operator as flag
            params.set(`${f.fieldKey}__${f.operator}`, 'true');
            continue;
        }
        if (!f.value && !f.valueTo) continue;

        if (DUAL_VALUE_OPERATORS.has(f.operator) && f.value && f.valueTo) {
            params.set(`${f.fieldKey}__${f.operator}`, `${f.value},${f.valueTo}`);
        } else if (f.value) {
            params.set(`${f.fieldKey}__${f.operator}`, f.value);
        }
    }
}
