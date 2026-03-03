# Permissions & RBAC System

> **Status:** ✅ Fully Implemented  
> **Last Updated:** March 4, 2026

---

## Overview

The Admission CRM uses a **Role-Based Access Control (RBAC)** system. Every user belongs to one or more **roles** (groups). Each role has a set of granular **permissions** per module.

Permissions are enforced at **three layers**:
1. **Backend** — NestJS `PermissionsGuard` + `@RequirePermissions` decorator
2. **Frontend UI** — Buttons/links hidden using `usePermissions` hook
3. **Sidebar** — Navigation items hidden if no `menu_access` permission

---

## Permission Actions

| Action | Key | Description |
|--------|-----|-------------|
| Menu | `menu_access` | Show the module link in the sidebar |
| View Own | `view` | See only records owned by the user |
| View All | `view_all` | See all records regardless of owner |
| Add | `add` | Create new records |
| Edit | `edit` | Update existing records |
| Delete | `delete` | Remove records |
| Export | `export` | Export data to CSV/Excel |
| Import | `import` | Import data from file |

---

## Module Groups

Modules are grouped by their **backend permission key**. Sub-modules share the parent's key:

| Permission Module (backend key) | Pages / Sub-modules |
|--------------------------------|---------------------|
| `Dashboard` | Dashboard |
| `Leads` | Leads (owner-based ✓) |
| `Students` | Students (owner-based ✓) |
| `Applications` | Applications (owner-based ✓) |
| `Academic Years` | Academic Years, Semesters |
| `Programs` | Programs, Degrees |
| `Faculties` | Faculties, Specialties |
| `Countries & Cities` | Countries, Cities |
| `Languages & Titles` | Languages, Titles |
| `Agents` | Agents |
| `User Management` | Users |
| `Roles & Permissions` | Roles |
| `Settings` | Settings |
| `Profile` | Profile |

> **Owner-based modules** support **View Own** and **View All** separately.  
> **Non-owner modules** automatically get `view` when `menu_access` is granted.

---

## Frontend: `usePermissions` Hook

**File:** `lib/hooks/use-permissions.ts`

```typescript
const { canAdd, canEdit, canDelete, canView, canViewAll } = usePermissions('Students');

// Guard UI elements:
{canAdd && <Button>Add Student</Button>}
{canEdit && <Button>Edit</Button>}
{canDelete && <Button>Delete</Button>}
```

- **Admin users** automatically get all permissions for all modules.
- Reads from `localStorage.userMeta.permissions` (set on login).

---

## Frontend: Sidebar Visibility

**File:** `components/layout/sidebar.tsx`

The sidebar reads `menu_access` from stored permissions. If a user has no `menu_access` for a module, the link is hidden — even if they navigate directly to the URL, the backend will block them.

```
module has menu_access → link visible in sidebar
module missing menu_access → link hidden
```

Special modules (`Dashboard`, `Settings`, `Profile`) show if the user has **any** permission for them.

---

## Backend: `@RequirePermissions` Decorator

**File:** `crm-backend/src/common/decorators/permissions.decorator.ts`

```typescript
// Any one of these conditions being true = access granted
@RequirePermissions(
  { module: 'Students', action: 'view' },
  { module: 'Students', action: 'view_all' }
)
@Get()
findAll() { ... }
```

For **non-owner modules**, GET endpoints also accept `menu_access` as sufficient:
```typescript
@RequirePermissions(
  { module: 'Academic Years', action: 'view' },
  { module: 'Academic Years', action: 'view_all' },
  { module: 'Academic Years', action: 'menu_access' }  // ← fallback for menu-only roles
)
```

---

## Database Schema

```prisma
model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  isSystem    Boolean      @default(false)
  permissions Permission[]
  userGroups  UserGroup[]
}

model Permission {
  id     String @id @default(cuid())
  roleId String
  module String  // e.g. "Students", "Academic Years"
  action String  // "menu_access" | "view" | "view_all" | "add" | "edit" | "delete"
  role   Role   @relation(...)
  @@unique([roleId, module, action])
}
```

---

## Roles Page (`/roles`)

The roles page at `/roles` allows admins to create/edit roles and set permissions via a matrix table.

### Permission Matrix Logic

- ✅ Checking **Menu** (non-owner module) → auto-adds `view` too
- ✅ Checking **any action** → auto-adds `menu_access`
- ✅ Checking **any action** (no view yet) → auto-adds `view`
- ❌ Unchecking **Menu** → removes ALL permissions for that module
- ❌ Unchecking last **view/view_all** → removes ALL permissions for that module

### Owner vs Non-Owner Modules

| Module Type | View Own | View All |
|-------------|----------|----------|
| Owner-based (Students, Leads, Applications) | ✅ Configurable | ✅ Configurable |
| Non-owner (Academic Years, Countries, etc.) | — (hidden) | — (hidden) |

---

## System Roles

| Role | Description |
|------|-------------|
| `admin` | Full access to everything (cannot be deleted) |
| `staff` | Access to core modules (students, applications, leads) |
| `agent` | View-only access to own students/applications |

> System roles (`isSystem: true`) cannot be renamed or deleted.

---

## Adding a New Module

See [`features/modules-config.md`](./modules-config.md) for the step-by-step guide.

---

## Related Files

| File | Purpose |
|------|---------|
| `lib/config/modules.ts` | Single source of truth for all modules |
| `lib/hooks/use-permissions.ts` | Client-side permission check hook |
| `components/layout/sidebar.tsx` | Navigation with menu_access filtering |
| `app/(dashboard)/roles/page.tsx` | Roles management UI |
| `crm-backend/src/common/guards/permissions.guard.ts` | Backend permission enforcement |
| `crm-backend/src/common/decorators/permissions.decorator.ts` | `@RequirePermissions` decorator |
| `crm-backend/prisma/seed-roles.ts` | Default roles seed data |
