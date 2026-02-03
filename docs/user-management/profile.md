# User Profile Management

## Overview
The profile page allows users to manage their personal information, change their password, and upload a profile picture. The page features a modern UI with tabbed sections and real-time updates.

---

## Features

### Personal Information
Users can update:
- **First Name**
- **Last Name**
- **Email** (display only, cannot be changed)
- **Phone Number**
- **Role** (display only, managed by admin)

### Password Management
Secure password change with:
- Current password verification
- New password with confirmation
- Real-time validation
- Bcrypt hashing on backend

### Profile Picture
- Image upload (JPEG, PNG)
- File size limit: 5MB
- Preview before save
- Avatar with initials fallback

---

## Database Schema

### User Model Extensions

Added profile-related fields to User model:

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  role          String
  
  // Profile fields
  firstName     String?
  lastName      String?
  phone         String?
  profileImage  String?
  lastLogin     DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Migration:** SQL migration executed on February 2, 2026

---

## UI Design

### Modern Aesthetics
- **Gradient backgrounds**: Purple to cyan gradient overlay
- **Glassmorphism effects**: Transparent backgrounds with backdrop blur
- **Card-based layout**: Organized sections with shadows
- **Responsive design**: Mobile-friendly interface
- **Smooth animations**: Hover effects and transitions

### Navigation
Three tabs for different profile sections:
1. **Personal Info** - Edit basic information
2. **Password** - Change password securely  
3. **Profile Picture** - Upload and manage avatar

### User Avatar
- Circular avatar display at top
- Shows profile image if uploaded
- Falls back to initials (first + last name)
- Gradient background for initials

---

## API Endpoints

### GET `/api/profile`

Fetches current user's profile data

**Authentication:** JWT token required (cookie)

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "admin",
  "profileImage": "/uploads/profiles/image.jpg",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "lastLogin": "2026-02-03T12:00:00.000Z"
}
```

### PATCH `/api/profile`

Updates user profile information

**Authentication:** JWT token required

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "user": { /* updated user data */ }
}
```

### POST `/api/profile/password`

Changes user password

**Authentication:** JWT token required

**Request:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456",
  "confirmPassword": "newpass456"
}
```

**Validation:**
- Current password must be correct
- New password must match confirmation
- Password hashing with bcrypt

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### POST `/api/profile/image`

Uploads profile image

**Authentication:** JWT token required

**Request:** FormData with `image` file

**File Requirements:**
- Accepted formats: JPEG, PNG, GIF
- Maximum size: 5MB
- Stored in: `/public/uploads/profiles/`

**Response:**
```json
{
  "success": true,
  "imageUrl": "/uploads/profiles/user-uuid-timestamp.jpg"
}
```

---

## Frontend Components

### Profile Page (`app/(dashboard)/profile/page.tsx`)

**Key Features:**
- Client-side state management
- Form validation
- Loading states
- Error handling
- Toast notifications for success/error

**State Management:**
```typescript
const [profileForm, setProfileForm] = useState({
  firstName: '',
  lastName: '',
  phone: ''
});

const [passwordForm, setPasswordForm] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
```

### UI Components Used
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` from `@/components/ui/card`
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Label` from `@/components/ui/label`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` from `@/components/ui/tabs`
- `Avatar`, `AvatarImage`, `AvatarFallback` from `@/components/ui/avatar`
- Icons from `lucide-react`

---

## Security Considerations

### Password Changes
1. **Current password verification**: Ensures request is from account owner
2. **Password confirmation**: Prevents typos
3. **Bcrypt hashing**: Passwords never stored in plain text
4. **JWT authentication**: All requests require valid token

### Profile Updates
1. **User ID from JWT**: Cannot modify other users' profiles
2. **Email cannot be changed**: Prevents account hijacking
3. **Role cannot be changed**: Only admins can modify roles

### Image Uploads
1. **File type validation**: Only images allowed
2. **File size limits**: Prevents DoS attacks
3. **Unique filenames**: UUID + timestamp prevents collisions
4. **Secure storage**: Files stored outside code directory

---

## Localization

### Language
- **Current**: English
- **Previous**: Arabic (translated February 2, 2026)

All UI text is in English including:
- Page titles
- Form labels
- Button text
- Success/error messages
- Placeholders

---

## Recent Updates

### February 2-3, 2026

#### UI Redesign
- Modern gradient backgrounds
- Glassmorphism effects
- Improved typography
- Better spacing and layout
- Card-based design

#### Translation
- Complete English translation
- Updated all labels and messages
- Navigation items translated

#### Bug Fixes
- Fixed JWT authentication (userId → sub)
- Added JWT_SECRET to frontend .env
- Corrected password form state updates
- Fixed TypeScript errors

#### Database Migration
- Added profile fields to User table
- Safe migration without data loss
- Updated Prisma schema

---

## Testing Checklist

### Profile Information
- [ ] Load profile page → displays current user data
- [ ] Update first name → saves successfully
- [ ] Update last name → saves successfully
- [ ] Update phone → saves successfully
- [ ] Email field is disabled (cannot edit)
- [ ] Role field is disabled (cannot edit)

### Password Change
- [ ] Enter wrong current password → shows error
- [ ] New password != confirm password → shows error
- [ ] Valid password change → success
- [ ] Can login with new password

### Profile Image
- [ ] Upload valid image → saves and displays
- [ ] Upload invalid file → shows error
- [ ] Upload large file (>5MB) → shows error
- [ ] Delete image → shows fallback avatar

---

## Related Documentation

- [Authentication](./authentication.md) - Login and logout flow
- [Backend Architecture](../backend-architecture.md) - API structure
- [UI Patterns](../ui-patterns.md) - Design system
