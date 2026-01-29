# Quick Setup Guide

## 🚀 Getting Started

### 1. Install Dependencies (Already Complete)
```bash
✅ npm install
```

### 2. Set Up PostgreSQL Database

Choose ONE of these options:

#### Option A: Free Cloud Database (Recommended)

**Supabase** (Easiest):
1. Go to [supabase.com](https://supabase.com)
2. Create free account
3. Create new project
4. Copy "Connection string" (Direct connection, not pooler)
5. It looks like: `postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

**Neon** (Serverless):
1. Go to [neon.tech](https://neon.tech)
2. Sign up
3. Create project
4. Copy connection string

#### Option B: Local PostgreSQL

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14
createdb admission_crm

# Your connection string:
# postgresql://localhost:5432/admission_crm
```

```

### 3. Set Up Storage (Supabase)

1. Go to **Storage** in your Supabase dashboard.
2. Create a new bucket named: `crm-uploads`
3. Make it **Public**.
4. (Optional) Set file size limit to 10MB and allowed MIME types (images, pdf).
5. Files will be organized automatically into `students/` and `leads/` folders.

### 4. Configure Database Connection

Update `prisma.config.ts`:

```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "YOUR_DATABASE_URL_HERE", // ← Paste your URL here
  },
});
```

### 4. Initialize Database

```bash
# Create tables
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Load sample data (optional but recommended)
npx prisma db seed
```

### 5. Start the Application

```bash
npm run dev
```

Open: [http://localhost:3000/students](http://localhost:3000/students)

---

## 🧪 Test the System

1. **View Students**: Go to `/students` - should be empty initially
2. **Create Student**: Click "Add Student"
   - Fill in Name, Email, Phone
   - See custom fields appear automatically!
   - Submit form
3. **View Detail**: Click on the student
   - See Overview tab with all fields
   - See Timeline tab with "Student created" event
4. **Check Database**: 
   ```bash
   npx prisma studio
   ```
   - Open Student table
   - See `metadata` column contains your custom fields as JSON!

---

## 📊 What's in the Seed Data

- **8 Pipeline Stages**: New → Documents Submitted → Applied → Enrolled
- **6 Custom Fields** for Student module:
  - Preferred Intake (select)
  - English Test (select)
  - Test Score (number)
  - Budget Range (select)
  - Preferred Countries (multiselect)
  - Special Requirements (textarea)
- **3 Universities**: Edinburgh, Toronto, Melbourne
- **2 Programs**: MSc Computer Science, MBA
- **1 Sample Agent**

---

## ❓ Troubleshooting

### Build Error: "requires either adapter or accelerateUrl"
This means Prisma client can't find the database connection. Make sure you updated `prisma.config.ts` with your database URL.

### Migration Error: "Cannot connect to database"
Check that:
- Database URL is correct in `prisma.config.ts`
- Database server is running
- Firewall allows connection

### "Module not found" errors
Run: `npm install`

### Prisma Client errors
Run: `npx prisma generate`

---

## 📁 Important Files

- `prisma.config.ts` - Database connection (EDIT THIS)
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Sample data
- `app/(dashboard)/students/` - Student module
- `lib/field-manager.ts` - Custom field logic
- `components/forms/dynamic-form.tsx` - Dynamic form renderer

---

## 🎯 Next Steps After Setup

1. ✅ Create some students to test the system
2. ✅ View the student detail page tabs
3. ✅ Inspect the database to see JSONB metadata
4. 📝 Build the Field Manager UI to add custom fields
5. 📝 Build the Program catalog module
6. 📝 Build the Application Pipeline (Kanban)
7. 📝 Add Webhooks system

---

## 🆘 Need Help?

Check the comprehensive documentation:
- [README.md](file:///Users/mdarwish/CRM/README.md) - Project overview
- [STRUCTURE.md](file:///Users/mdarwish/CRM/STRUCTURE.md) - Folder structure
- [walkthrough.md](file:///Users/mdarwish/.gemini/antigravity/brain/79bfdb5e-837c-4a30-8da0-5fabb21bd01f/walkthrough.md) - Implementation details
- [implementation_plan.md](file:///Users/mdarwish/.gemini/antigravity/brain/79bfdb5e-837c-4a30-8da0-5fabb21bd01f/implementation_plan.md) - Full roadmap
