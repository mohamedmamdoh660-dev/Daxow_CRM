# Smart Filter System

> **Status:** ✅ Implemented  
> **Last Updated:** March 4, 2026  
> **Available on:** Students Page, Applications Page

---

## Overview

The Smart Filter system allows users to build complex, multi-condition queries on any module's data. It supports type-aware operators (text, number, date, boolean, select) and works seamlessly with the backend API.

---

## Features

- ➕ Add multiple filter rows
- 🔄 Each row has: **Field → Operator → Value**
- 🧠 Operators change dynamically based on field type
- 🗑️ Remove individual filter rows
- 🔄 Reset all filters
- 📦 Filters applied via URL query params → API query

---

## Filter Panel UI

The filter panel slides in from the right side (Sheet component).

```tsx
import { FilterPanel } from '@/components/filters/filter-panel';

<FilterPanel
  fields={STUDENT_FILTER_FIELDS}
  onApply={(filters) => setFilters(filters)}
  onReset={() => setFilters([])}
/>
```

---

## Filter Field Definition

```typescript
interface FilterField {
  key: string;           // API query param key
  label: string;         // Display label
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: { value: string; label: string }[];  // For 'select' type
}
```

### Example: Students Filter Fields

```typescript
const STUDENT_FILTER_FIELDS: FilterField[] = [
  { key: 'search',    label: 'Name / Email',  type: 'text'    },
  { key: 'status',    label: 'Status',        type: 'select',
    options: [
      { value: 'active',   label: 'Active'   },
      { value: 'inactive', label: 'Inactive' },
    ]
  },
  { key: 'createdAt', label: 'Created At',    type: 'date'    },
  { key: 'agentId',   label: 'Agent',         type: 'select', options: [...] },
];
```

---

## Operators by Field Type

| Type | Available Operators |
|------|---------------------|
| `text` | contains, does not contain, equals, starts with, ends with, is empty, is not empty |
| `number` | equals, not equals, greater than, less than, between |
| `date` | is, is before, is after, is between, is empty |
| `boolean` | is true, is false |
| `select` | is, is not, is empty |

---

## How Filters Apply to API

Each active filter row becomes a query parameter:

```
GET /api/students?search=john&status=active&createdAt_from=2026-01-01
```

The backend parses these and builds the Prisma `where` clause dynamically.

---

## Files

| File | Purpose |
|------|---------|
| `components/filters/filter-panel.tsx` | Main filter sheet UI |
| `components/filters/filter-row.tsx` | Single filter row (field + operator + value) |
| `lib/config/filter-fields.ts` | Field definitions per module |
| `app/(dashboard)/students/page.tsx` | Students implementation |
| `app/(dashboard)/applications/page.tsx` | Applications implementation |
