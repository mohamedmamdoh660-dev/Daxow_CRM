# Timeline & Audit System

## Overview
The CRM features a comprehensive **Auto-Tracking Timeline** that records all significant interactions and data changes for Leads and Students. This serves as both an activity log and an audit trail.

## Logic: "Field-Level Tracking"
Instead of generic "Updated" messages, the system calculates exactly what changed.

### How it Works
1. **Frontend Interception**: When a user submits an Edit form.
2. **Diff Calculation**: The system compares `Existing Data` vs `New Data`.
3. **Change Detection**: For every field that differs, a change record is formatted: `Field: "Old Value" → "New Value"`.
4. **Event Creation**: A `TimelineEvent` is created with type `UPDATED` and the formatted changes in the `body/description`.

## Tracking Capabilities
The system currently tracks changes for:
- **Status & Pipeline Stages**
- **Personal Info** (Name, Email, Phone)
- **Assignment** (Owner changes)
- **Preferences** (Countries, Intakes)
- **Custom Fields**

## Data Structure
```prisma
model TimelineEvent {
  id          String   @id @default(cuid())
  title       String   // e.g. "Status Updated"
  type        String   // 'NOTE', 'EMAIL', 'MEETING', 'TASK', 'UPDATED'
  description String?  // Contains the diff details
  metadata    Json?    // Extra data (e.g. email ID, task ID)
  
  // Relations
  studentId   String?
  leadId      String?
}
```

## UI Presentation
The Timeline component (`TimelineView`) renders these events chronologically, using distinct icons for different activity types (Edit, Call, Email, Note).
