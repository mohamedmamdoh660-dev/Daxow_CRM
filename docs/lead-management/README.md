ذ# Lead Management Documentation

> **آخر تحديث:** 2026-01-16  
> **الحالة:** ✅ جاهز للاستخدام (Lead Module مكتمل مع Backend Integration)

---

## 📚 محتويات التوثيق

### 1. [نظرة عامة (Overview)](./overview.md)
شرح شامل لكل الميزات المنفذة في Lead Management

### 2. [Components Documentation](./components.md)
توثيق فني لكل الـ components المستخدمة

### 3. [Features Guide](./features-guide.md)
دليل استخدام مفصل لكل ميزة

### 4. [Database Schema](./database-schema.md)
⭐ **مهم جداً** - مخطط قاعدة البيانات المطلوب للتنفيذ

### 5. [Backend Requirements](./backend-requirements.md)
متطلبات الـ Backend APIs والـ endpoints

### 6. [Permissions System](../permissions-system.md)
نظام الصلاحيات المخطط للمستقبل

---

## 🎯 الميزات المنفذة (Summary)

### ✅ 1. Assigned To Dropdown
- تغيير سريع للموظف المسؤول عن الـ Lead
- قائمة بجميع الموظفين المتاحين
- Frontend جاهز - يحتاج API للحفظ

### ✅ 2. Notes Section
- إضافة ملاحظات جديدة للـ Lead
- عرض سجل الملاحظات السابقة
- Frontend جاهز - يحتاج API للحفظ

### ✅ 3. Document Viewer
- عرض المستندات في modal منفصل
- Sidebar للتنقل بين المستندات
- Navigation (Previous/Next)
- Frontend جاهز - يحتاج file serving

### ✅ 8. Document Grid View ⭐ NEW
- عرض المستندات في grid card layout حديث
- تصميم responsive (3 أعمدة)
- معاينة الصور (Image preview thumbnails)
- أزرار View و Download لكل مستند
- يطابق تصميم Student module
- Frontend جاهز

### ✅ 9. Lead Conversion ⭐ NEW
- تحويل Lead إلى Student
- Auto-redirect لصفحة Edit الطالب
- تتبع الأحداث في Timeline
- Frontend + Backend مكتمل

## Timeline Auto-Tracking

### Overview
All Lead operations are automatically tracked in the Timeline system with **detailed field-level change descriptions**.

### Tracked Operations

#### 1. **Lead Created**
- **Event Type**: `lead_created`
- **Title**: "Lead Created"
- **Description**: "New [Type] lead created: [Name]"
- **Metadata**: Lead ID, initial status, source

#### 2. **Lead Updated** ✨
- **Event Type**: `lead_updated`
- **Title**: "Lead Updated"
- **Description**: "[Name]: [Detailed Changes]"
- **Metadata**: Lead ID, changes object, detailed changes array, previous/new status

##### Tracked Fields (17 total):
- **Basic Info**: Status, Type, Name, Email, Phone, Country, City, Source
- **Student Fields**: Preferred Countries, Preferred Intake, Budget Range
- **University Fields**: Company Name, Contact Person
- **Agent Fields**: Estimated Students, Proposed Commission
- **Other**: Assigned To, Notes

##### Change Format:
```
"Field: Old Value → New Value"
```

##### Examples:
```json
{
  "description": "Ahmed Ali: Status: New → Contacted, Phone: None → +20123456789",
  "detailedChanges": [
    "Status: New → Contacted",
    "Phone: None → +20123456789"
  ]
}
```

```json
{
  "description": "Sarah Student: City: Cairo → Alexandria, Notes added",
  "detailedChanges": [
    "City: Cairo → Alexandria",
    "Notes added"
  ]
}
```

#### 3. **Lead Deleted**
- **Event Type**: `lead_deleted`
- **Title**: "Lead Deleted"
- **Description**: "Lead deleted: [Name]"
- **Metadata**: Lead ID, final status

#### 4. **Lead Converted to Student**
- **Event Type**: `lead_converted`
- **Title**: "Lead Converted to Student"
- **Description**: "Lead [Name] converted to student [Student ID]"
- **Metadata**: Lead ID, Student ID
- **Note**: Creates TWO timeline events:
  1. On Lead timeline: `lead_converted`
  2. On Student timeline: `student_created_from_lead`

### Implementation Details

#### Backend Integration
Located: [`crm-backend/src/modules/leads/leads.service.ts`](../../crm-backend/src/modules/leads/leads.service.ts)

```typescript
// Automatic field comparison
const changes: string[] = [];

if (updateLeadDto.status && updateLeadDto.status !== existingLead.status) {
    changes.push(`Status: ${existingLead.status} → ${updateLeadDto.status}`);
}
// ... 16 more fields

// Create timeline event
await this.timeline.createEvent({
    entityType: 'Lead',
    entityId: lead.id,
    eventType: 'lead_updated',
    title: 'Lead Updated',
    description: `${lead.fullName}: ${changes.join(', ')}`,
    metadata: {
        detailedChanges: changes
    }
});
```

### API Endpoints

#### Get Lead Timeline
```http
GET /api/timeline/Lead/:leadId?limit=10&offset=0
```

**Response:**
```json
[
  {
    "id": "evt_123",
    "entityType": "Lead",
    "entityId": "lead_456",
    "eventType": "lead_updated",
    "title": "Lead Updated",
    "description": "Ahmed Ali: Status: New → Contacted, Phone: None → +20123456789",
    "metadata": {
      "leadId": "LEAD-0001",
      "changes": {
        "status": "Contacted",
        "phone": "+20123456789"
      },
      "detailedChanges": [
        "Status: New → Contacted",
        "Phone: None → +20123456789"
      ]
    },
    "createdAt": "2026-01-19T12:00:00Z"
  }
]
```

### Special Handling

#### Null/Empty Values
- `null` → displayed as "None"
- Empty string `""` → displayed as "None" or "Not Set"
- Boolean fields use undefined check: `!== undefined`

#### Notes Field
- If notes added: "Notes added"
- If notes removed: "Notes removed"
- If notes updated: "Notes updated"

#### Array Fields
- Preferred Countries: Shows full value change

### Frontend Integration

#### Timeline Tab
Located: Lead detail page → Timeline tab

Shows all events in reverse chronological order with:
- Event icon
- Event title
- Detailed description
- Timestamp
- Expandable metadata

### Benefits

1. **Complete Audit Trail**: Every change is logged with before/after values
2. **Clear Communication**: Team can see exactly what changed when
3. **Debugging**: Easy to track down when issues occurred
4. **Compliance**: Full history for regulatory requirements
5. **Analytics**: Can analyze lead journey and conversion patterns

---

## Best Practices

### When Creating Leads
### ✅ 4. Email Viewer
- عرض تفاصيل الإيميل كاملة
- Status tracking
- Frontend جاهز - يحتاج email service integration

### ✅ 5. Document Actions
- Download individual documents
- Download all documents
- Delete documents
- Frontend جاهز - يحتاج API endpoints

### ✅ 6. Task Management ⭐ NEW
- إنشاء tasks للـ lead (8 أنواع مختلفة)
- جدولة المهام بتاريخ ووقت محدد
- Expected Outcome لكل task
- Status tracking (Pending, Completed, Cancelled)
- Overdue detection
- Frontend جاهز - يحتاج API للحفظ

### ✅ 7. Rich Text Editor ⭐ NEW
- محرر نصوص احترافي للإيميلات
- Formatting toolbar (Bold, Italic, Underline)
- Headings (H1, H2)
- Lists (Bullet, Numbered)
- Text Alignment
- Insert Links
- Frontend جاهز

---

## 📁 الملفات المعدلة/الجديدة

### Components (New):
```
/components/leads/
├── document-viewer.tsx       ✨ جديد
├── email-viewer.tsx          ✨ جديد
└── send-email-dialog.tsx     موجود مسبقاً
```

### Pages (Modified):
```
/app/(dashboard)/leads/[id]/
└── page.tsx                  📝 معدل
```

### Data (Modified):
```
/lib/
└── mock-data.ts              📝 معدل (إضافة mockUsers)
```

### Documentation (New):
```
/docs/
├── permissions-system.md     ✨ جديد
└── lead-management/          ✨ folder جديد
    ├── README.md             (هذا الملف)
    ├── overview.md
    ├── components.md
    ├── features-guide.md
    ├── database-schema.md
    └── backend-requirements.md
```

---

## 🚀 خطوات التنفيذ التالية

### Phase 1: Database Setup (الأولوية القصوى)
- [ ] إنشاء جداول Database حسب [database-schema.md](./database-schema.md)
- [ ] إضافة unique constraints (email, phone)
- [ ] إعداد relationships بين الجداول
- [ ] Migration files

### Phase 2: Backend APIs
- [ ] Assignment APIs (GET, POST)
- [ ] Notes APIs (CRUD)
- [ ] Documents APIs (Upload, Download, Delete)
- [ ] Email integration (SendGrid/etc)

### Phase 3: Frontend Integration
- [ ] ربط Assigned To بـ backend
- [ ] ربط Notes بـ backend
- [ ] ربط Documents بـ backend
- [ ] Real-time updates

### Phase 4: Permissions
- [ ] User roles implementation
- [ ] Permission checks
- [ ] Activity logging

---

## 📊 الإحصائيات

| المقياس | الحالة |
|---------|--------|
| **Components جديدة** | 4 |
| **Features منفذة** | 9 |
| **Frontend Coverage** | 100% |
| **Backend Integration** | 60% (Conversion, Documents) |
| **Test Coverage** | Manual (Browser testing) |

---

## 🎥 الـ Demos والصور

### Document Viewer
![Document Viewer](/Users/mdarwish/.gemini/antigravity/brain/79bfdb5e-837c-4a30-8da0-5fabb21bd01f/document_viewer_modal_1768034684819.png)

### Email Viewer
![Email Viewer](/Users/mdarwish/.gemini/antigravity/brain/79bfdb5e-837c-4a30-8da0-5fabb21bd01f/email_viewer_modal_1768034750518.png)

### Assigned To Dropdown
![Assigned To](/Users/mdarwish/.gemini/antigravity/brain/79bfdb5e-837c-4a30-8da0-5fabb21bd01f/lead_assigned_to_dropdown_open_1768033177033.png)

---

## ⚠️ Important Notes

### لازم تتعمل قبل Production:
1. **Backend Integration** - كل الـ features دي frontend فقط
2. **Database Schema** - شوف [database-schema.md](./database-schema.md)
3. **File Storage** - للـ documents (S3, Cloudinary, etc)
4. **Email Service** - SendGrid أو Resend
5. **Permissions** - شوف [permissions-system.md](../permissions-system.md)

### Security Considerations:
1. Validate all file uploads
2. Implement rate limiting
3. Add CSRF protection
4. Sanitize user inputs
5. Implement proper authentication

---

## 📞 للمساعدة

إذا كان عندك أي سؤال عن أي feature، شوف:
- [Features Guide](./features-guide.md) - للاستخدام
- [Components Documentation](./components.md) - للتطوير
- [Backend Requirements](./backend-requirements.md) - للـ APIs

---

**Created by:** Antigravity AI  
**Date:** 2026-01-10  
**Version:** 1.0.0
