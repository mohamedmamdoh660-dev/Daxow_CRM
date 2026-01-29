# Admission CRM - Project Structure

## 📁 Directory Structure

```
admission-crm/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Main application
│   │   ├── dashboard/            # Dashboard home
│   │   ├── students/             # Student management
│   │   │   ├── page.tsx          # List view
│   │   │   ├── [id]/             # Detail view
│   │   │   └── new/              # Create form
│   │   ├── applications/         # Application pipeline
│   │   │   ├── page.tsx          # Kanban board
│   │   │   ├── [id]/             # Application detail
│   │   │   └── new/              # Create application
│   │   ├── universities/         # University catalog
│   │   ├── programs/             # Program catalog
│   │   ├── agents/               # Agent management
│   │   ├── automation/           # Webhooks & rules
│   │   │   ├── webhooks/
│   │   │   └── rules/
│   │   └── settings/             # System settings
│   │       ├── fields/           # Custom field definitions
│   │       ├── stages/           # Pipeline stages
│   │       └── general/
│   ├── api/                      # API routes
│   │   ├── students/
│   │   ├── applications/
│   │   ├── programs/
│   │   ├── webhooks/
│   │   └── fields/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── main-layout.tsx
│   ├── forms/                    # Form components
│   │   ├── dynamic-form.tsx      # 🔥 Dynamic field renderer
│   │   ├── field-renderer.tsx
│   │   └── form-builder.tsx
│   ├── kanban/                   # Kanban board
│   │   ├── board.tsx
│   │   ├── column.tsx
│   │   └── card.tsx
│   ├── tables/                   # Data tables
│   │   ├── data-table.tsx
│   │   └── columns.tsx
│   └── record-view/              # Record detail views
│       ├── tabs.tsx
│       ├── overview.tsx
│       ├── related-lists.tsx
│       └── timeline.tsx
│
├── lib/                          # Core utilities
│   ├── prisma.ts                 # Prisma client singleton
│   ├── utils.ts                  # Utility functions
│   ├── validations.ts            # Zod schemas
│   ├── field-manager.ts          # 🔥 Custom field logic
│   ├── automation/               # Automation engine
│   │   ├── webhook-executor.ts
│   │   ├── rule-engine.ts
│   │   └── script-sandbox.ts
│   └── constants.ts              # Constants
│
├── types/                        # TypeScript types
│   ├── database.ts               # Prisma-generated types
│   ├── forms.ts                  # Form types
│   └── api.ts                    # API response types
│
├── hooks/                        # Custom React hooks
│   ├── use-dynamic-fields.ts     # Fetch field definitions
│   ├── use-students.ts
│   ├── use-applications.ts
│   └── use-webhooks.ts
│
├── actions/                      # Server Actions
│   ├── students.ts
│   ├── applications.ts
│   ├── programs.ts
│   ├── fields.ts
│   └── automation.ts
│
├── prisma/
│   ├── schema.prisma             # 🔥 Database schema with JSONB
│   ├── migrations/
│   └── seed.ts                   # Seed data
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env                          # Environment variables
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🔑 Key Architecture Components

### 1. **Metadata-Driven Forms** (`components/forms/dynamic-form.tsx`)
- Fetches field definitions from `FieldDefinition` table
- Renders inputs based on `fieldType`
- Stores data in JSONB `metadata` column

### 2. **Field Manager** (`lib/field-manager.ts`)
- CRUD operations for custom fields
- Validation logic
- Merges fixed + custom fields

### 3. **Automation Engine** (`lib/automation/`)
- **Webhook Executor**: Sends HTTP requests on events
- **Rule Engine**: Evaluates conditions and executes actions
- **Script Sandbox**: Safe JavaScript execution (VM2 or QuickJS)

### 4. **Kanban Board** (`components/kanban/`)
- Drag-and-drop with `@dnd-kit/core`
- Updates application status
- Logs stage changes in `stageHistory`

## 📋 Database Schema Highlights

### Core Tables
- `FieldDefinition` → Stores custom field metadata
- `University`, `Campus`, `Program` → Catalog (Products)
- `Student` → Contacts with JSONB `metadata`
- `Application` → Deals/Opportunities
- `Stage` → Configurable pipeline stages
- `Webhook`, `AutomationRule` → Automation

### JSONB Usage
Every core entity has a `metadata` JSONB column for custom fields:
```typescript
// Example: Student with custom fields
{
  "preferred_intake": "September 2024",
  "english_test": "IELTS",
  "ielts_score": 7.5,
  "budget_range": "20000-30000"
}
```

## 🚀 Next Steps

1. **Generate Prisma Client**: `npx prisma generate`
2. **Set up Database**: Configure `.env` with your PostgreSQL URL
3. **Run Migrations**: `npx prisma migrate dev --name init`
4. **Install Shadcn UI**: Components for forms, tables, dialogs
5. **Build Field Manager API**: CRUD for custom fields
6. **Create Dynamic Form Renderer**: Core feature
7. **Implement Kanban Board**: Application pipeline
8. **Add Automation System**: Webhooks and rules

## 📚 Technology Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Database**: PostgreSQL with Prisma ORM
- **State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit/core
- **Icons**: Lucide React
