# Module Configuration System

> **File:** `lib/config/modules.ts`  
> **Last Updated:** March 4, 2026

---

## Overview

All CRM modules are defined in a **single configuration file**: `lib/config/modules.ts`.

This file is the **only place** you need to edit when adding a new module. Both the sidebar navigation and the roles permission matrix derive their data from this config automatically.

---

## How It Works

```
lib/config/modules.ts
        ↓            ↓
sidebar.tsx    roles/page.tsx
(navigation)   (permission matrix)
```

---

## Adding a New Module

### Step 1 — Add entry to `lib/config/modules.ts`

```typescript
import { MyIcon } from 'lucide-react';

export const NAV_ITEMS: NavItem[] = [
  // ... existing items ...

  // New module:
  { 
    permissionModule: 'My Module',    // Must match backend @RequirePermissions name
    label: 'My Module',              // Display name in sidebar & roles table
    href: '/my-module',              // Route path
    icon: MyIcon,                    // Lucide icon
    ownerBased: false,               // true if records have owners (View Own/View All)
  },
];
```

### Step 2 — Add backend controller with `@RequirePermissions`

```typescript
// crm-backend/src/modules/my-module/my-module.controller.ts

@Get()
@RequirePermissions(
  { module: 'My Module', action: 'view' },
  { module: 'My Module', action: 'view_all' },
  { module: 'My Module', action: 'menu_access' }   // for non-owner modules
)
findAll() { ... }
```

### Step 3 — Done ✅

The module automatically appears in:
- ✅ Sidebar (when user has `menu_access`)
- ✅ Roles matrix (for permission assignment)
- ✅ No other file changes needed

---

## `NavItem` Interface

```typescript
interface NavItem {
  /** Backend permission module key — must match @RequirePermissions module name */
  permissionModule: string;

  /** Display label in sidebar and roles table */
  label: string;

  /** Route href */
  href: string;

  /** Lucide icon component */
  icon: LucideIcon;

  /**
   * true  = shows View Own / View All columns in roles matrix
   * false = hides those columns, auto-grants view with menu_access
   */
  ownerBased: boolean;
}
```

---

## Sub-Modules (Shared Permission)

Some pages share their parent module's permission key. Example:

```typescript
{ permissionModule: 'Academic Years', label: 'Academic Years', href: '/academic-years', ... },
{ permissionModule: 'Academic Years', label: 'Semesters',      href: '/semesters',      ... },
// Both Academic Years AND Semesters show/hide together based on 'Academic Years' permission
```

Current sub-module groupings:

| Permission Key | Pages |
|---------------|-------|
| `Academic Years` | Academic Years, Semesters |
| `Programs` | Programs, Degrees |
| `Faculties` | Faculties, Specialties |
| `Countries & Cities` | Countries, Cities |
| `Languages & Titles` | Languages, Titles |

---

## Derived Exports

The config automatically exports two derived lists used by the roles page:

```typescript
// All unique permission module keys (used in roles matrix)
export const PERMISSION_MODULES = [...new Set(NAV_ITEMS.map(i => i.permissionModule))];

// Modules where ownerBased = true (show View Own / View All)
export const OWNER_BASED_MODULES = [...new Set(
  NAV_ITEMS.filter(i => i.ownerBased).map(i => i.permissionModule)
)];
```

---

## Current Modules

| Permission Module | Label(s) | Owner-Based |
|-----------------|----------|-------------|
| Dashboard | Dashboard | ❌ |
| Leads | Leads | ✅ |
| Students | Students | ✅ |
| Applications | Applications | ✅ |
| Academic Years | Academic Years, Semesters | ❌ |
| Programs | Programs, Degrees | ❌ |
| Faculties | Faculties, Specialties | ❌ |
| Countries & Cities | Countries, Cities | ❌ |
| Languages & Titles | Languages, Titles | ❌ |
| Agents | Agents | ❌ |
| User Management | Users | ❌ |
| Roles & Permissions | Roles | ❌ |
| Settings | Settings | ❌ |
| Profile | Profile | ❌ |
