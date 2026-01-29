# Components Documentation - Lead Management

> **للمطورين:** توثيق فني لكل الـ components المستخدمة

---

## 📋 Components List

1. [DocumentViewer](#documentviewer)
2. [EmailViewer](#emailviewer)
3. [Lead Detail Page](#lead-detail-page)

---

## 1️⃣ DocumentViewer

**الملف:** `/components/leads/document-viewer.tsx`  
**السطور:** 181  
**النوع:** Client Component

### Props Interface

```typescript
interface DocumentViewerProps {
  open: boolean;                    // حالة الـ modal (مفتوح/مغلق)
  onOpenChange: (open: boolean) => void;  // Callback للتحكم في الحالة
  documents: Document[];            // قائمة المستندات
  leadName: string;                 // اسم الـ Lead (للعرض)
  initialDocIndex?: number;         // المستند الأول (افتراضي: 0)
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: Date;
  url?: string;
}
```

### State Management

```typescript
const [currentIndex, setCurrentIndex] = useState(initialDocIndex);
```

### Main Functions

#### `handlePrevious()`
```typescript
const handlePrevious = () => {
  setCurrentIndex((prev) => (prev > 0 ? prev - 1 : documents.length - 1));
};
```
**الوظيفة:** الانتقال للمستند السابق (circular navigation)

#### `handleNext()`
```typescript
const handleNext = () => {
  setCurrentIndex((prev) => (prev < documents.length - 1 ? prev + 1 : 0));
};
```
**الوظيفة:** الانتقال للمستند التالي (circular navigation)

#### `handleDownloadAll()`
```typescript
const handleDownloadAll = () => {
  alert(`Downloading all documents for ${leadName}...`);
  console.log('Download all documents:', documents);
};
```
**الوظيفة:** تنزيل كل المستندات (mock - يحتاج backend)

#### `handleDownloadCurrent()`
```typescript
const handleDownloadCurrent = () => {
  alert(`Downloading ${currentDoc.name}...`);
  console.log('Download document:', currentDoc);
};
```
**الوظيفة:** تنزيل المستند الحالي (mock)

### UI Structure

```
Dialog (Shadcn)
└── DialogContent (max-w-5xl, h-90vh)
    └── Flex container
        ├── Sidebar (w-64)
        │   ├── Header (Documents + Download All)
        │   └── Document List
        │       └── Document Items (clickable)
        └── Main Viewer
            ├── DialogHeader
            │   ├── Document name
            │   ├── Counter (1/3)
            │   ├── Download button
            │   └── Close button (X)
            ├── Preview Area
            │   └── Placeholder (Document icon + info)
            └── Navigation Footer
                ├── Previous button
                ├── Document type
                └── Next button
```

### Styling Classes

- **Sidebar:** `w-64 border-r bg-muted/30 p-4 overflow-y-auto`
- **Active Document:** `bg-primary text-primary-foreground`
- **Inactive Document:** `hover:bg-accent`
- **Preview Area:** `flex-1 bg-muted/20 flex items-center justify-center p-6`

### Usage Example

```typescript
<DocumentViewer
  open={isDocViewerOpen}
  onOpenChange={setIsDocViewerOpen}
  documents={lead.documents}
  leadName={lead.fullName}
  initialDocIndex={selectedDocIndex}
/>
```

### Future Enhancements
- [ ] Actual PDF preview (using react-pdf)
- [ ] Image preview for JPG/PNG
- [ ] Zoom in/out functionality
- [ ] Full screen mode
- [ ] Download progress indicator

---

## 2️⃣ EmailViewer

**الملف:** `/components/leads/email-viewer.tsx`  
**السطور:** 114  
**النوع:** Client Component

### Props Interface

```typescript
interface EmailViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: {
    id: string;
    subject: string;
    sentBy: string;
    sentAt: Date;
    status: string;
    template?: string;
    to?: string;
    body?: string;
  } | null;
}
```

### Status Color Mapping

```typescript
const statusColors: Record<string, string> = {
  'Delivered': 'bg-green-100 text-green-800 border-green-200',
  'Opened': 'bg-blue-100 text-blue-800 border-blue-200',
  'Sent': 'bg-gray-100 text-gray-800 border-gray-200',
  'Failed': 'bg-red-100 text-red-800 border-red-200',
};
```

### Email Body Generation

```typescript
const emailBody = email.body || `Dear ${email.to || 'Recipient'},

Thank you for your interest in studying abroad through Admission CRM...

Best regards,
${email.sentBy}
Admission CRM Team`;
```
**ملاحظة:** Mock body - في الواقع سيأتي من database

### UI Structure

```
Dialog (Shadcn)
└── DialogContent (max-w-3xl, max-h-85vh)
    ├── DialogHeader
    │   ├── Title (with Mail icon)
    │   └── Description
    └── Content
        ├── Metadata Section (bg-muted)
        │   ├── From/To info
        │   ├── Status Badge
        │   ├── Date
        │   └── Template (if used)
        └── Message Section
            └── ScrollArea (h-400px)
                └── Message body (whitespace-pre-wrap)
```

### Styling Classes

- **Metadata Box:** `bg-muted/50 p-4 rounded-lg space-y-3`
- **Message Container:** `h-[400px] rounded-lg border bg-background p-4`
- **Message Text:** `whitespace-pre-wrap font-mono text-sm`

### Usage Example

```typescript
<EmailViewer
  open={isEmailViewerOpen}
  onOpenChange={setIsEmailViewerOpen}
  email={selectedEmail}
/>
```

### Future Enhancements
- [ ] Rich text/HTML email display
- [ ] Email threading (replies)
- [ ] Attachment previews
- [ ] Reply/Forward actions
- [ ] Print email option

---

## 3️⃣ Lead Detail Page

**الملف:** `/app/(dashboard)/leads/[id]/page.tsx`  
**السطور:** 669  
**النوع:** Client Component

### State Management

```typescript
// Modal states
const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
const [selectedDocIndex, setSelectedDocIndex] = useState(0);
const [isEmailViewerOpen, setIsEmailViewerOpen] = useState(false);
const [selectedEmail, setSelectedEmail] = useState<any>(null);

// Assignment state
const [assignedTo, setAssignedTo] = useState(lead.assignedTo || '');
```

### Key Sections

#### A. Header Section (Lines 96-157)

**Components:**
- Title + Badges
- Assigned To Dropdown
- Action Buttons (Call, Send Email, Edit, Convert)

**Important Code:**
```typescript
<Select 
  value={assignedTo} 
  onValueChange={(value) => {
    setAssignedTo(value);
    console.log('Assigned to:', value);
    // TODO: Save to backend
  }}
>
  <SelectTrigger className="w-[200px] h-8">
    <SelectValue placeholder="Unassigned" />
  </SelectTrigger>
  <SelectContent>
    {mockUsers.map(user => (
      <SelectItem key={user.id} value={user.id}>
        {user.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

#### B. Tabs Section (Lines 159-642)

**Tab List:**
1. Overview - معلومات أساسية + Notes
2. Interested - البرامج المطلوبة
3. Documents - المستندات
4. Emails - سجل الإيميلات
5. Timeline - الأنشطة

#### C. Notes Section (Lines 264-356)

**Structure:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Notes & Updates</CardTitle>
    <Badge>{notesCount} notes</Badge>
  </CardHeader>
  <CardContent>
    {/* Add Note Form */}
    <Textarea id="new-note" />
    <Button onClick={handleSaveNote}>
      <FileText /> Save Note
    </Button>
    
    <Separator />
    
    {/* Previous Notes */}
    {lead.notes && (
      <div className="p-3 bg-muted/50 rounded-lg border">
        {/* Note content */}
      </div>
    )}
  </CardContent>
</Card>
```

**Save Handler:**
```typescript
onClick={() => {
  const textarea = document.getElementById('new-note') as HTMLTextAreaElement;
  if (textarea && textarea.value.trim()) {
    alert(`Note saved: ${textarea.value}`);
    console.log('New note:', {
      leadId: lead.id,
      content: textarea.value,
      createdBy: assignedTo,
      createdAt: new Date()
    });
    textarea.value = '';
  }
}}
```

#### D. Documents Tab (Lines 501-588)

**Grid Card Layout (Updated 2026-01-16):**
```typescript
<div className="grid gap-4 md:grid-cols-3">
  {lead.leadDocuments.map((doc: any) => (
    <Card key={doc.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Image preview or icon */}
          {doc.fileUrl && (doc.fileType === 'image/png' || doc.fileType === 'image/jpeg') ? (
            <img src={doc.fileUrl} alt={doc.fileName} className="..." />
          ) : (
            <FileText className="h-16 w-16 text-muted-foreground" />
          )}
          
          {/* File info */}
          <div>
            <p className="font-medium">{doc.fileName}</p>
            <p className="text-sm text-muted-foreground">
              {doc.fileType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 w-full">
            <Button onClick={() => window.open(doc.fileUrl, '_blank')}>
              <Eye /> View
            </Button>
            <Button onClick={() => window.open(doc.fileUrl, '_blank')}>
              <Download /> Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**Header Buttons:**
```typescript
<div className="flex gap-2">
  <Button onClick={() => {
    setSelectedDocIndex(0);
    setIsDocViewerOpen(true);
  }}>
    <FileText /> View All
  </Button>
  
  <Button onClick={() => {
    alert(`Downloading all documents for ${lead.fullName}...`);
  }}>
    <Download /> Download All
  </Button>
</div>
```

**Document List Item:**
```typescript
<div 
  onClick={() => {
    setSelectedDocIndex(index);
    setIsDocViewerOpen(true);
  }}
  className="...cursor-pointer"
>
  <FileText />
  <div>
    <p>{doc.name}</p>
    <p>{doc.type} • {doc.size} • {date}</p>
  </div>
  
  {/* Action buttons */}
  <div onClick={(e) => e.stopPropagation()}>
    <Button onClick={handleDownload}>
      <Download />
    </Button>
    <Button onClick={handleDelete}>
      <Trash2 />
    </Button>
  </div>
</div>
```

#### E. Emails Tab (Lines 508-590)

**Email Item:**
```typescript
<div 
  onClick={() => {
    setSelectedEmail({...email, to: lead.email});
    setIsEmailViewerOpen(true);
  }}
  className="...cursor-pointer"
>
  <div>
    <Mail />
    <h4>{email.subject}</h4>
    <p>Template: {email.template}</p>
  </div>
  <Badge className={statusColors[email.status]}>
    {email.status}
  </Badge>
  
  <div>
    <User /> {email.sentBy}
    <Calendar /> {date}
  </div>
</div>
```

#### F. Lead Conversion Handler ⭐ NEW (Lines 85-99)

```typescript
const handleConvert = async () => {
  if (!confirm(`Are you sure you want to convert ${lead.fullName || lead.companyName} to a student?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/leads/${lead.id}/convert`, {
      method: 'POST',
    });
    
    if (response.ok) {
      const data = await response.json();
      router.push(`/students/${data.studentId}/edit`);
    } else {
      throw new Error('Conversion failed');
    }
  } catch (error) {
    console.error('Conversion error:', error);
    alert('Failed to convert lead to student');
  }
};
```

**Features:**
- Browser confirm() dialog for safety
- POST request to `/api/leads/[id]/convert`
- Auto-redirect to Student Edit page on success
- Error handling with user feedback

#### G. Viewer Components (Lines 645-665)

```typescript
<SendEmailDialog
  open={isEmailDialogOpen}
  onOpenChange={setIsEmailDialogOpen}
  leadName={lead.fullName || lead.companyName || ''}
  leadEmail={lead.email || ''}
/>

<DocumentViewer
  open={isDocViewerOpen}
  onOpenChange={setIsDocViewerOpen}
  documents={lead.documents || []}
  initialIndex={selectedDocIndex}
  leadName={lead.fullName || lead.companyName || ''}
/>

<EmailViewer
  open={isEmailViewerOpen}
  onOpenChange={setIsEmailViewerOpen}
  email={selectedEmail}
/>
```

---

## 🎨 Shared UI Components (Shadcn)

### Used Components:
- `Dialog` - للـ modals
- `Select` - للـ dropdowns
- `Button` - للأزرار
- `Card` - للـ sections
- `Tabs` - للتنظيم
- `Badge` - للـ status indicators
- `Textarea` - للـ notes input
- `ScrollArea` - للمحتوى الطويل
- `Separator` - للفواصل

### Icons (Lucide React):
- `FileText` - documents
- `Mail` - emails
- `User` - users
- `Calendar` - dates
- `Download` - download actions
- `Trash2` - delete actions
- `Phone` - call action
- `ChevronLeft/Right` - navigation
- `X` - close buttons

---

## 🔄 Data Flow

### Assignment Flow
```
User selects from dropdown
    ↓
setAssignedTo(userId)
    ↓
console.log (mock)
    ↓
[Future: API call to save]
    ↓
[Future: Update lead state]
```

### Document Viewing Flow
```
User clicks document / "View All"
    ↓
setSelectedDocIndex(index)
    ↓
setIsDocViewerOpen(true)
    ↓
DocumentViewer renders
    ↓
User navigates/downloads
    ↓
onOpenChange(false) to close
```

### Email Viewing Flow
```
User clicks email item
    ↓
setSelectedEmail({...email, to: lead.email})
    ↓
setIsEmailViewerOpen(true)
    ↓
EmailViewer renders
    ↓
Displays full email
    ↓
onOpenChange(false) to close
```

### Notes Flow
```
User types in textarea
    ↓
User clicks "Save Note"
    ↓
Get textarea value
    ↓
console.log (mock)
    ↓
Clear textarea
    ↓
[Future: API call]
    ↓
[Future: Refresh notes list]
```

---

## 🧪 Testing Considerations

### Unit Tests (Recommended)

```typescript
// DocumentViewer.test.tsx
describe('DocumentViewer', () => {
  it('opens when open prop is true', () => {});
  it('displays correct document count', () => {});
  it('navigates to next document', () => {});
  it('navigates to previous document', () => {});
  it('calls onOpenChange when closed', () => {});
});

// EmailViewer.test.tsx
describe('EmailViewer', () => {
  it('displays email subject', () => {});
  it('shows correct status badge color', () => {});
  it('renders email body', () => {});
  it('calls onOpenChange when closed', () => {});
});
```

### Integration Tests

```typescript
describe('Lead Detail Page', () => {
  it('opens document viewer when clicking document', () => {});
  it('opens email viewer when clicking email', () => {});
  it('saves note when clicking save button', () => {});
  it('changes assigned user via dropdown', () => {});
});
```

---

## 📱 Responsive Design

### Current Implementation:
- Desktop-first design
- Modal dialogs work on all sizes
- Grid layouts use `md:grid-cols-2`

### Improvements Needed:
- [ ] Mobile-optimized sidebar in DocumentViewer
- [ ] Swipe gestures for navigation
- [ ] Bottom sheet for mobile modals
- [ ] Touch-friendly button sizes

---

## ♿ Accessibility

### Current:
- ✅ Semantic HTML
- ✅ Dialog focus management (Shadcn)
- ✅ Keyboard navigation (ESC to close)

### Improvements Needed:
- [ ] ARIA labels for all interactive elements
- [ ] Screen reader announcements
- [ ] Focus indicators
- [ ] Color contrast checks
- [ ] Tab order optimization

---

## 🚀 Performance

### Current:
- ✅ Client-side rendering
- ✅ Minimal re-renders (proper state management)
- ✅ No unnecessary dependencies

### Future Optimizations:
- [ ] Lazy load document previews
- [ ] Virtual scrolling for large lists
- [ ] Image optimization
- [ ] Code splitting for heavy components

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-01-10  
**Component Count:** 3 major components
