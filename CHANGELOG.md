# CHANGELOG

All notable changes to the Admission CRM project will be documented in this file.

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
