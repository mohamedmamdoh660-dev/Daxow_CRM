# Student Detail Page - Complete Documentation

> **Last Updated:** January 16, 2026  
> **Module:** Student Management  
> **Path:** `/students/[id]`  
> **Type:** Client Component ⭐

---

## Overview

The Student Detail Page provides a comprehensive view of all student information with tabbed navigation, timeline tracking, and application management.

**Architecture:** Client Component with client-side data fetching

---

## Component Architecture ⭐ NEW

### Client Component Conversion (Jan 16, 2026)

The Student Detail Page was converted from a Server Component to a Client Component to enable interactive features and event handlers.

**File:** [`app/(dashboard)/students/[id]/page.tsx`](file:///Users/mdarwish/CRM/app/(dashboard)/students/[id]/page.tsx)

**Key Changes:**
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';

export default function StudentDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params); // Unwrap params Promise
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Client-side data fetching
  useEffect(() => {
    async function fetchStudent() {
      try {
        const response = await fetch(`/api/students/${id}`);
        if (response.ok) {
          const data = await response.json();
          setStudent(data);
        }
      } catch (error) {
        console.error('Error fetching student:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudent();
  }, [id]);
  
  if (loading) return <div>Loading...</div>;
  if (!student) return <div>Student not found</div>;
  
  // ... rest of component
}
```

### Why Client Component?

**Reasons for conversion:**
1. **Event Handlers**: Copy button, modal triggers require client-side JS
2. **Interactive State**: Tab navigation, modal state management
3. **Dynamic Updates**: Real-time status changes
4. **User Interactions**: Document viewer, application actions

**Trade-offs:**
- ✅ Full interactivity and event handling
- ✅ Client-side state management
- ❌ No server-side rendering for initial data
- ❌ Requires loading state

### Status Configuration

Since we moved to Client Component, `statusConfig` must be defined locally:

```typescript
const studentStatuses = [
  { label: 'Applicant', color: '#3b82f6' },
  { label: 'Active', color: '#10b981' },
  { label: 'Graduated', color: '#8b5cf6' },
  { label: 'Withdrawn', color: '#ef4444' },
  { label: 'Suspended', color: '#f59e0b' },
];

const statusConfig = studentStatuses.find(s => s.label === student.status);
```

---

## Page Structure

### URL Pattern
```
/students/[id]
```

**Example:**  
`/students/cmkcg1ekw000cc9s894xiczco`

---

## Header Section

### Profile Header

**Components:**
- Student photo (64x64px rounded) or gradient initial
- Student full name
- Email address
- Phone number
- Student ID with copy button
- Document count badge
- Status badge (Active/Inactive)
- Actions dropdown menu

**Actions Menu:**
- Edit Student → `/students/[id]/edit`
- Send Email
- Generate Report
- Delete Student

---

## Tab Navigation

The page uses 6 tabs for organizing student information:

### 1. Overview Tab ✅

**Purpose:** Core student information summary

**Sections:**

#### Personal Information Card
- First Name, Last Name
- Gender
- Date of Birth
- Nationality
- Passport Number, Issue Date, Expiry Date

#### Contact Information Card
- Email (with mailto link)
- Mobile (with tel link)
- Address details (Line 1, City, State, Postal Code, Country)

#### Student Category Card
- Transfer Student (Yes/No)
- Has T.C. (Yes/No)
- T.C. Number (if applicable)
- Blue Card (Yes/No)

#### Created By Card 🆕
Shows who created the student:
- **Agent:** Company name, contact person, email, phone
- **Staff:** Internal staff indicator

---

### 2. Documents Tab ✅

**Purpose:** Manage student documents

**Features:**
- Grid display (3 columns)
- Document type badges
- File size display
- Upload date
- Actions: View, Download, Delete

**Supported Document Types:**
- Personal Photo
- Passport Copy
- High School Certificate
- High School Transcript
- Other Documents

**Empty State:** "No documents uploaded yet"

---

### 3. Applications Tab 🆕

**Purpose:** Manage student applications

**Header:**
- Tab title and description
- **Add Application** button (top right)

**Application Card Display:**
Each application shows:
- Program name with icon
- University name
- Application date
- Priority badge (High/Medium/Low)
- Status badge
- "View Details" button → `/applications/[id]`

**Add Application Button:**
- Location: Top right of tab
- Action: Redirects to `/applications/new?studentId=[id]`
- Icon: Plus icon

**Empty State:**
- Icon: Graduation cap
- Message: "No applications yet"
- CTA: "Create First Application" button

---

### 4. Academic Tab ✅

**Purpose:** Education history and qualifications

**Section: Education Level**
- Current education level

**Section: High School Information**
- Country
- School Name  
- GPA/Percentage

**Section: Bachelor Details** (Conditional)
Shown for Master/PhD students:
- Country
- University Name
- GPA

**Section: Master Details** (Conditional)
Shown for PhD students only:
- Country
- University Name
- GPA

---

### 5. Family Tab ✅

**Purpose:** Family contact information

**Section: Father Information**
- Father Name
- Father Mobile
- Father Occupation

**Section: Mother Information**
- Mother Name
- Mother Mobile
- Mother Occupation

---

### 6. Timeline Tab 🆕

**Purpose:** Complete audit trail of all student events

**Features:**
- Chronological event list (newest first)
- Visual timeline with connecting lines
- Event type labels
- Detailed descriptions
- Timestamps
- No event count badge (clean UI)

**Event Types Tracked:**

| Event Type | Trigger | Example Description |
|------------|---------|-------------------|
| Student Created | New registration | "Student Ahmed Ali was created" |
| Student Updated | Information edit | "Student information updated: firstName, email" |
| Photo Uploaded | Profile photo | "Profile photo updated" |
| Document Uploaded | Any document | "Document uploaded: passport.pdf (passport_copy)" |
| Application Created | New application | "Application created for Program X" |
| Application Status Changed | Status update | "Application status changed from Applied to Accepted" |

**Empty State:** "No timeline events yet"

**Display Format:**
```
●──────────────────────────────
│ Event Type
│ Event description with details
│ 🕐 Timestamp
└──────────────────────────────
```

---

## Database Queries

### Main Query

**File:** [`app/(dashboard)/students/[id]/page.tsx`](file:///Users/mdarwish/CRM/app/(dashboard)/students/[id]/page.tsx#L33)

```typescript
const student = await prisma.student.findUnique({
    where: { id },
    include: {
        studentDocuments: true,
        applications: {
            include: {
                program: {
                    include: {
                        university: true,
                    },
                },
            },
            orderBy: {
                applicationDate: 'desc',
            },
        },
        timeline: {
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        },
        agent: true,
    },
});
```

### Related Models

**Student Model:**
```prisma
model Student {
  id                 String
  // ... all fields
  status             String @default("Applicant")
  agentId            String?
  
  // Relations
  agent              Agent?
  applications       Application[]
  studentDocuments   Document[]
  timeline           TimelineEvent[]
}
```

**TimelineEvent Model:**
```prisma
model TimelineEvent {
  id            String
  entityType    String
  entityId      String
  studentId     String?
  eventType     String
  description   String
  metadata      Json
  performedBy   String?
  createdAt     DateTime
  
  student       Student?
}
```

---

## Automatic Timeline Logging

### How It Works

Timeline events are automatically created when:

1. **Student Created** → [`POST /api/students`](file:///Users/mdarwish/CRM/app/api/students/route.ts)
2. **Student Updated** → [`PATCH /api/students/[id]`](file:///Users/mdarwish/CRM/app/api/students/[id]/route.ts)
3. **Document Uploaded** → [`POST /api/documents`](file:///Users/mdarwish/CRM/app/api/documents/route.ts)

### Implementation

**Helper Function:**  
[`lib/timeline.ts`](file:///Users/mdarwish/CRM/lib/timeline.ts)

```typescript
import { createTimelineEvent, TimelineEventTypes } from '@/lib/timeline';

await createTimelineEvent({
    entityType: 'student',
    entityId: studentId,
    studentId,
    eventType: TimelineEventTypes.STUDENT_UPDATED,
    description: 'Student information updated: firstName, email',
    metadata: { changedFields: ['firstName', 'email'] },
});
```

### Field Change Tracking

The system automatically tracks which fields were changed:

```typescript
const changedFields = getChangedFields(oldData, newData);
// Returns: ['firstName', 'email', 'mobile']

const formatted = formatFieldChanges(changedFields);
// Returns: "firstName, email, and mobile"
```

---

## UI Components

### Tabs Component
```tsx
<Tabs defaultValue="overview">
  <TabsList className="grid w-full grid-cols-6">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="documents">Documents ({count})</TabsTrigger>
    <TabsTrigger value="applications">Applications ({count})</TabsTrigger>
    <TabsTrigger value="academic">Academic</TabsTrigger>
    <TabsTrigger value="family">Family</TabsTrigger>
    <TabsTrigger value="timeline">Timeline</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    {/* Content */}
  </TabsContent>
</Tabs>
```

### Card Components
- **Card** - Section container
- **CardHeader** - Title and description
- **CardTitle** - Section title with icon
- **CardContent** - Main content area

### Badge Components
- **Status Badge** - Active/Inactive indicator
- **Priority Badge** - High/Medium/Low
- **Count Badge** - Document/Application counts

---

## Actions & Navigation

### Page Actions

| Action | Trigger | Destination |
|--------|---------|-------------|
| Edit Student | Header menu | `/students/[id]/edit` |
| Add Application | Applications tab button | `/applications/new?studentId=[id]` |
| View Application | Application card | `/applications/[applicationId]` |
| View Document | Document action | Opens in new tab |
| Send Email | Header menu | Email dialog |

### URL Parameters

**Add Application:**
```
/applications/new?studentId=cmkcg1ekw000cc9s894xiczco
```

This pre-fills the student selection in the application form.

---

## Access Control

### Permissions Required

- `students:read` - View student details
- `students:update` - Edit student
- `students:delete` - Delete student
- `documents:read` - View documents
- `documents:create` - Upload documents
- `documents:delete` - Delete documents
- `applications:create` - Create applications

---

## API Endpoints Used

### Student APIs
- `GET /api/students/[id]` - Fetch student data
- `PATCH /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Document APIs
- `POST /api/documents` - Create document record
- `POST /api/upload` - Upload file
- `DELETE /api/documents/[id]` - Delete document

### Timeline APIs
- Timeline events created automatically (no direct API calls from frontend)

---

## Responsive Design

### Desktop (>768px)
- 2-column grid for Overview cards
- 3-column grid for Documents
- Full-width tabs

### Mobile (<768px)
- Single-column stack
- Horizontal scrollable tabs
- Full-width cards

---

## Error Handling

### Not Found (404)
If student doesn't exist:
```typescript
if (!student) {
    notFound(); // Next.js 404 page
}
```

### Empty States

Each tab has appropriate empty states:
- **Documents:** "No documents uploaded yet"
- **Applications:** "No applications yet" with CTA
- **Timeline:** "No timeline events yet"

---

## Performance

### Data Loading
- Single database query with `include`
- Nested relations pre-loaded
- No N+1 query issues

### Optimization
- Timeline limited to 50 most recent events
- Documents/Applications ordered by date
- Lazy loading for tab content

---

## Future Enhancements

### Planned Features

1. **Real-time Updates**
   - WebSocket for live timeline
   - Auto-refresh on changes

2. **Enhanced Timeline**
   - Filter by event type
   - Date range picker
   - Search events
   - Export timeline

3. **Bulk Actions**
   - Bulk document upload
   - Bulk email to students

4. **Communication**
   - Email history tab
   - SMS history
   - Call logs

5. **Notes & Comments**
   - Add internal notes
   - Comment on timeline events

---

## Testing Checklist

- [ ] All tabs display correctly
- [ ] Timeline shows events
- [ ] Add Application button works
- [ ] Document upload/delete works
- [ ] Creator section shows correct type (Agent/Staff)
- [ ] Status badge displays
- [ ] All links navigate correctly
- [ ] Empty states display properly
- [ ] Responsive design works
- [ ] Timeline logs events automatically

---

## Troubleshooting

### Client Component Issues

**"Event handlers cannot be passed to Client Component props"**

**Solution:**
1. Ensure file has `'use client'` directive at top
2. Check that event handlers are defined in client component
3. Verify no server-side functions (like `notFound()`) are used

**"ReferenceError: statusConfig is not defined"**

**Solution:**
1. Define `studentStatuses` array locally in component
2. Calculate `statusConfig` from `student.status`
3. Ensure it's defined before use in JSX

**Data fetching issues**

**Solution:**
1. Check API endpoint `/api/students/[id]` exists
2. Verify fetch URL matches API route
3. Add error handling for failed requests
4. Check network tab for response status

### Timeline Not Showing Events

**Check:**
1. Is `timeline` included in Prisma query?
2. Are timeline events being created in APIs?
3. Check console for `createTimelineEvent` logs

### Add Application Button Not Working

**Check:**
1. Is `/applications/new` page created?
2. Does it handle `studentId` query parameter?
3. Check browser console for errors

### Documents Not Displaying

**Check:**
1. Are documents uploaded to correct location?
2. Is `fileUrl` accessible?
3. Check `studentDocuments` relation

---

## Related Documentation

- [Student Form Module](file:///Users/mdarwish/CRM/docs/student-management/student-module.md)
- [Timeline Logging](file:///Users/mdarwish/.gemini/antigravity/brain/c9093776-a6e1-431e-9cb9-704b53520157/walkthrough.md)
- [Document Management](file:///Users/mdarwish/CRM/docs/student-management/student-module.md#section-6-document-attachments)

---

## File Locations

**Page Component:**  
[`app/(dashboard)/students/[id]/page.tsx`](file:///Users/mdarwish/CRM/app/(dashboard)/students/[id]/page.tsx)

**Edit Page:**  
[`app/(dashboard)/students/[id]/edit/page.tsx`](file:///Users/mdarwish/CRM/app/(dashboard)/students/[id]/edit/page.tsx)

**Timeline Utility:**  
[`lib/timeline.ts`](file:///Users/mdarwish/CRM/lib/timeline.ts)

**APIs:**
- [`app/api/students/route.ts`](file:///Users/mdarwish/CRM/app/api/students/route.ts)
- [`app/api/students/[id]/route.ts`](file:///Users/mdarwish/CRM/app/api/students/[id]/route.ts)
- [`app/api/documents/route.ts`](file:///Users/mdarwish/CRM/app/api/documents/route.ts)

---

**Complete!** ✅  
Student Detail Page is fully documented with all features, APIs, and timeline logging.
