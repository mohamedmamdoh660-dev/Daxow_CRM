# Storage Strategy Documentation

## Overview
The CRM system uses a **Unified Storage Strategy** leveraging Supabase Storage. Instead of creating separate buckets for each module, we use a single public bucket named `crm-uploads` with a structured folder hierarchy.

## Bucket Configuration
- **Bucket Name:** `crm-uploads`
- **Privacy:** Public
- **Allowed MIME Types:** Images, PDF, Word Documents.

## Folder Structure
Files are organized within the bucket using the following hierarchy:

```
crm-uploads/
├── students/           # Student documents
│   └── {studentId}/    # Specific student folder
│       └── ...files
├── leads/              # Lead attachments
│   └── ...files
└── temp/               # Temporary uploads (pre-registration)
    └── ...files
```

## API Usage (`/api/upload`)
The backend endpoint handles file placement logic. You do not need to specify the bucket name from the frontend.

### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | File | The file to upload (required). |
| `folder` | String | (Optional) Explicit subfolder (e.g., `'leads'`). |
| `studentId` | String | (Optional) If provided, file goes to `students/{studentId}`. |

### Logic
1. If `folder` is provided -> `crm-uploads/{folder}/...`
2. If `studentId` is provided -> `crm-uploads/students/{studentId}/...`
3. Default -> `crm-uploads/temp/...`

## Frontend Implementation
When using the `FileUpload` component or calling the API directly:

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'leads'); // For leads
// OR
formData.append('studentId', '123'); // For students

await fetch('/api/upload', { method: 'POST', body: formData });
```
