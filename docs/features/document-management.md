# Document Management

## Overview
The CRM supports two types of documents within the Application Detail page:

1. **Student Documents** — Documents from the student's profile (read-only from the application view)
2. **Application Documents** — Documents specific to an application (uploadable from the application view)

## Student Documents Tab

Displays all documents attached to the student's profile. This tab is **read-only** — to manage student documents, use the "Manage Student Docs" button which links to the student edit page.

### Required Document Indicators
A status panel shows whether the following required documents are present:

| Document | `fileType` values (case-insensitive) |
|---|---|
| Passport | `passport` |
| High School Transcript | `high_school_transcript`, `transcript` |
| Personal Photo | `photo`, `personal_photo` |

Matching is **case-insensitive** with alias support.

## Application Documents Tab

### Upload Flow
1. Select a **Document Type** from the dropdown
2. Drag-and-drop or click to upload a file
3. The file is uploaded to storage (`/api/upload`)
4. A document record is created (`/api/documents`)
5. The application data is refreshed to show the new document

### Document Types
| Value | Label |
|---|---|
| `payment_receipt` | Payment Receipt |
| `initial_acceptance` | Initial Acceptance |
| `final_acceptance` | Final Acceptance |
| `other` | Other |

### Accepted File Types
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, Word (.doc, .docx)
- Max size: 10MB

### Delete Flow
Deleting a document shows a confirmation dialog, then:
1. Deletes from Supabase storage (if applicable)
2. Deletes the database record
3. Refreshes the application data

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload file to storage |
| `POST` | `/api/documents` | Create document record |
| `DELETE` | `/api/documents/[id]` | Delete document |

## Database Model

```prisma
model Document {
  id            String   @id @default(cuid())
  applicationId String?
  studentId     String?
  leadId        String?
  fileName      String
  fileType      String
  fileUrl       String
  fileSize      Int?
  metadata      Json     @default("{}")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## Files
- Frontend: `app/(dashboard)/applications/[id]/page.tsx`
- Upload API: `app/api/upload/route.ts`
- Documents API: `app/api/documents/route.ts`, `app/api/documents/[id]/route.ts`
- Backend includes: `crm-backend/src/modules/applications/applications.service.ts`
- Student creation with docs: `crm-backend/src/modules/students/students.service.ts`

## Fixed Issues

### Documents not saved during student creation (2026-02-14)
**Problem:** When creating a new student via the registration wizard, uploaded documents were only stored as a JSON array in the `student.documents` field — NOT as proper records in the `Document` table. This means they wouldn't appear in the Student Docs tab (which reads from `studentDocuments` relation → `Document` table).

**Root Cause:** The `create()` method in `students.service.ts` was doing:
```typescript
documents: documents || [], // stores as JSON, not DB records
```

**Fix:** After creating the student, the service now loops through each document and creates a proper `Document` record:
```typescript
await this.prisma.document.create({
    data: {
        studentId: student.id,
        fileName: doc.fileName,
        fileType: doc.type,
        fileUrl: doc.fileUrl,
        ...
    },
});
```
