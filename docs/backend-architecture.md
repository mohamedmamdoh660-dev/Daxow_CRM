# Backend Architecture (NestJS)

## Overview
As of January 2026, the CRM backend has been migrated to a standalone **NestJS** application located in `/crm-backend`. This separation ensures better scalability, type safety, and a cleaner architecture compared to Next.js API routes.

## Core Technologies
- **Framework**: NestJS (Modular, TypeScript-first)
- **Database ORM**: Prisma (Shared with Frontend via monorepo-style structure)
- **Validation**: `class-validator` & `class-transformer`
- **Documentation**: Swagger / OpenAPI
- **Testing**: Jest

## Project Structure (`/crm-backend`)
```
src/
├── app.module.ts          # Root module
├── main.ts                # Application entry point (Port 4000)
├── database/              # Global Database Module (Prisma Service)
├── students/              # Students CRUD Module
├── leads/                 # Leads Module
├── tasks/                 # Tasks Module (Polymorphic)
└── common/                # Shared logic (DTOs, Pipes, Guards)
```

## Key Features

### 1. Global Validation Pipe
All incoming requests are validated against DTOs (Data Transfer Objects) automatically.
```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

### 2. Standardized Response Format
APIs return consistent JSON structures. Exceptions are handled via global filters.

### 3. Swagger Documentation
Auto-generated API docs available at `http://localhost:4000/api/docs`.

### 4. Database Integration
The `DatabaseModule` exports functionality for other modules to access Prisma.

### 5. Auditing & User Tracking
The backend implements a lightweight auditing system to track who performed specific actions (Update/Delete):
- **User Decorator**: A custom `@User()` decorator extracts the user identity from the `x-performed-by` HTTP header.
- **Timeline Integration**: Service methods accept a `user` string and pass it to `TimelineService.createEvent` as `performedBy`.
- **Frontend Support**: All administrative actions send the `x-performed-by` header (currently defaulting to "Admin User" until Auth is fully integrated).

## Running the Backend
```bash
cd crm-backend
npm run start:dev
```
The server listens on **Port 4000**. The Frontend (Next.js) proxies requests or calls this port directly.
