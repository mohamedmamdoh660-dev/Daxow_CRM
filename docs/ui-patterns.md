# UI Patterns & Design System

> **Purpose:** Document reusable UI patterns across the CRM modules  
> **Last Updated:** January 16, 2026

---

## Overview

This document outlines the common UI patterns and design components used throughout the Admission CRM. Following these patterns ensures consistency and maintainability across all modules.

---

## Grid Card Layouts

### Document Grid Pattern

**Used in:** 
- Lead Documents Tab ([`/leads/[id]`](file:///Users/mdarwish/CRM/app/(dashboard)/leads/[id]/page.tsx))
- Student Documents Tab ([`/students/[id]`](file:///Users/mdarwish/CRM/app/(dashboard)/students/[id]/page.tsx))

**Structure:**
```tsx
<div className="grid gap-4 md:grid-cols-3">
  {documents.map((doc) => (
    <Card key={doc.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Image preview or icon */}
          {doc.fileUrl && isImage(doc.fileType) ? (
            <img 
              src={doc.fileUrl} 
              alt={doc.fileName}
              className="w-full h-32 object-cover rounded-md"
            />
          ) : (
            <FileText className="h-16 w-16 text-muted-foreground" />
          )}
          
          {/* File metadata */}
          <div className="w-full">
            <p className="font-medium truncate">{doc.fileName}</p>
            <p className="text-sm text-muted-foreground">
              {doc.fileType} • {formatFileSize(doc.fileSize)}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(doc.fileUrl, '_blank')}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownload(doc)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**Key Features:**
- **Responsive**: 3 columns on desktop (md:grid-cols-3), single column on mobile
- **Hover Effects**: Shadow elevation on hover (`hover:shadow-lg transition-shadow`)
- **Image Preview**: Shows image thumbnails or fallback icons
- **File Metadata**: Type, size, and upload date display
- **Action Buttons**: Consistent View and Download actions

**Helper Functions:**
```typescript
function isImage(fileType: string): boolean {
  return fileType === 'image/png' || 
         fileType === 'image/jpeg' || 
         fileType === 'image/jpg';
}

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
```

---

## Component Architecture Patterns

### Client vs Server Components

#### When to Use Client Components

Use `'use client'` directive when you need:

1. **Event Handlers**: onClick, onChange, onSubmit
2. **React Hooks**: useState, useEffect, useContext
3. **Browser APIs**: localStorage, window, document
4. **Interactive State**: Modals, tabs, dropdowns
5. **Real-time Updates**: Dynamic data that changes

**Example:**
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';

export default function DetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params); // Unwrap params Promise
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`/api/resource/${id}`);
      const result = await response.json();
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, [id]);
  
  if (loading) return <LoadingSpinner />;
  if (!data) return <NotFound />;
  
  return <DetailView data={data} />;
}
```

#### When to Use Server Components

Keep as Server Component (default) when you need:

1. **Data Fetching**: Direct database queries with Prisma
2. **Authentication Checks**: Middleware and session validation
3. **Performance**: Reduced JavaScript bundle size
4. **SEO**: Server-side rendering benefits
5. **No Interactivity**: Static content display

**Example:**
```typescript
// No 'use client' directive

import { prisma } from '@/lib/prisma';

export default async function ListPage() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  return (
    <div>
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

---

## Status Badge Pattern

**Used in:** Students, Leads, Applications

```tsx
const statusConfig = {
  'Active': { color: 'bg-green-100 text-green-800', icon: '●' },
  'Inactive': { color: 'bg-gray-100 text-gray-800', icon: '●' },
  'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: '●' },
  'Converted': { color: 'bg-blue-100 text-blue-800', icon: '●' },
};

<Badge className={statusConfig[status].color}>
  {statusConfig[status].icon} {status}
</Badge>
```

---

## Modal/Dialog Pattern

**Used in:** Document Viewer, Email Viewer, Send Email

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-3xl max-h-[85vh]">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
    
    <ScrollArea className="max-h-[60vh]">
      {/* Content */}
    </ScrollArea>
    
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleAction}>
        Confirm
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

## Timeline Event Pattern

**Used in:** Student Timeline, Lead Timeline (future)

```tsx
<div className="space-y-4">
  {events.map((event, index) => (
    <div key={event.id} className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-primary" />
        {index < events.length - 1 && (
          <div className="w-0.5 h-full bg-border mt-2" />
        )}
      </div>
      
      {/* Event content */}
      <Card className="flex-1">
        <CardContent className="pt-4">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline">{event.eventType}</Badge>
              <p className="mt-2">{event.description}</p>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(event.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  ))}
</div>
```

---

## Form Validation Pattern

**Used in:** Student Registration, Lead Forms

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone must be at least 8 digits'),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      email: '',
      phone: '',
    },
  });
  
  async function onSubmit(data: FormData) {
    // Handle submission
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields... */}
      </form>
    </Form>
  );
}
```

---

## Responsive Grid Patterns

### 2-Column Grid (Overview Cards)
```tsx
<div className="grid gap-4 md:grid-cols-2">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### 3-Column Grid (Documents, Applications)
```tsx
<div className="grid gap-4 md:grid-cols-3">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### 4-Column Grid (Stats, Metrics)
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

## Loading States

### Skeleton Loading
```tsx
{loading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
) : (
  <ActualContent />
)}
```

### Spinner Loading
```tsx
{loading ? (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
) : (
  <ActualContent />
)}
```

---

## Empty States

### With Call-to-Action
```tsx
<div className="flex flex-col items-center justify-center p-8 text-center">
  <Icon className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold">No items yet</h3>
  <p className="text-sm text-muted-foreground mb-4">
    Get started by creating your first item
  </p>
  <Button onClick={handleCreate}>
    <Plus className="h-4 w-4 mr-2" />
    Create Item
  </Button>
</div>
```

### Simple Empty State
```tsx
<div className="text-center p-8 text-muted-foreground">
  No data available
</div>
```

---

## Color Palette

### Status Colors
```typescript
const statusColors = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
};
```

### Priority Colors
```typescript
const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};
```

---

## Best Practices

### 1. Consistent Spacing
- Use Tailwind's spacing scale: `gap-4`, `space-y-4`, `p-4`
- Maintain consistent padding in cards: `pt-6` for CardContent

### 2. Icon Usage
- Icon size: `h-4 w-4` for buttons, `h-5 w-5` for headings
- Always add margins: `mr-2` for icon-text combinations
- Use lucide-react for consistency

### 3. Typography
- Card titles: `font-semibold text-lg`
- Descriptions: `text-sm text-muted-foreground`
- Metadata: `text-xs text-muted-foreground`

### 4. Hover States
- Cards: `hover:shadow-lg transition-shadow`
- Buttons: Use Shadcn variants (handled automatically)
- Links: `hover:underline`

### 5. Accessibility
- Always include alt text for images
- Use semantic HTML (Card, Button, etc.)
- Ensure keyboard navigation works
- Add ARIA labels where needed

---

## Related Documentation

- [Lead Management Components](file:///Users/mdarwish/CRM/docs/lead-management/components.md)
- [Student Management](file:///Users/mdarwish/CRM/docs/student-management/README.md)
- [Shadcn UI Components](https://ui.shadcn.com)

---

**Created:** January 16, 2026  
**Version:** 1.0.0
