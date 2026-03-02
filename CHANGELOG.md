# CHANGELOG

All notable changes to the Admission CRM project will be documented in this file.

## [2026-03-03] - Zoho-Style Filter Panel 🔍

### Added — Shared Component
- **`components/shared/filter-panel.tsx`**: New shared filter panel component with:
  - Searchable filter fields inside the panel
  - **System Filters** section (Active Records, Inactive Records, My Records)
  - **Filter By Fields** section with collapsible groups and checkbox selection
  - `FilterToggleButton` — toggle button with active filter badge count
  - `ActiveFilterChips` — removable chip tags for active filters with a "Clear All" button

### Updated — Students Module
- **`app/(dashboard)/students/page.tsx`**: Integrated `FilterPanel` as a collapsible sidebar beside the students table. Filters (status, isActive, agentId, nationality) are passed as query params to the API.
- **`crm-backend/src/modules/students/students.controller.ts`**: Added new query params: `status`, `isActive`, `agentId`, `nationality`.
- **`crm-backend/src/modules/students/students.service.ts`**: Extended `findAll()` to apply optional filters in the Prisma `where` clause.

### Updated — Applications Module
- **`app/(dashboard)/applications/page.tsx`**: Integrated `FilterPanel` sidebar with Stage filter and System Filters. Replaced the old inline Stage `<Select>` dropdown. Search box moved into the table Card header alongside the Filter button.

---

## [2026-02-28] - Owner Field for Students, Leads & Applications 👤

### Added — Database
- New fields `ownerId` (String?) and `ownerType` (String: 'Direct'|'Agent') added to `Student`, `Lead`, and `Application` Prisma models, with DB indexes.
- Applied via `prisma db push`.

### Added — Backend
- `CreateStudentDto`, `CreateLeadDto`, `CreateApplicationDto` all accept new `ownerId` and `ownerType` fields.
- `students.service.ts`, `leads.service.ts`, `applications.service.ts` now filter by `ownerId` (not `assignedTo`) when View Own scope is active.

### Added — Frontend
- New shared component `components/shared/owner-selector.tsx`: renders an Owner Type toggle (Direct/Agent) + active user/agent dropdown.
- Integrated `OwnerSelector` into the **Lead creation form** (`/leads/new`) under a "Record Owner" section.
- Integrated `OwnerSelector` into the **Student registration wizard** (step 3 — summary) before final submission.
- `registration-wizard-context.tsx` formSchema extended with `ownerType` and `ownerId` optional fields.

### Fixed — Roles Page
- `VIEW_OWN_MODULES` constant introduced: View Own and View All checkboxes are now disabled (shown as —) for all modules **except** Students, Leads, Applications.
- All other modules only have: Add, Edit, Delete, Export, Import permissions.

---

## [2026-02-28] - Full RBAC Rollout Across All Modules 🔐


### Added
- **`resolveViewScope` helper** (`src/common/helpers/view-scope.helper.ts`): Shared backend utility that checks if a user has `view_all` permission or only `view` (view_own), removing duplicated permission logic across controllers.

### Fixed — Backend (View Own Filtering)
- **Students** (`students.controller.ts`, `.service.ts`, `.module.ts`): `GET /students` now filters by `assignedTo = userId` when user only has `view` permission.
- **Leads** (`leads.controller.ts`, `.service.ts`, `.module.ts`): `GET /leads` now filters by `assignedTo = userId` for `view` (view_own) users.
- **Applications** (`applications.controller.ts`, `.service.ts`, `.module.ts`): `GET /applications` now filters to applications whose student is `assignedTo = userId` for view_own users.

### Fixed — Frontend (Permission-Gated UI)
All pages now use `usePermissions()` hook to conditionally show/hide Add/Edit/Delete buttons:
- `academic-years/page.tsx` → "Add Academic Year" button respects `canAdd`
- `degrees/page.tsx` → "Add Degree" button respects `canAdd`
- `faculties/page.tsx` → "Add Faculty" button respects `canAdd`
- `leads/page.tsx` → "Add Lead" button respects `canAdd`
- `roles/page.tsx` → "New Group" button respects `canAdd`
- `users/page.tsx` → "Add User", Edit, Reset Password, Toggle, Delete buttons all respect `canAdd`/`canEdit`/`canDelete`

---

## [2026-02-28] - View Own Permission Enforcement 🔒


### Fixed
- **Students View Own**: When a user's role only has `View` (not `View All`) on the Students module, the `GET /students` endpoint now filters results to only students where `assignedTo = currentUserId`. Previously all students were visible regardless.
  - `students.controller.ts`: Fetches the user's live permissions from DB on each request, detects whether they have `view_all` or only `view`, and passes an `assignedToFilter` to the service.
  - `students.service.ts`: `findAll()` now accepts an optional `assignedToFilter` parameter that adds an `assignedTo` filter to the Prisma query.
  - `students.module.ts`: Added `PrismaService` to providers for controller injection.

---

## [2026-02-28] - Frontend RBAC Permissions Enforcement 🔐


### Added
- **`usePermissions` Hook** (`lib/hooks/use-permissions.ts`): New custom React hook that reads user permissions from `localStorage` and exposes boolean flags (`canView`, `canAdd`, `canEdit`, `canDelete`, `canExport`, `canImport`) per module.

### Fixed
- **Students Page** (`app/(dashboard)/students/page.tsx`): The "Add Student" button is now hidden if the current user doesn't have the `add` permission on the `Students` module.
- **Students Table** (`components/students/students-table.tsx`): Bulk action buttons (Activate, Deactivate, Delete) and the row selection checkboxes are now conditionally rendered based on `canEdit` and `canDelete` permissions.
- **Students Row Actions** (`components/students/students-row-actions.tsx`): The "Edit", "Activate/Deactivate", and "Delete" dropdown menu items are now hidden for users without the corresponding permissions.
- **Programs Page** (`app/(dashboard)/programs/page.tsx`): The "Add Program" button is now conditionally rendered based on `canAdd`.
- **Programs Table** (`components/programs/programs-table.tsx`): The Edit and Delete action buttons are now hidden per-row when the user lacks `canEdit` or `canDelete` permissions.

---

## [2026-02-27] - Populate Country Database 🌍


### Added
- **Countries Data**: Seeded the `Country` module with 250 countries from the REST Countries API (including names, ISO codes, phone codes, and regions).

### Fixed
- **Application Form Logic**:
  - **Student List:** Fixed empty student dropdowns by properly extracting `.students` array from paginated backend response (`StudentsService` returns `{students: [], total: ...}`).
  - **Dropdown Filtering:** Academic Years, Semesters, and Degrees now properly filter to show only `isActive = true`.
  - **Program Dependency & Filtering:** Changed the form flow so the `Program` dropdown is at the bottom. The Program list is now dynamically filtered to show only programs where `isActive = true`, `activeApplications = true`, AND `degreeId` matches the selected Degree.
  - Applied fixes to both `/applications/new/page.tsx` and the `AddApplicationModal` component.

---

## [2026-02-26] - Fix Database Connection Leak & Stability ⚡

### Fixed
- **Duplicate PrismaClient Instances**: `users.module.ts` and `roles.module.ts` were declaring `PrismaService` as their own local provider, creating isolated `PrismaClient` instances (and separate DB connections) despite `DatabaseModule` being `@Global()`. Removed the redundant declarations so all modules share the single global instance.
- **PrismaService Resilience**: Added retry logic with exponential backoff (up to 5 retries) in `prisma.service.ts`. The backend now recovers from temporary network hiccups instead of crashing on startup or disconnection.
- **Frontend Prisma Singleton**: `lib/prisma.ts` was only caching the `PrismaClient` in `development` mode. In `production`, each request could create a new client and connection. Fixed to cache in all environments.

### Files Modified
- `crm-backend/src/modules/users/users.module.ts` — Removed local `PrismaService` provider
- `crm-backend/src/modules/roles/roles.module.ts` — Removed local `PrismaService` provider
- `crm-backend/src/database/prisma.service.ts` — Added `connectWithRetry()` with exponential backoff
- `lib/prisma.ts` — Fixed singleton caching for all environments

---

## [2026-02-28] - Roles Page Logic & API RBAC Enforcement 🛡️


### Changed
- **Backend API Routes**: The `@Roles()` and generic JWT guards have been replaced by the `@RequirePermissions` decorator and `PermissionsGuard` across all 14 major backend controllers (Students, Applications, Leads, Programs, Academic Years, Semesters, Cities, Countries, Faculties, Degrees, Languages, Titles, Agents, Roles/Users).
- **Backend Guard Logic**: `PermissionsGuard` now fetches a user's role-based permissions dynamically per request to ensure accurate and granular access control mapping modules (`Module Name`) and actions (`add`, `view`, `view_all`, `edit`, `delete`).
- **Frontend Roles Matrix**: Added the 'View All' action to the permission matrix.
- **Frontend Logic**: Updated the matrix toggle logic: `Add/Edit/Delete` actions are now disabled and automatically unchecked if neither `View Own` nor `View All` are selected for a module, creating a logical dependency.

## [2026-02-25] - Group-Based RBAC with Granular Permissions 🛡️

### Changed
- **Database**: Added `UserGroup` junction table for many-to-many User↔Group relationship. Removed `roleId` FK from `User`; users can now belong to multiple groups simultaneously.
- **Database**: Expanded `Permission.action` from CRUD to: `view`, `add`, `edit`, `delete`, `export`, `import`.
- **Backend**: Rewrote `UsersService` — multi-group assignment, password reset (`resetPassword`), delete with record transfer (`transferRecords`), merged permissions from all groups in JWT.
- **Backend**: Rewrote `RolesService` — group member count, blocks deletion if members exist.
- **Backend**: `AuthService` now merges permissions from all user groups into JWT payload.
- **Backend**: `UsersController` — new `/users/:id/reset-password` PATCH endpoint.
- **Frontend**: `/roles` page redesigned — group cards showing member count, 6-column permission matrix (View/Add/Edit/Delete/Export/Import), toggle-all per row/column, Select All/Clear All.
- **Frontend**: `/users` page redesigned — multi-group checkbox selector, Reset Password dialog, Delete with Transfer Records step.
- **Frontend**: Added `/api/users/[id]/reset-password` proxy route.

## [2026-02-22] - Dynamic Role-Based Access Control (RBAC) 🛡️


### Added
- **Feature**: Replaced static user roles with dynamic Role-Based Access Control (RBAC).
- **Database**: Introduced `Role` and `Permission` models in Prisma to manage granular module-level access (create, read, update, delete).
- **Backend**: Implemented `RolesModule` with full CRUD capabilities and updated `UsersModule` and `AuthModule` to include dynamic role permissions in the JWT payload.
- **Frontend**: Developed `/roles` page for admins to manage roles and their explicit permissions using a checkbox matrix.
- **Frontend**: Updated the Sidebar to dynamically display accessible links based on the user's fetched permissions.
- **Frontend**: Updated User management module to use dynamic roles instead of old static arrays.
- **Roles Page** (`/roles`): Visual permission matrix showing Admin vs Staff access for all 14 modules. Includes role cards with descriptions and a legend.
- **Sidebar**: Roles link (admin-only) added below Users link.

---

## [2026-02-22] - User Management Module 👥


### Added
- **Backend `UsersModule`**: Full NestJS CRUD for system users — list, create, update, toggle active/inactive, delete. Admin-only (protected by `@Roles('admin')`).
- **API Proxy Routes**: 3 Next.js API routes (`/api/users`, `/api/users/[id]`, `/api/users/[id]/toggle`).
- **Admin Users Page** (`/users`): Stats bar (Total, Active, Inactive, Admins), search + role filter, users table with avatar, role badge, status badge, last login. Full dialogs for Create, Edit, Toggle, Delete.
- **Sidebar**: "Users" link (with shield icon) visible to admin role only.
- **Role Persistence**: User role stored in `localStorage` after login so sidebar can filter admin-only links.

### Files Added
- `crm-backend/src/modules/users/` — DTOs, service, controller, module (5 files)
- `app/api/users/route.ts`, `app/api/users/[id]/route.ts`, `app/api/users/[id]/toggle/route.ts`
- `app/(dashboard)/users/page.tsx`

### Files Modified
- `crm-backend/src/app.module.ts` — Registered `UsersModule`
- `components/layout/sidebar.tsx` — Added admin-only Users link with role filtering
- `app/login/page.tsx` — Store `userRole` in `localStorage` on successful login

---

## [2026-02-21] - Fix Student Module 500 Error & Centralize Backend Config 🔧


### Fixed
- **Student Module 500 Error**: Resolved `PrismaClientKnownRequestError P2022` where `Application.crmId` did not exist in the current database. Root cause was a stale Prisma Client generated from an outdated schema. Fixed by running `prisma db pull` to sync schema with real DB, then `prisma generate` to regenerate both backend and frontend clients.

### Refactored
- **Centralized Backend URL**: Eliminated duplicated `const BACKEND_URL = process.env...` from all 34 API proxy route files. Created `lib/backend-client.ts` as a single source of truth. All routes now `import { BACKEND_URL } from '@/lib/backend-client'`.

### Files Added
- `lib/backend-client.ts` — Centralized NestJS backend URL configuration

### Files Modified
- `crm-backend/prisma/schema.prisma` — Re-synced with real Supabase DB via `prisma db pull`
- 34 files under `app/api/` — Replaced inline `BACKEND_URL` definition with centralized import

---


## [2026-02-21] - Performance Optimization: Fix N+1 Query in Students Module ⚡

### Fixed
- **N+1 Query Problem**: `StudentsService.findAll()` was executing one DB query per student to resolve the nationality name (e.g., 10 students = 10+ extra queries). Replaced with a single batch query using `prisma.country.findMany({ where: { id: { in: [...] } } })`.
- **Over-fetching**: Changed `include` to `select` in `findAll()` to fetch only the fields needed for the list view, avoiding loading full agent, application, program, and faculty records unnecessarily.

### Files Modified
- `crm-backend/src/modules/students/students.service.ts` — Replaced `resolveNationalityName()` with `batchResolveNationalities()`, optimized `findAll()` select fields

---

## [2026-02-14] - Application Documents UI Improvements 📄


### Improved
- **Missing Docs Workflow**: Added dedicated `Missing Docs` stage to application workflow with visual alerts.
- **Student Documents UI**: Refactored from grid view to list/table view for better readability and file management.
- **Passport Detection**: Fixed logic where uploaded passports were marked "Missing" due to case sensitivity/alias issues.
- **Conditional Alerts**: "Missing Documents" alert now only appears when the application stage is explicitly set to "Missing Docs".

### Files Modified
- `app/(dashboard)/applications/[id]/page.tsx`
- `app/(dashboard)/applications/page.tsx`
- `components/AddApplicationModal.tsx`

---

## [2026-02-14] - Fix Nationality Displaying as UUID 🔧

### Fixed
- **Nationality showing UUID instead of country name**: The `nationality` field stores a country ID but the frontend was displaying the raw ID. Backend now resolves the country name via a lookup in the `Country` table and returns `nationalityName`. Both the students list and student profile pages now display the correct country name.

### Files Modified
- `crm-backend/src/modules/students/students.service.ts` — Added `resolveNationalityName()` helper, used in `findAll` and `findOne`
- `app/(dashboard)/students/[id]/page.tsx` — Display `nationalityName` in profile Overview
- `components/students/students-table.tsx` — Display `nationalityName` in student list table

### Fixed
- **Student Update 500 Error**: Fixed an issue where updating a student with empty optional fields (like `highSchoolGpa`) caused a 500 Internal Server Error. Prisma was rejecting empty strings for Decimal/Date fields. Added sanitization in `StudentsService.update` to convert empty strings to `null`.

---

## [2026-02-14] - Fix Uploaded Files Returning 404 🔧

### Fixed
- **Uploaded files returning 404**: Files uploaded via local storage fallback (when Supabase is not configured) were returning 404 because Next.js standalone mode doesn't serve runtime-written files from `public/`. Created API route `/api/uploads/[...path]` to serve uploaded files.

### Added
- `app/api/uploads/[...path]/route.ts` — File-serving API route with security checks and correct content-type headers

### Files Modified
- `lib/local-storage.ts` — Changed URL prefix from `/uploads/` to `/api/uploads/`
- `Dockerfile` — Added writable uploads directory creation for Docker runtime

---

## [2026-02-14] - Student Document Upload Fix on Create 🔧

### Fixed
- **Documents not saved during student creation**: When creating a new student, uploaded documents were stored only as JSON in the `documents` field but NOT as proper `Document` table records. This meant they didn't appear in the Student Docs tab. Now the backend creates proper `Document` records after student creation, matching the behavior of the edit flow.

### Files Modified
- `crm-backend/src/modules/students/students.service.ts` - Added Document record creation in `create()` method

---

## [2026-02-14] - Application Document Tabs & Bug Fixes 📄

### Added
- **Student Documents Tab**: Read-only view of student profile documents inside the Application Detail page with visual indicators (✅/❌) for missing required docs (Passport, Transcript, Photo)
- **Application Documents Tab**: Upload application-specific documents with type selector (Payment Receipt, Initial Acceptance, Final Acceptance, Other), grouped display by document type, and delete support
- **Delete Confirmation**: Document deletion now requires user confirmation before proceeding

### Fixed
- **DocumentCard Crash**: Fixed crash when `fileSize` is null/undefined (division by zero → NaN)
- **Missing Doc Indicators**: Made required document comparison case-insensitive with alias support
- **FileUpload Accept Types**: Expanded accepted file types to include Word documents (.doc, .docx) in addition to images and PDF
- **Duplicate Import**: Removed duplicate `Briefcase` import that caused build failure

### Files Modified
- `app/(dashboard)/applications/[id]/page.tsx` - New tabs, bug fixes, delete confirmation
- `crm-backend/src/modules/applications/applications.service.ts` - Added `studentDocuments` to `detailIncludes`

---

## [2026-02-14] - Application Detail Page 📋

### Added
- **Comprehensive Application Detail Page**: Full-featured detail view accessible at `/applications/[id]` with:
  - **Header**: Application ID, stage badge, program name, academic year/semester, created/updated dates
  - **Stage Management**: Dropdown to change application stage with visual progress bar (Draft → Submitted → Under Review → Conditional Acceptance → Final Acceptance), plus special badges for Rejected/Enrolled/Cancelled
  - **Quick Stats Cards**: Degree, Documents count, Tasks count, Tuition amount
  - **5 Tabs**: Overview, Student, Documents, Tasks, Timeline
  - **Overview Tab**: Program info (faculty, specialty, degree, language), Tuition & Financial (with savings calculation), Academic Details, Agent/Agency info, editable Notes section
  - **Student Tab**: Full student profile with avatar, personal info, contact, address, academic background (High School/Bachelor/Master) with link to student profile
  - **Documents Tab**: Grid view with file previews, view/download actions
  - **Tasks Tab**: Task cards with priority badges, status icons, due dates
  - **Timeline Tab**: Activity history with event types and timestamps

### Files Added
- `app/(dashboard)/applications/[id]/page.tsx` - Application detail page

---

## [2026-02-14] - Add Application Modal on Student Profile

### Added
- **Add Application Modal**: "Add Application" button on the student detail page now opens a popup modal dialog instead of redirecting to a separate page. The modal includes all application fields (Program, Academic Year, Semester, Degree, Stage, Agent/Agency, Notes) with tuition display and auto-fill degree from selected program.

### Files Added
- `components/AddApplicationModal.tsx` - Reusable modal component using Radix UI Dialog

### Files Modified
- `app/(dashboard)/students/[id]/page.tsx` - Integrated modal, replaced redirect links with onClick handlers, added data refresh on success

---

## [2026-02-13] - Application Module Enhancement

### Added
- **Agent/Agency Dropdown**: Add Application form now includes an Agent/Agency selector fetching from `/api/agents`.
- **CRM Reference ID**: New text input for external CRM reference tracking.
- **Tuition Display**: Program dropdown now shows faculty name and tuition fee. A tuition info card appears below the dropdown with strikethrough pricing for discounted programs.
- **Auto-fill Degree**: Selecting a program auto-fills the Degree dropdown from the program's associated degree.
- **Agent Column**: Applications list table now shows Agent company name and contact person.
- **CRM ID Column**: Applications list table now shows CRM reference ID with a code-styled badge.

### Fixed
- **Backend Agent Field Selection**: Fixed `listIncludes` and `detailIncludes` to use correct Agent model fields (`companyName`, `contactPerson`) instead of non-existent `name` field.

### Files Modified
- `app/(dashboard)/applications/new/page.tsx`
- `app/(dashboard)/applications/page.tsx`
- `crm-backend/src/modules/applications/applications.service.ts`

---

## [2026-02-13] - Frontend Console Errors Fix

### Fixed
- **Missing API Proxy Routes**: Created all missing frontend-to-backend proxy routes that were causing 404 HTML responses and `V.map is not a function` errors.
- **Middleware JSON 401 for API Routes**: Updated `middleware.ts` to return JSON 401 for `/api/` routes instead of redirecting to the HTML login page, preventing JSON parse errors.

### Files Added
- `app/api/cities/route.ts` (GET, POST)
- `app/api/cities/[id]/route.ts` (GET, PATCH, DELETE)
- `app/api/agents/[id]/route.ts` (GET, PATCH, DELETE)
- `app/api/languages/[id]/route.ts` (GET, PATCH, DELETE)
- `app/api/specialties/[id]/route.ts` (GET, PATCH, DELETE)
- `app/api/academic-years/[id]/route.ts` (GET, PATCH, DELETE)
- `app/api/semesters/[id]/route.ts` (GET, PATCH, DELETE)

### Files Modified
- `middleware.ts`

## [2026-02-13] - Docker Infrastructure & Login Fix 🐳

### Fixed
- **Prisma Engine Compatibility**: Switched both `Dockerfile` (frontend) and `crm-backend/Dockerfile` (backend) from `node:20-alpine` to `node:20-slim` to resolve `PrismaClientInitializationError` caused by missing `libssl` on Alpine Linux.
- **OpenSSL Installation**: Added `apt-get install openssl` to both builder and runner stages in both Dockerfiles so Prisma can detect and use the correct engine binary.
- **Container Networking**: Frontend could not reach backend via `localhost:3001` inside Docker. Added `INTERNAL_BACKEND_URL=http://backend:3001` environment variable to `docker-compose.yml` and updated **all 27 API proxy route files** under `app/api/` to use it for server-side requests.
- **Backend Build Structure**: Excluded `prisma` directory from `tsconfig.build.json` to prevent `dist/src/` nesting that caused `Cannot find module '/dist/main'` at startup.

### Files Modified
- `Dockerfile` - Switched to `node:20-slim`, added OpenSSL
- `crm-backend/Dockerfile` - Switched to `node:20-slim`, added OpenSSL in builder stage
- `docker-compose.yml` - Added `INTERNAL_BACKEND_URL` for frontend container
- `app/api/auth/login/route.ts` - Uses `INTERNAL_BACKEND_URL` for server-side proxy
- `crm-backend/tsconfig.build.json` - Excluded `prisma` from build

---

## [2026-02-12] - Application Module 📝

### Added
- **Application Management Module**: Full CRUD for student applications with stage tracking
- **Backend**:
  - `ApplicationsService` with pagination, search, multi-field filtering (stage, student, program, academic year, semester, agent, agency), and auto-generated application names (`APP-YYYY-NNN`)
  - `ApplicationsController` with Swagger docs, `GET /stats` endpoint, and query param support
  - `CreateApplicationDto` with required fields: `studentId`, `programId`, `academicYearId`, `semesterId`, `degreeId`
  - Unique constraint handling for duplicate student/program/year combinations
- **Frontend**:
  - Applications list page with search, stage filter, stats cards, paginated table, and delete
  - Add Application form with dropdown selects for student, program, academic year, semester, degree, stage
  - Auto-selects default academic year and semester
  - API proxy routes: `/api/applications`, `/api/applications/[id]`, `/api/applications/stats`
- **Database**:
  - `Application` model in Prisma schema with relations to `Student`, `Program`, `AcademicYear`, `Semester`, `Degree`, `User`, `Agent`
  - 8 application stages: Draft, Submitted, Under Review, Conditional Acceptance, Final Acceptance, Rejected, Enrolled, Cancelled
  - Seeded academic years (2024-2025, 2025-2026, 2026-2027) and semesters (Fall, Spring, Summer)

### Files Added
- `app/api/applications/route.ts` - API proxy (GET, POST)
- `app/api/applications/[id]/route.ts` - API proxy (GET, PATCH, DELETE)
- `app/api/applications/stats/route.ts` - Stats API proxy
- `app/(dashboard)/applications/new/page.tsx` - Add Application form

### Files Modified
- `crm-backend/prisma/schema.prisma` - Added Application model and relations
- `crm-backend/prisma/seed.ts` - Added academic years, semesters, updated admin user
- `crm-backend/src/modules/applications/applications.service.ts` - Rewritten with pagination/search/filtering
- `crm-backend/src/modules/applications/applications.controller.ts` - Rewritten with Swagger docs
- `crm-backend/src/modules/applications/dto/create-application.dto.ts` - Rewritten with new fields
- `app/(dashboard)/applications/page.tsx` - Rewritten from mock pipeline to data-driven table

---

## [2026-02-12] - Local Login Fix & Config Cleanup 🔧

### Fixed
- **Login Invalid Credentials**: Resolved login failure caused by duplicate user records with stale password hashes in the database. Updated all matching user records with correct bcrypt hashed password.
- **Case-Insensitive Email Login**: Changed `auth.service.ts` to use `findFirst` with `mode: 'insensitive'` instead of `findUnique`, so login works regardless of email casing.
- **Next.js Config Warnings**: Removed deprecated `eslint` and `swcMinify` keys from `next.config.js` that caused startup warnings.

### Files Modified
- `crm-backend/src/modules/auth/auth.service.ts` - Case-insensitive email matching
- `next.config.js` - Removed deprecated config keys

## [2026-02-12] - Program Module Fixes 📋

### Fixed
- **API Auth Missing**: All program API proxy routes now include Authorization headers
- **Wrong Default Port**: Changed fallback port from 4000 to 3001 in API proxy routes
- **Edit Page Auth**: Converted SSR edit page to CSR with proper cookie-based auth flow
- **Specialty Name Display**: Fixed specialty selector to handle both `name` and `title.name` formats
- **API Connectivity**: Corrected default port from 4000 to 3001 in all 12 API proxy routes (countries, degrees, faculties, etc.) ensuring stable data fetching for dropdowns like Specialty

### Added
- **Delete Program**: Delete button with confirmation dialog in programs table
- **Currency Selector**: Dropdown with 12 currencies (USD, EUR, GBP, TRY, SAR, etc.)
- **Specialty Column**: Added specialty column to programs table
- **Tuition Formatting**: Numbers now formatted with locale separators

## [2026-02-12] - Security Hardening 🔐

### Security
- **Port 3001 Blocked**: Backend port no longer accessible externally via UFW firewall
- **Swagger Disabled in Production**: API documentation only available in development
- **Helmet Security Headers**: Added X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **Rate Limiting**: 3-tier rate limiting globally (3/sec, 20/10sec, 100/min) + strict 5/60s on login
- **JWT Middleware Validation**: Middleware now validates JWT structure and expiration, not just cookie existence
- **Upload Authentication**: Upload endpoint now requires valid auth token
- **XSS Prevention**: HTML sanitization in rich-text-editor (removes scripts, event handlers, dangerous elements)
- **Path Traversal Prevention**: Upload file names and folder paths sanitized
- **RBAC System**: Created RolesGuard and @Roles() decorator for role-based access control
- **JWT Expiry Reduced**: From 7 days to 24 hours
- **Debug Logging Removed**: Sensitive info (token lengths, backend URLs) no longer logged
- **Nginx Hardened**: Added 5 security headers, disabled server version disclosure, 10MB body limit

### Files Modified
- `crm-backend/src/main.ts` - Helmet, Swagger conditional
- `crm-backend/src/app.module.ts` - ThrottlerModule, ThrottlerGuard
- `crm-backend/src/modules/auth/auth.controller.ts` - Login rate limit
- `crm-backend/src/modules/auth/auth.module.ts` - JWT 24h expiry
- `middleware.ts` - JWT validation
- `app/api/upload/route.ts` - Auth + path traversal fix
- `app/api/students/route.ts` - Debug logs removed
- `components/ui/rich-text-editor.tsx` - XSS sanitization
- `nginx.conf` - Security headers

### New Files
- `crm-backend/src/common/guards/roles.guard.ts` - RBAC guard
- `crm-backend/src/common/decorators/roles.decorator.ts` - Roles decorator

## [2026-02-12] - Production Login Fix 🔒

### Fixed
- **Browser Login on Production**: Resolved login working locally but failing on production VPS.
- **Root Cause 1 - Nginx Routing**: Nginx was proxying `/api` requests directly to NestJS backend, bypassing Next.js API routes that map `email` → `username`. Fixed by routing all traffic through Next.js.
- **Root Cause 2 - Cookie Secure Flag**: `access_token` cookie had `Secure` flag enabled in production (HTTP-only server), preventing browser from storing the cookie. Disabled `Secure` flag for HTTP deployment.
- **Admin User**: Corrected admin email from `Mohmed@daxow.com` to `Mohamed@daxow.com`.

### Files Modified
- `app/api/auth/login/route.ts` - Disabled `Secure` cookie flag for HTTP
- `nginx.conf` - Removed separate `/api` proxy block, all traffic routes through Next.js
- `crm-backend/create-admin.js` - Admin user creation script with correct email

## [2026-02-11] - Production Deployment 🚀

### Added
- **VPS Deployment**:Deployed the full application (Frontend + Backend) to Hostinger VPS (`76.13.239.71`).
- **Nginx Configuration**: Configured Nginx as a reverse proxy for both Frontend (port 3000) and Backend (port 3001/api).
- **PM2 Process Management**: Set up PM2 to manage Node.js processes with auto-restart on boot.
- **Environment Setup**: Configured production environment variables on the server.

## [2026-02-11] - Student Registration Response Handling Fix 🔧

### Fixed
- **Student Registration 500 Error**: Resolved `TypeError: Cannot read properties of undefined (reading 'id')` that caused the registration to appear to fail with a 500 error.
- **Root Cause**: Frontend `registration-confirmation.tsx` expected the API response as `{ student: { id } }`, but the backend returns the student object directly `{ id, firstName, ... }`.
- **Fix**: Updated response handling to support both formats: `data.student.id` or `data.id`.
- **Additional Fix**: Backend `students.service.ts` - sanitized empty strings to `undefined` for optional fields (prevents Prisma Decimal type conversion errors), and stored documents as JSON in the student record instead of creating separate Document table records.

### Files Modified
- `components/students/registration-confirmation.tsx` - Fixed response format handling
- `crm-backend/src/modules/students/students.service.ts` - Data sanitization + documents as JSON

## [2026-02-11] - Student Registration Fix 🔧

### Fixed
- **Student Creation Error**: Resolved `400 Bad Request` error during student registration.
- **Root Cause**: `CreateStudentDto` was missing multiple fields sent by the frontend (including `documents`, `haveTc`, `transferStudent` flags, etc.), causing validation to fail.
- **Fix**: Updated `CreateStudentDto` to include all form fields and boolean flags. Updated `StudentsService` to correctly extract and save documents and create a timeline event.
- **Impact**: Student registration now works correctly, including document metadata saving.

### Files Modified
- `crm-backend/src/modules/students/dto/create-student.dto.ts`
- `crm-backend/src/modules/students/students.service.ts`
- `crm-backend/src/modules/students/students.module.ts`

## [2026-02-11] - Student Registration: Countries Dropdown Fix 🔧

### Fixed
- **Countries Dropdown Empty**: Resolved critical bug where Country and Nationality dropdowns in student registration form appeared empty despite data existing in database.
- **Root Cause**: API response parsing error in `registration-wizard-context.tsx` - API returns `{data: [...]}` but code expected `{countries: [...]}`.
- **Fix**: Changed `data.countries || []` to `data.data || []` on lines 188 and 192 in `registration-wizard-context.tsx`.
- **Impact**: All country-related dropdowns (Nationality, Address Country, High School Country, Bachelor Country, Master Country) now correctly populate from the countries module via API.

### Files Modified
- `components/students/registration-wizard-context.tsx` - Fixed API response parsing

### Testing
- ✅ Nationality dropdown verified working
- ✅ Address Country dropdown verified working  
- ✅ High School Country dropdown verified working
- ✅ Full integration with countries module confirmed

## [2026-02-11] - Lead Creation Fix 🔧

### Fixed
- **Lead Creation Error**: Resolved `400 Bad Request` error when creating new leads.
- **Root Cause**: `CreateLeadDto` was missing the `documents` field, causing validation failure when frontend sent document data (even if empty).
- **Fix**: Added `documents` array validation to `CreateLeadDto` and updated `LeadsService` to save documents using the correct `prisma.document` model.
- **Impact**: Users can now successfully create leads with or without attached documents.

### Files Modified
- `crm-backend/src/modules/leads/dto/create-lead.dto.ts` - Added documents field to DTO.
- `crm-backend/src/modules/leads/leads.service.ts` - Updated creation logic to save documents.

### Testing
- ✅ Verified lead creation via frontend form.
- ✅ Confirmed documents structure matches frontend payload.

## [2026-02-06] - Database Connection Repair 🔧

### Fixed
- **Database Connection**: Resolved connectivity issues between CRM and Supabase.
- **Prisma Client**: Generated missing Prisma Clients for both Backend and Frontend.
- **Migrations**: Synchronized database migration state to match existing schema without data loss.
- **Server Startup**: Successfully started both Backend (Port 3001) and Frontend (Port 3000) with verified database capabilities.

## [2026-02-06] - API Proxy Refactoring Refinement 🛠️

### Refactored
- **Front-Backend Communication**: Converted direct backend calls (`localhost:3001`) to Next.js API Proxy routes (`/api/...`) across the entire application to ensure consistent authentication and CORS handling.
- **Modules Updated**:
  - `Countries` (Dialogs & Tables)
  - `Cities` (Dialogs & Tables)
  - `Semesters` (Dialogs & Tables)
  - `Academic Years` (Dialogs & Tables)
  - `Languages` (Dialogs & Tables)
  - `Specialties` (Dialogs & Tables)
  - `Leads` (Tables & Actions)
  - `Timeline` (Shared Component)
- **Authentication**: All requests now flow through the Next.js backend proxy, which attaches the `access_token` correctly, resolving `401 Unauthorized` errors.

### Hotfix
- **Dashboard Pages**: fixed remaining hardcoded `http://localhost:3001` references in client-side pages (Countries, Cities, Faculties, etc.) that were causing connection refused errors in production.

## [2026-02-03] - Logout Functionality & Authentication Security

### Added
- **Logout API Endpoint**: Created `/api/auth/logout` endpoint that clears authentication cookies
- **Logout Button**: Added logout button to sidebar with loading state and error handling
- **Logout Flow**: Complete logout process with automatic redirect to login page

### Security
- **Authentication Verification**: Conducted comprehensive security audit of all routes
- **Middleware Protection**: Verified that all dashboard routes require authentication
- **Unauthorized Access Prevention**: Confirmed middleware redirects unauthenticated users to login
- **Session Termination**: Logout properly clears cookies and terminates sessions

### Modified
- `app/api/auth/logout/route.ts` - New logout endpoint
- `components/layout/sidebar.tsx` - Added logout button with state management
- `middleware.ts` - Added logout endpoint to public API routes

### Testing
- ✅ Logout flow tested and verified
- ✅ All protected routes tested for authentication requirements
- ✅ Unauthorized access attempts properly redirected
- ✅ Session persistence and cookie management verified

---

## [2026-01-31] - Critical Security Fix: JWT Secret Hardening

### Security
- **CRITICAL**: Removed hardcoded JWT secret fallback (`FALLBACK_SECRET_DO_NOT_USE_IN_PROD`)
- Added strict validation: Backend now fails to start if `JWT_SECRET` environment variable is not set
- Updated `crm-backend/src/modules/auth/strategies/jwt.strategy.ts` with proper secret validation
- Updated `crm-backend/src/modules/auth/auth.module.ts` with proper secret validation
- Generated cryptographically secure JWT secret using `openssl rand -base64 32`
- Extended JWT token expiration from 1 day to 7 days for testing convenience
- Updated `crm-backend/.env.example` to use correct `JWT_EXPIRES_IN` variable name

### Files Modified
- `crm-backend/src/modules/auth/strategies/jwt.strategy.ts`
- `crm-backend/src/modules/auth/auth.module.ts`
- `crm-backend/.env.example`
- `crm-backend/.env` (local only, not committed)

---

## [2026-01-28] - Student Module Refactoring: Academic History ✅

### Refactored
- **Student Registration & Edit Forms**: Decoupled "Academic History" from the dynamic `Degrees` module.
  - "Current Education Level" is now a static list: High School, Bachelor, Master, PhD.
  - Removed dependency on `degrees` API for this field.
  - Updated conditional visibility for Bachelor/Master details to work with the new static values.
  - Applied changes to both the Registration Wizard (`StudentInformationStep`) and the Edit Student Page (`/students/[id]/edit`).

  - Applied changes to both the Registration Wizard (`StudentInformationStep`) and the Edit Student Page (`/students/[id]/edit`).

### Added - Degrees Module 🎓
- **Full CRUD Implementation**:
  - **List Page**: Data table with sorting and pagination.
  - **Form Dialog**: Create and Edit degrees (e.g., Bachelor, Master, PhD).
  - **Backend**: Dedicated NestJS module with `DegreesController` and `DegreesService`.
  - **Frontend Integration**: API Proxy routes and Sidebar navigation.

### Enhanced - Languages & Specialties 🛠️
- **Languages**: 
  - Verification of API Proxies for seamless frontend-backend communication.
  - table view with ISO codes.
- **Specialties**:
  - Renaming and Refactoring (Titles separation).
  - Integration with Faculties for filtered selection.

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2026-01-27] - Program Module DB Sync 🔄

### Changed
- **Database Schema**: Synced `Program` model with manual SQL changes.
  - Renamed fields: `tuitionFee` -> `officialTuition`, `discountedFee` -> `discountedTuition`, `currency` -> `tuitionCurrency`.
  - Removed fields: `description`, `intakeMonth`, `metadata`, `degreeType`, `language`, `duration` etc.
  - Added `userId` relation.
- **Backend**: Updated `ProgramsService`, `CreateProgramDto`, and `UpdateProgramDto` to match new schema.
- **Frontend**: Updated `ProgramForm` and `ProgramsTable` to reflect field changes and removals.


## [2026-01-27] - Program Module & Form Fixes ✅

### Added - Programs Module
- **Program List Page**:
  - Full CRUD operations with server-side pagination
  - Advanced filtering (Faculty, Degree) and sorting
  - Search with debouncing
- **Program Form**:
  - Cascading dropdowns (Faculty → Specialty, Country → City)
  - Zod validation with strict type safety fixes
  - Integrated with all auxiliary modules (Languages, Degrees, etc.)
- **Sidebar Integration**: Added "Programs" to main navigation

## [2026-01-27] - Fix Specialty Titles Routing 🛠️

### Fixed
- **Specialty Title POST Error**: Resolved "Cannot POST /api/specialty-titles" error by fixing a backend compilation failure in `SpecialtyEntity` that prevented new routes from registering.
- **File Upload Error**: Fixed upload logic to correctly fallback to local storage if Supabase upload fails, preventing 500 errors.
- **Student Form Warning**: Resolved "uncontrolled input" React warning by enforcing default empty string values for optional fields.
- **List Data Display**: Fixed backend `findAll` methods in Leads and Students to return paginated response (`{ data, total }`) instead of raw array, resolving empty lists on frontend.
- **Semester Creation Error**: Fixed "academicYearId must be a string" error by adding a dropdown to the Add Semester dialog, ensuring the required Academic Year is selected.
- **Semester Logic**: Updated Schema and Backend to make `academicYearId` optional for Semesters, as per user requirement that Semesters are not strictly linked to Academic Years.
- **Semester Independence**: Completely removed `academicYearId` relation from Semester model in database and code, decoupling Semesters from Academic Years entirely.

---

## [2026-01-26] - Expanded Academic Modules Frontend ✅

### Added - Faculties, Languages, Specialties, Titles
- **Specialty Titles (Titles) Module**:
  - Centralized management of specialty names to prevent duplicates
  - Full CRUD operations with table view and bulk actions
  - Integrated with Specialties module as a required selection
- **Faculties Module**:
  - Full CRUD operations with table view
  - Bulk Actions (Delete, Activate/Deactivate)
  - Edit support via `FacultyFormDialog`
  - Sticky header table with pagination
- **Languages Module**:
  - Full CRUD operations with ISO code support
  - Bulk Actions & Pagination
  - Dedicated table and dialog components
- **Specialties Module**:
  - Linked to Faculties (Select Faculty dropdown)
  - Full CRUD operations
  - Advanced Table with "Faculty" column and bulk actions

---

## [2026-01-26] - Enhanced Table Features (Bulk Actions + Pagination) ✅

### Added - Countries Module Enhancements
- **Bulk Selection**: Checkbox column for selecting multiple countries
- **Bulk Actions Toolbar**: Delete, Activate, and Deactivate multiple records at once
- **Advanced Pagination**: 
  - Page size selector (10/25/50/100/200 records per page)
  - Page navigation with current page indicator
  - Records count display ("Showing 1 to 25 of 195")
- **Scrollable Table**: 500px max-height with sticky header
- **Enhanced Menu Icons**: Added visual icons to Activate/Deactivate actions

---

## [2026-01-26] - Timeline Auditing & Bug Fixes ✅

### Added - Timeline User Tracking
- **Auditing System**: Implemented `performedBy` tracking for all Timeline events
- **User Decorator**: Created custom `@User()` decorator in Backend to extract user from headers
- **Frontend Integration**: Updated Row Actions and Dialogs to send `x-performed-by` header
- **Privacy**, `createdBy` field removed in favor of `performedBy` to align with Database Schema

### Fixed
- **Internal Server Error**: Resolved timeline creation crash during Semester/Academic Year updates
- **Stale Server Issue**: Fixed backend compilation error in `TasksService` that prevented server from reloading
- **Type Safety**: strict DTO validation for Timeline events

## [2026-01-26] - Countries & Cities Modules Implementation ✅

### Added - Frontend Modules
- **Countries Module**:
  - Full CRUD operations with ISO code and Region validation
  - **Tabbed View Page**: Overview (Details + Timeline) and Cities (Linked List)
  - **Pagination & Search**: Backend-optimized listing with filtering
  - **Integrated City Creation**: Add cities directly from Country view with auto-linking

- **Cities Module**:
  - Full CRUD operations
  - **View Page**: Detailed view with Timeline history
  - **Navigation**: Clickable table rows for better UX
  - **Country Relation**: Dynamic country dropdown with search support

## [2026-01-26] - Academic System Implementation ✅

### Added - Backend (NestJS + Prisma)
- **Database Models**: Created 6 new academic models in Prisma schema
  - `AcademicYear` - Academic years (e.g., "2024-2025")
  - `Semester` - Semesters (e.g., "Fall 2024", "Spring 2025")
  - `City` - Cities with country relation
  - `Faculty` - Academic faculties (e.g., Engineering, Medicine)
  - `Language` - Teaching languages with optional language codes
  - `Specialty` - Academic specialties within faculties

- **NestJS Modules**: Complete CRUD operations for all 6 models
  - DTOs (Create/Update) with validation
  - Services with pagination, search, and filtering
  - Controllers with Swagger documentation
  - REST API endpoints: GET (list/single), POST, PATCH, DELETE

- **API Endpoints**:
  - `/api/academic-years` - Academic years management
  - `/api/semesters` - Semesters management
  - `/api/cities` - Cities management (with country filtering)
  - `/api/faculties` - Faculties management
  - `/api/languages` - Languages management
  - `/api/specialties` - Specialties management (with faculty filtering)

### Changed
- Updated `app.module.ts` to include all 6 new academic modules
- Updated Prisma schema with proper relations and indexes
- Generated new Prisma Client with academic models

### Technical Details
- **Cascading Relations**: Cities belong to Countries, Specialties belong to Faculties
- **Filtering Support**: Cities can be filtered by country, Specialties by faculty
- **Pagination**: All endpoints support pagination with configurable page size
- **Search**: Full-text search on name fields (case-insensitive)
- **Active Status**: All models include isActive flag for soft enable/disable

---

## [2026-01-24] - Storage Refactor & Lead Uploads ✅

### Changed - Storage Architecture
- **Unified Bucket Strategy**: Switched to a single `crm-uploads` bucket instead of multiple buckets
- **Folder Structure**: 
  - `students/{id}/...` for student documents
  - `leads/...` for lead documents
  - `temp/...` for unassigned uploads
- **API Update**: `/api/upload` now automatically routes files based on `folder` or `studentId` params

### Added - Features
- **Lead Document Upload**: Leads can now upload documents (Passport, CV, etc.)
- **Dynamic Upload Logic**: Frontend components updated to use the new unified storage API
- **Documentation**: Added `docs/storage-strategy.md` and updated Setup guides

## [2026-01-19] - Timeline Auto-Tracking - Comprehensive Field Change Descriptions

### Added
- **Detailed Timeline Change Tracking**: All Lead and Task updates now show specific field changes
  - Tasks: Status, Priority, Description, Due Date, Assignment changes tracked
  - Leads: ALL fields tracked (Status, Type, Name, Email, Phone, Country, City, Source, Preferred Countries, Preferred Intake, Budget Range, Company, Contact Person, Estimated Students, Commission, Assignment, Notes)
  - Timeline descriptions now show "Field: Old Value → New Value" format
  - Special handling for null/empty values to show "None" or "Not Set"
  
### Fixed
- Timeline event schema updated with `title` field (with default value to preserve existing data)
- Null value comparisons fixed for optional fields using `!== undefined` checks
- Task completion events now show outcome and completion notes
- Lead and Task timeline events show comprehensive change details

## [2026-01-19] - Task Management Enhancements ✅

### Added - Task Features
- **Edit Task Date/Time**: Tasks can now have their due date and time edited
- **Task Completion Outcome**: Enhanced completion dialog with:
  - Outcome selection (Success ✅ / Failed ❌)
  - Optional completion notes
  - Simplified UI with dropdown and textarea
- **Completion Notes Display**: Shows outcome and notes in task view dialog

### Added - Global Shared Features System
- **`lib/config/shared-features.ts`**: Global configuration file defining:
  - Tasks (available in all modules)
  - Timeline (available in all modules)
  - Documents (available in Lead, Student, Application)
  - Emails (available in Lead, Student, Agent)
  - Notes (available everywhere)
  - Helper functions: `getAvailableFeatures()`, `isFeatureAvailable()`, `getEntityTabs()`

### Planning Documents
- **Notifications System Plan**: Complete plan for real-time task notifications
- **Timeline Auto-Events Plan**: Automatic timeline tracking for all user actions

### Technical Details
- Completion metadata now includes: `outcome`, `completionNotes`, `completedAt`
- Task view dialog enhanced with date/time pickers in edit mode
- Configuration-driven feature availability across modules

---

## [2026-01-19] - Tasks Module with Polymorphic Relations ✅

### Added - Tasks Module Migration
- **Polymorphic Task System**: Tasks can now be linked to any entity type (Leads, Students, Applications, etc.)
  - `entityType` field: Identifies the related entity type
  - `entityId` field: Links to the specific entity
  - Backward compatible with existing `applicationId` field

- **Backend API Endpoints** (5 total):
  - `POST /api/tasks` - Create task with entity linking
  - `GET /api/tasks` - List all tasks
  - `GET /api/tasks?entityType=Lead&entityId=xxx` - Filter by entity
  - `PATCH /api/tasks/:id` - Update task
  - `DELETE /api/tasks/:id` - Delete task

- **Frontend Integration**:
  - Updated `AddTaskDialog` component with entity support
  - Auto-detects entity when creating from Lead/Student pages
  - Next.js API proxy routes for seamless backend communication

### Technical Implementation
- **Schema Changes**: Added `entityType` and `entityId` columns to Task table
- **DTOs**: CreateTaskDto and UpdateTaskDto with polymorphic validation
- **Service**: TasksService with entity-based filtering
- **Migration**: Prisma db push with backward compatibility

### Usage
- Create tasks from Lead detail page → Auto-links to Lead
- Create tasks from Student detail page → Auto-links to Student
- Filter tasks: `GET /api/tasks?entityType=Lead&entityId=xxx`

---

## [2026-01-17] - Phase 1: Backend Migration Complete ✅

### Added - Independent NestJS Backend
- **Backend Setup**: Created independent NestJS backend project in `/crm-backend/`
  - Full TypeScript support with strict type checking
  - Global ValidationPipe for request validation
  - Swagger/OpenAPI documentation at `http://localhost:4000/api/docs`
  - CORS enabled for multi-origin support
  - Centralized database module with Prisma ORM

- **Students Module**: Complete CRUD operations with auto-generated student IDs (`STU-0001`)
  - `POST /api/students` - Create student
  - `GET /api/students` - List all students
  - `GET /api/students/:id` - Get student details
  - `PATCH /api/students/:id` - Update student
  - `DELETE /api/students/:id` - Delete student

- **Leads Module**: Lead management with student/agent types and conversion
  - Auto-generated lead IDs (`LEAD-0001`)
  - Support for both Student and Agent leads
  - `POST /api/leads/:id/convert` - Convert lead to student
  - Full timeline tracking

- **Universities Module**: University catalog management
  - Includes related campuses and programs
  - Soft delete functionality
  - Country-based filtering

- **Countries Module**: Global countries data (197 countries)
  - Unique name and ISO code validation
  - Flags for nationality and university filtering
  - Duplicate prevention

- **Applications Module**: Student application tracking
  - Student and program relationships
  - Query filters by `studentId` and `programId`
  - Stage history and timeline tracking
  - Task management integration

### Technical Details
- **Total Endpoints**: 27 REST API endpoints
- **Architecture**: Clean separation of concerns (DTOs, Services, Controllers, Modules)
- **Validation**: class-validator decorators on all DTOs
- **Documentation**: Full Swagger integration with request/response schemas
- **Database**: Prisma Client with transaction support
- **Error Handling**: Proper HTTP status codes and NestJS exceptions

### Infrastructure
- Backend running on port 4000
- Frontend running on port 3000 (Next.js - to be migrated)
- Shared Supabase PostgreSQL database
- Zero-downtime development with hot reload

---

## [2026-01-16] - Countries Database Complete

### Added
- ✅ **New NestJS Backend Project** - Completely separated from Frontend
  - Prisma database integration
  - Swagger API documentation at `/api/docs`
  - JWT authentication setup
  - Global validation pipes
  - CORS configuration for Frontend communication
  
- ✅ **Country Database Migration**
  - Seeded 197 countries with ISO codes to Supabase
  - Countries organized by regions (Middle East, Africa, Europe, Asia, Americas, Oceania)
  - All countries active for nationalities and university filters

### Changed
- 🔄 **Architecture** - Migrated from monolithic to separated Frontend/Backend
- 🔄 **API Routes** - All `/app/api` routes will be migrated to NestJS
- 🔄 **Database Access** - Centralized through Prisma service in Backend

### Removed
- ❌ **Mock Data Files** - Deleted `/lib/mock-data.ts` and `/lib/mock-data-students.ts`
- ❌ **Mock Data Imports** - Removed from universities, applications, leads, dashboard, programs pages
  
### Fixed
- ✅ **Next.js 16 Compatibility** - Updated API routes to use Promise params
- ✅ **Build Errors** - Fixed countries and credentials API routes

### Documentation
- 📚 **Backend README** - Comprehensive guide for NestJS backend
- 📚 **API Documentation** - Swagger/OpenAPI docs auto-generated
- 📚 **Environment Setup** - `.env.example` with all required variables

---

## [2026-01-16] - UI Improvements & Documentation

### Added
- ✅ **Lead Documents Grid View** - Card-based layout matching Student module
- ✅ **Lead to Student Conversion** - Working conversion flow
- ✅ **UI Patterns Documentation** - Comprehensive guide in `/docs/ui-patterns.md`

### Changed
- 🔄 **Student Detail Page** - Converted to Client Component for interactivity
- 🔄 **Documentation** - Updated all module docs with recent changes

### Fixed
- ✅ **Event Handler Errors** - Resolved Next.js Server/Client component issues
- ✅ **Status Configuration** - Fixed undefined statusConfig errors

---

## Future Releases

### Planned Features
- [ ] Complete Backend API migration (Students, Leads, Universities)
- [ ] Frontend React + Vite separation
- [ ] Enhanced authentication with refresh tokens
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced search and filtering
- [ ] Export functionality (PDF, Excel)
- [ ] Email templates and automation
- [ ] Analytics dashboard
- [ ] Mobile responsive improvements

---

**Maintained by**: CRM Development Team  
**Last Updated**: January 17, 2026
