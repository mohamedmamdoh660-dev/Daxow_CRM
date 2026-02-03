# Admission CRM - Dynamic Study Abroad Management System

A specialized CRM for managing international student admissions with **metadata-driven architecture** and dynamic custom fields.

## 🎯 Core Features

- **Dynamic Custom Fields**: Add custom fields without database migrations using JSONB
- **Application Pipeline**: Kanban board for managing student applications
- **Lead Management**: Complete lead tracking with notes, documents, emails, and tasks
- **Student Management**: Full student lifecycle from registration to graduation
- **Document Management**: Grid-based document viewer with preview and download
- **Timeline & Audit Log**: Complete activity tracking across all modules
- **Lead to Student Conversion**: Seamless conversion workflow with auto-redirect
- **Automation Engine**: Webhooks and rule-based automation

## 🏗️ Architecture

This CRM uses a **hybrid database approach**:
- **Fixed columns** for essential, indexable data (ID, Email, Phone)
- **JSONB columns** for custom user-defined fields
- **FieldDefinition table** manages UI rendering and validation

### Key Design Principles
- ✅ No hard-coded fields in forms
- ✅ Dynamic form rendering based on field definitions
- ✅ Flexible schema without constant migrations
- ✅ Similar to Zoho CRM's customization model

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo>
cd admission-crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
```bash
# Copy the example .env file
cp .env.example .env

# Edit .env and add your PostgreSQL connection string
# DATABASE_URL="postgresql://user:password@localhost:5432/admission_crm"
```

4. Run database migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. (Optional) Seed the database:
```bash
npx prisma db seed
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **UI**: Tailwind CSS + Shadcn UI
- **State Management**: React Hooks (useState, useEffect)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Storage**: Local + Supabase

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[User Management](./docs/user-management/)** - Authentication and profile management
  - [Authentication](./docs/user-management/authentication.md) - Login/logout flow and JWT security
  - [Profile Management](./docs/user-management/profile.md) - User profiles and settings

- **[Lead Management](./docs/lead-management/)** - Lead tracking, notes, documents, emails, tasks, and conversion
  - [Overview](./docs/lead-management/overview.md) - Complete feature guide
  - [Components](./docs/lead-management/components.md) - Technical component docs
  - [Database Schema](./docs/lead-management/database-schema.md) - Data structure
  - [Backend Requirements](./docs/lead-management/backend-requirements.md) - API specifications

- **[Student Management](./docs/student-management/)** - Student registration, profiles, applications, timeline
  - [Module Overview](./docs/student-management/README.md) - Complete module documentation
  - [Student Detail Page](./docs/student-management/student-detail-page.md) - Detail page specs
  - [Student Module](./docs/student-management/student-module.md) - Form and features

- **[Data Validation](./docs/data-validation-rules.md)** - Form validation rules and constraints
- **[Permissions System](./docs/permissions-system.md)** - Role-based access control (planned)

## ✨ Recent Enhancements (January 2026)

### UI/UX Improvements ✅
- **Grid Card Layouts**: Modern document display with 3-column responsive grids across Lead and Student modules
- **Image Previews**: Thumbnail previews for uploaded documents with fallback icons
- **Consistent Design**: Unified card-based layouts matching across all modules
- **Hover Effects**: Smooth transitions and shadow effects for better interactivity

### Technical Upgrades ✅
- **Client Component Architecture**: Converted Student Detail page to Client Component for enhanced interactivity
- **Client-Side Data Fetching**: Implemented fetch API calls for dynamic data loading
- **Event Handler Support**: Fixed "Event handlers cannot be passed to Client Component props" errors
- **Status Configuration**: Local state management for dynamic status displays

### Features Implemented ✅
- **Lead to Student Conversion**: One-click conversion with automatic data migration and redirect to edit page
- **Document Grid View**: Beautiful card-based document display with preview, metadata, and action buttons
- **Timeline Tracking**: Automatic event logging for all student and lead activities
- **Application Management**: Add applications directly from student detail page

### Backend Integration ✅
- **Lead Conversion API**: `/api/leads/[id]/convert` endpoint for student creation
- **Document Upload**: File upload with local and Supabase storage support
- **Timeline Events**: Automatic timeline creation for all major actions

## 📁 Project Structure

See [STRUCTURE.md](./STRUCTURE.md) for detailed folder organization.

```
app/          - Next.js pages and API routes
components/   - Reusable UI components
lib/          - Core utilities and business logic
prisma/       - Database schema and migrations
actions/      - Server actions
```

## 🔧 Database Schema

The schema includes:

### Catalog
- `University` - Universities
- `Campus` - University campuses
- `Program` - Study programs (the "products")

### CRM
- `Student` - Student contacts
- `Application` - Student applications (deals)
- `Agent` - Partner agents (lead sources)

### Metadata
- `FieldDefinition` - Custom field definitions
- `Stage` - Configurable pipeline stages

### System
- `Webhook` - Automation webhooks
- `AutomationRule` - Business rules
- `Document` - File management
- `TimelineEvent` - Audit log
- `Task` - To-do items

## 🎨 Key Features in Development

### Phase 1: Foundation ✅
- [x] Project setup with Next.js and TypeScript
- [x] Prisma schema with JSONB architecture
- [x] Folder structure

### Phase 2: Core Modules (In Progress)
- [ ] Field Manager API
- [ ] Dynamic Form Renderer
- [ ] Student CRUD
- [ ] Program Catalog

### Phase 3: Pipeline
- [ ] Kanban Board
- [ ] Drag-and-drop
- [ ] Stage management

### Phase 4: Automation
- [ ] Webhook system
- [ ] Automation rules
- [ ] Script sandbox

## 🤝 Contributing

This is a specialized CRM project. For questions or contributions, please contact the development team.

## 📄 License

Proprietary - All rights reserved

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
