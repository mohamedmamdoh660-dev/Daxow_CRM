'use client';

import { useState } from 'react';
import { Search, X, ChevronDown, ChevronRight, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FilterOption {
    id: string;
    label: string;
    value: string;
}

export interface FilterField {
    key: string;
    label: string;
    options: FilterOption[];
    type?: 'checkbox' | 'radio';
}

export interface SystemFilter {
    id: string;
    label: string;
    description?: string;
    filterKey: string;
    filterValue: string;
}

export interface ActiveFilter {
    fieldKey: string;
    fieldLabel: string;
    value: string;
    label: string;
}

interface FilterPanelProps {
    fields: FilterField[];
    systemFilters?: SystemFilter[];
    activeFilters: Record<string, string[]>;
    onFiltersChange: (filters: Record<string, string[]>) => void;
    className?: string;
}

function FilterSection({
    title,
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-border last:border-0">
            <button
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setOpen(!open)}
            >
                <span>{title}</span>
                {open ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
            </button>
            {open && <div className="pb-2">{children}</div>}
        </div>
    );
}

export function FilterPanel({
    fields,
    systemFilters = [],
    activeFilters,
    onFiltersChange,
    className,
}: FilterPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFilter = (fieldKey: string, value: string) => {
        const current = activeFilters[fieldKey] || [];
        let updated: string[];
        if (current.includes(value)) {
            updated = current.filter((v) => v !== value);
        } else {
            updated = [...current, value];
        }
        const newFilters = { ...activeFilters };
        if (updated.length === 0) {
            delete newFilters[fieldKey];
        } else {
            newFilters[fieldKey] = updated;
        }
        onFiltersChange(newFilters);
    };

    const toggleSystemFilter = (sf: SystemFilter) => {
        const current = activeFilters[sf.filterKey] || [];
        if (current.includes(sf.filterValue)) {
            const updated = current.filter((v) => v !== sf.filterValue);
            const newFilters = { ...activeFilters };
            if (updated.length === 0) {
                delete newFilters[sf.filterKey];
            } else {
                newFilters[sf.filterKey] = updated;
            }
            onFiltersChange(newFilters);
        } else {
            onFiltersChange({
                ...activeFilters,
                [sf.filterKey]: [...current, sf.filterValue],
            });
        }
    };

    const isSystemFilterActive = (sf: SystemFilter) => {
        const current = activeFilters[sf.filterKey] || [];
        return current.includes(sf.filterValue);
    };

    const filteredFields = fields.filter((field) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            field.label.toLowerCase().includes(q) ||
            field.options.some((opt) => opt.label.toLowerCase().includes(q))
        );
    });

    return (
        <div className={cn('flex flex-col h-full bg-background border-r border-border', className)}>
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Filter By</span>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search filters..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                    {searchQuery && (
                        <button
                            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSearchQuery('')}
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Filter List */}
            <div className="flex-1 overflow-y-auto">
                {/* System Filters */}
                {systemFilters.length > 0 && !searchQuery && (
                    <FilterSection title="System Defined Filters">
                        <div className="space-y-0.5">
                            {systemFilters.map((sf) => (
                                <label
                                    key={sf.id}
                                    className="flex items-start gap-2.5 px-4 py-2 cursor-pointer hover:bg-muted/50 rounded-sm transition-colors"
                                >
                                    <Checkbox
                                        checked={isSystemFilterActive(sf)}
                                        onCheckedChange={() => toggleSystemFilter(sf)}
                                        className="mt-0.5"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm text-foreground">{sf.label}</span>
                                        {sf.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {sf.description}
                                            </span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </FilterSection>
                )}

                {/* Field Filters */}
                {filteredFields.length > 0 && (
                    <FilterSection title="Filter By Fields">
                        <div className="space-y-0">
                            {filteredFields.map((field) => (
                                <FieldSection
                                    key={field.key}
                                    field={field}
                                    activeValues={activeFilters[field.key] || []}
                                    onToggle={(value) => toggleFilter(field.key, value)}
                                    searchQuery={searchQuery}
                                />
                            ))}
                        </div>
                    </FilterSection>
                )}

                {filteredFields.length === 0 && searchQuery && (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No filters match "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
}

function FieldSection({
    field,
    activeValues,
    onToggle,
    searchQuery,
}: {
    field: FilterField;
    activeValues: string[];
    onToggle: (value: string) => void;
    searchQuery: string;
}) {
    const [open, setOpen] = useState(false);
    const hasActive = activeValues.length > 0;

    const displayOptions = searchQuery
        ? field.options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : field.options;

    if (displayOptions.length === 0) return null;

    return (
        <div className="border-b border-border/50 last:border-0">
            <button
                className={cn(
                    'flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-muted/50 transition-colors',
                    hasActive && 'text-primary font-medium'
                )}
                onClick={() => setOpen(!open)}
            >
                <span className="flex items-center gap-1.5">
                    {field.label}
                    {hasActive && (
                        <Badge variant="secondary" className="h-4 text-xs px-1.5 py-0 leading-4">
                            {activeValues.length}
                        </Badge>
                    )}
                </span>
                {open ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
            </button>

            {(open || (searchQuery && displayOptions.length > 0)) && (
                <div className="pb-1">
                    {displayOptions.map((opt) => (
                        <label
                            key={opt.id}
                            className="flex items-center gap-2.5 px-6 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                            <Checkbox
                                checked={activeValues.includes(opt.value)}
                                onCheckedChange={() => onToggle(opt.value)}
                                id={`filter-${field.key}-${opt.id}`}
                            />
                            <span className="text-sm text-foreground select-none">{opt.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Filter Toggle Button ─────────────────────────────────────────────────────
interface FilterToggleButtonProps {
    activeCount: number;
    onClick: () => void;
    isOpen: boolean;
}

export function FilterToggleButton({ activeCount, onClick, isOpen }: FilterToggleButtonProps) {
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

// ─── Active Filter Chips ──────────────────────────────────────────────────────
interface ActiveFilterChipsProps {
    activeFilters: Record<string, string[]>;
    fields: FilterField[];
    systemFilters?: SystemFilter[];
    onRemove: (fieldKey: string, value: string) => void;
    onClearAll: () => void;
}

export function ActiveFilterChips({
    activeFilters,
    fields,
    systemFilters = [],
    onRemove,
    onClearAll,
}: ActiveFilterChipsProps) {
    const chips: { fieldKey: string; fieldLabel: string; value: string; label: string }[] = [];

    // System filter chips
    for (const sf of systemFilters) {
        if ((activeFilters[sf.filterKey] || []).includes(sf.filterValue)) {
            chips.push({
                fieldKey: sf.filterKey,
                fieldLabel: '',
                value: sf.filterValue,
                label: sf.label,
            });
        }
    }

    // Field filter chips
    for (const field of fields) {
        const values = activeFilters[field.key] || [];
        for (const v of values) {
            const opt = field.options.find((o) => o.value === v);
            chips.push({
                fieldKey: field.key,
                fieldLabel: field.label,
                value: v,
                label: opt ? `${field.label}: ${opt.label}` : `${field.label}: ${v}`,
            });
        }
    }

    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 px-1 py-1">
            <span className="text-xs text-muted-foreground font-medium">Active Filters:</span>
            {chips.map((chip, i) => (
                <Badge
                    key={`${chip.fieldKey}-${chip.value}-${i}`}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 text-xs"
                >
                    {chip.label}
                    <button
                        className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        onClick={() => onRemove(chip.fieldKey, chip.value)}
                    >
                        <X className="h-2.5 w-2.5" />
                    </button>
                </Badge>
            ))}
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
