# Backend Requirements - Lead Management

> **الأولوية:** High Priority  
> **التقدير الزمني:** 2-3 Weeks  
> **المتطلبات الأساسية:** Database setup complete

---

## 📋 Table of Contents

1. [API Endpoints Required](#api-endpoints)
2. [Authentication & Permissions](#authentication)
3. [File Storage Setup](#file-storage)
4. [Email Service Integration](#email-service)
5. [Environment Variables](#environment-variables)
6. [Implementation Priority](#implementation-priority)

---

## 1️⃣ API Endpoints Required

### A. Assignment APIs

#### POST `/api/leads/:leadId/assign`
**الغرض:** إسناد lead لموظف

**Request Body:**
```typescript
{
  assignedTo: string;  // user ID
  reason?: string;     // optional reason for assignment
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    leadId: string;
    assignedTo: string;
    assignedAt: Date;
    assignedBy: string;
  }
}
```

**Business Logic:**
- Check if user can receive leads (`can_receive_leads = true`)
- Check user's `daily_lead_limit`
- Update `leads.assigned_to`
- Update `leads.assigned_at`
- Record in `assignment_history`
- Send notification to new assignee

---

#### GET `/api/leads/:leadId/assignment-history`
**الغرض:** عرض سجل الإسناد

**Response:**
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    assignedFrom: User | null;
    assignedTo: User | null;
    assignedBy: User;
    reason: string;
    assignmentType: 'manual' | 'auto' | 'reassignment';
    createdAt: Date;
  }>
}
```

---

### B. Notes APIs

#### POST `/api/leads/:leadId/notes`
**الغرض:** إضافة ملاحظة جديدة

**Request Body:**
```typescript
{
  content: string;
  visibility: 'public' | 'team' | 'private';
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    leadId: string;
    content: string;
    createdBy: User;
    visibility: string;
    createdAt: Date;
  }
}
```

**Validation:**
- `content` must be at least 5 characters
- `visibility` must be valid enum value
- User must have permission to add notes

---

#### GET `/api/leads/:leadId/notes`
**الغرض:** عرض كل ملاحظات الـ lead

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  visibility?: 'public' | 'team' | 'private';
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    notes: Array<{
      id: string;
      content: string;
      createdBy: User;
      visibility: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }
}
```

**Business Logic:**
- Filter by visibility based on user role
- Order by `created_at DESC`
- Exclude deleted notes

---

#### PUT `/api/leads/:leadId/notes/:noteId`
**الغرض:** تعديل ملاحظة

**Request Body:**
```typescript
{
  content: string;
}
```

**Permissions:**
- User must be the creator OR admin

---

#### DELETE `/api/leads/:leadId/notes/:noteId`
**الغرض:** حذف ملاحظة (soft delete)

**Permissions:**
- User must be the creator OR team lead OR admin

**Business Logic:**
- Set `is_deleted = true`
- Record `deleted_by` and `deleted_at`
- Don't actually delete from DB

---

### C. Documents APIs

#### POST `/api/leads/:leadId/documents`
**الغرض:** رفع مستند جديد

**Request:** `multipart/form-data`
```typescript
{
  file: File;
  category?: string;  // 'passport', 'transcript', etc
  description?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    name: string;
    fileType: string;
    fileSize: number;
    publicUrl: string;
    category: string;
    uploadedAt: Date;
  }
}
```

**Validation:**
- Max file size: 50MB
- Allowed types: PDF, JPG, PNG, DOCX
- Scan for malware (recommended)

**Storage:**
- Upload to S3/Cloudinary
- Generate unique filename
- Store path in database

---

#### GET `/api/leads/:leadId/documents`
**الغرض:** عرض كل مستندات الـ lead

**Response:**
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    fileType: string;
    fileSize: number;
    publicUrl: string;
    category: string;
    uploadedAt: Date;
    uploadedBy: User;
  }>
}
```

---

#### GET `/api/leads/:leadId/documents/:documentId/download`
**الغرض:** تنزيل مستند

**Response:** File stream

**Headers:**
```
Content-Type: application/pdf (or appropriate type)
Content-Disposition: attachment; filename="..."
```

**Business Logic:**
- Check user permissions
- Count download (analytics)
- Return file from storage

---

#### DELETE `/api/leads/:leadId/documents/:documentId`
**الغرض:** حذف مستند

**Permissions:**
- Uploader OR admin

**Business Logic:**
- Soft delete (set `is_deleted = true`)
- Keep file in storage (for recovery)
- Option to hard delete after 30 days

---

### D. Email APIs

#### POST `/api/leads/:leadId/emails`
**الغرض:** إرسال إيميل جديد

**Request Body:**
```typescript
{
  subject: string;
  body: string;
  templateId?: string;  // optional template
  ccEmails?: string[];
  bccEmails?: string[];
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    subject: string;
    status: 'pending' | 'sent';
    sentAt: Date;
    externalId: string;  // from email service
  }
}
```

**Business Logic:**
1. Validate email addresses
2. Apply template if provided
3. Send via email service (SendGrid/Resend)
4. Store in `lead_emails`
5. Track delivery status

---

#### GET `/api/leads/:leadId/emails`
**الغرض:** عرض سجل الإيميلات

**Response:**
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    subject: string;
    sentBy: User;
    sentAt: Date;
    status: string;
    template: string;
    openCount: number;
    clickCount: number;
  }>
}
```

---

#### GET `/api/leads/:leadId/emails/:emailId`
**الغرض:** عرض تفاصيل إيميل واحد

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    subject: string;
    body: string;
    from: string;
    to: string;
    cc: string[];
    bcc: string[];
    sentBy: User;
    sentAt: Date;
    deliveredAt: Date;
    openedAt: Date;
    status: string;
    template: string;
  }
}
```

---

### E. Users APIs (للـ Assignment)

#### GET `/api/users/can-receive-leads`
**الغرض:** عرض الموظفين اللي ممكن يستلموا leads

**Response:**
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    currentLeadCount: number;
    dailyLeadLimit: number | null;
  }>
}
```

**Business Logic:**
- Filter: `is_active = true AND can_receive_leads = true`
- Include current lead count
- Show if reached daily limit

---

## 2️⃣ Authentication & Permissions

### Authentication
```typescript
// Middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  const user = verifyToken(token);
  req.user = user;
  next();
};
```

### Permission Checks

```typescript
// Example: Can user assign leads?
const canAssignLeads = (user: User): boolean => {
  return ['admin', 'team_lead', 'sales_manager'].includes(user.role);
};

// Example: Can user delete notes?
const canDeleteNote = (user: User, note: Note): boolean => {
  if (user.role === 'admin') return true;
  if (user.id === note.createdBy) return true;
  if (user.role === 'team_lead' && isInSameTeam(user, note.createdBy)) return true;
  return false;
};
```

### Recommended Structure
```typescript
// permissions.ts
export const Permissions = {
  leads: {
    assign: ['admin', 'team_lead', 'sales_manager'],
    reassign: ['admin', 'team_lead'],
    view: ['admin', 'team_lead', 'sales_manager', 'counselor'],
  },
  notes: {
    create: ['admin', 'team_lead', 'sales_manager', 'counselor'],
    delete: ['admin', 'team_lead'], // or own notes
    view: ['admin', 'team_lead', 'sales_manager', 'counselor'],
  },
  documents: {
    upload: ['admin', 'team_lead', 'sales_manager'],
    delete: ['admin', 'team_lead'], // or uploader
    download: ['admin', 'team_lead', 'sales_manager', 'counselor'],
  }
};
```

---

## 3️⃣ File Storage Setup

### Recommended: AWS S3

```typescript
// config/s3.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = async (
  file: Buffer,
  filename: string,
  mimetype: string
): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `leads/documents/${Date.now()}-${filename}`,
    Body: file,
    ContentType: mimetype,
    ACL: 'private', // or 'public-read'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

export const downloadFromS3 = async (key: string): Promise<Buffer> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  };

  const result = await s3.getObject(params).promise();
  return result.Body as Buffer;
};
```

### Alternative: Cloudinary

```typescript
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  file: Buffer,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(file);
  });
};
```

---

## 4️⃣ Email Service Integration

### Option 1: SendGrid

```typescript
// config/sendgrid.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({
  to,
  from,
  subject,
  html,
  trackOpens = true,
  trackClicks = true,
}: {
  to: string;
  from: string;
  subject: string;
  html: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
}) => {
  const msg = {
    to,
    from,
    subject,
    html,
    trackingSettings: {
      clickTracking: { enable: trackClicks },
      openTracking: { enable: trackOpens },
    },
  };

  const result = await sgMail.send(msg);
  return {
    messageId: result[0].headers['x-message-id'],
    status: result[0].statusCode,
  };
};
```

### Option 2: Resend

```typescript
// config/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  from,
  subject,
  html,
}: {
  to: string;
  from: string;
  subject: string;
  html: string;
}) => {
  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  return {
    messageId: result.id,
  };
};
```

### Webhook للـ Tracking

```typescript
// /api/webhooks/email-events
export const handleEmailWebhook = async (req: Request, res: Response) => {
  const events = req.body; // SendGrid sends array of events

  for (const event of events) {
    const { email, event: eventType, timestamp, sg_message_id } = event;

    // Find email in database
    const leadEmail = await db.leadEmails.findOne({
      where: { externalId: sg_message_id }
    });

    if (!leadEmail) continue;

    // Update based on event type
    switch (eventType) {
      case 'delivered':
        await db.leadEmails.update(leadEmail.id, {
          deliveredAt: new Date(timestamp * 1000),
          status: 'delivered'
        });
        break;
      
      case 'open':
        await db.leadEmails.update(leadEmail.id, {
          openedAt: leadEmail.openedAt || new Date(timestamp * 1000),
          openCount: leadEmail.openCount + 1,
          status: 'opened'
        });
        break;
      
      case 'click':
        await db.leadEmails.update(leadEmail.id, {
          clickedAt: leadEmail.clickedAt || new Date(timestamp * 1000),
          clickCount: leadEmail.clickCount + 1,
          status: 'clicked'
        });
        break;
      
      case 'bounce':
        await db.leadEmails.update(leadEmail.id, {
          bouncedAt: new Date(timestamp * 1000),
          status: 'bounced',
          errorMessage: event.reason
        });
        break;
    }
  }

  res.json({ success: true });
};
```

---

## 5️⃣ Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crm"

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# AWS S3 (if using)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="admission-crm-documents"

# Cloudinary (alternative)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# SendGrid
SENDGRID_API_KEY="SG.xxx"
SENDGRID_FROM_EMAIL="noreply@yourcrm.com"
SENDGRID_WEBHOOK_SECRET="your-webhook-secret"

# Resend (alternative)
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="noreply@yourcrm.com"

# App Config
APP_URL="http://localhost:3000"
API_URL="http://localhost:3000/api"
NODE_ENV="development"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
```

---

## 6️⃣ Implementation Priority

### Phase 1: Core Setup (Week 1)
**Priority: Critical**

- [x] Create database schema
- [ ] Setup authentication middleware
- [ ] Implement basic CRUD for users
- [ ] Setup file storage (S3/Cloudinary)
- [ ] Environment configuration

### Phase 2: Assignment System (Week 1-2)
**Priority: High**

- [ ] POST /api/leads/:id/assign
- [ ] GET /api/users/can-receive-leads
- [ ] Assignment history logging
- [ ] Connect frontend dropdown

### Phase 3: Notes System (Week 2)
**Priority: High**

- [ ] POST /api/leads/:id/notes
- [ ] GET /api/leads/:id/notes
- [ ] PUT /api/leads/:id/notes/:noteId
- [ ] DELETE /api/leads/:id/notes/:noteId
- [ ] Connect frontend Notes section

### Phase 4: Documents System (Week 2-3)
**Priority: Medium**

- [ ] POST /api/leads/:id/documents (upload)
- [ ] GET /api/leads/:id/documents
- [ ] GET /api/leads/:id/documents/:id/download
- [ ] DELETE /api/leads/:id/documents/:id
- [ ] File validation & security
- [ ] Connect frontend Document Viewer

### Phase 5: Email System (Week 3)
**Priority: Medium**

- [ ] Email service setup (SendGrid/Resend)
- [ ] POST /api/leads/:id/emails
- [ ] GET /api/leads/:id/emails
- [ ] Webhook for email tracking
- [ ] Connect frontend Email Viewer

### Phase 6: Permissions (Week 3)
**Priority: Low (can be later)**

- [ ] Role-based access control
- [ ] Permission middleware
- [ ] Team-based visibility
- [ ] Activity logging

---

## 📊 Testing Requirements

### Unit Tests
- All API endpoints
- Permission checks
- File upload validation
- Email sending

### Integration Tests
- Full assignment flow
- Notes CRUD operations
- Document upload/download
- Email sending + webhooks

### Load Tests
- File upload performance
- Database query optimization
- API rate limiting

---

## 🔒 Security Checklist

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use ORM)
- [ ] XSS protection (sanitize outputs)
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] File upload validation (size, type, malware)
- [ ] Secure file storage (private URLs)
- [ ] Email validation
- [ ] Authentication on all protected routes
- [ ] Permission checks before actions
- [ ] Audit logging for sensitive operations

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-01-10  
**Estimated Effort:** 2-3 Weeks (1 developer)
