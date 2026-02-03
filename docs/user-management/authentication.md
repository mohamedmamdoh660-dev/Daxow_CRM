# Authentication & Session Management

## Overview
The Admission CRM uses **JWT-based authentication** with HTTP-only cookies for secure session management. The system ensures that all dashboard routes and API endpoints are properly protected.

---

## Authentication Flow

### Login Process

1. **User submits credentials** via `/login` page
2. **Frontend** sends POST request to `/api/auth/login`
3. **Backend** (`crm-backend`) validates credentials:
   - Hashes password using bcrypt
   - Compares with stored hash in database
4. **On success**:
   - Generates JWT token with user data (`sub`, `email`, `role`)
   - Sets `access_token` cookie (HTTP-only, secure)
   - Returns user data to frontend
5. **Frontend** redirects to `/dashboard`

### Session Management

- **Token Storage**: JWT stored in HTTP-only cookie (`access_token`)
- **Token Expiration**: 7 days
- **Token Payload**:
  ```typescript
  {
    sub: string;      // User ID
    email: string;    // User email
    role: string;     // User role (admin, staff, etc.)
  }
  ```

### Logout Process

1. **User clicks logout button** in sidebar
2. **Frontend** sends POST request to `/api/auth/logout`
3. **API** deletes the `access_token` cookie
4. **Frontend** redirects to `/login`

---

## Route Protection

### Middleware (`middleware.ts`)

The application uses Next.js middleware to protect routes:

```typescript
// Public routes (no authentication required)
const PUBLIC_ROUTES = ['/', '/login'];

// Public API routes
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/logout'];

// All other routes require authentication
```

**How it works:**
1. Middleware runs on every request
2. Checks if route is public
3. If protected, checks for `access_token` cookie
4. If no valid token → redirect to `/login`
5. If valid token → allow access

### Protected Routes

All routes under `app/(dashboard)/*` are automatically protected:
- `/dashboard`
- `/leads`
- `/students`
- `/applications`
- `/profile`
- `/settings`
- All academic modules

### API Protection

Protected API routes verify JWT token:

```typescript
const token = request.cookies.get('access_token');
const decoded = jwt.verify(token.value, JWT_SECRET) as JWTPayload;
const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
```

---

## Security Features

### ✅ Implemented Security Measures

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with salt rounds |
| Secure Cookies | HTTP-only, SameSite=Strict |
| JWT Secret | 256-bit cryptographically secure key |
| Route Protection | Middleware-based authentication |
| API Protection | JWT verification on all endpoints |
| CSRF Protection | SameSite cookie attribute |

### Environment Variables

Required for authentication:

```bash
# Frontend (.env)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
JWT_SECRET=<same-as-backend>

# Backend (crm-backend/.env)
JWT_SECRET=<cryptographically-secure-key>
JWT_EXPIRES_IN=7d
```

> **⚠️ CRITICAL**: Never commit JWT_SECRET to version control!

---

## User Interface

### Login Page (`/login`)

- Clean, centered login form
- Email and password fields
- "Sign In" button
- Auto-redirect if already logged in

### Logout Button

- Located at bottom of sidebar
- Red destructive color scheme
- Loading state during logout
- Icon: `LogOut` from lucide-react

---

## Testing Authentication

### Manual Test Checklist

- [ ] Login with valid credentials → access dashboard
- [ ] Login with invalid credentials → show error
- [ ] Access `/dashboard` without login → redirect to `/login`
- [ ] Logout → redirect to `/login`
- [ ] Try accessing dashboard after logout → redirect to `/login`
- [ ] Session persists across page refreshes
- [ ] Session persists after closing browser (within expiry)

### Security Test Checklist

- [ ] Cookie is HTTP-only (not accessible via JavaScript)
- [ ] Cookie is Secure in production (HTTPS only)
- [ ] JWT secret is not exposed in frontend code
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] Protected API routes return 401 without token

---

## API Endpoints

### POST `/api/auth/login`

**Request:**
```json
{
  "email": "admin@admission-crm.com",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@admission-crm.com",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  },
  "access_token": "jwt-token-here"
}
```

**Sets Cookie:**
```
access_token=<jwt-token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

### POST `/api/auth/logout`

**Request:** Empty body

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Deletes Cookie:** Removes `access_token` cookie

---

## Related Documentation

- [Profile Management](./profile.md) - User profile and settings
- [Permissions System](../permissions-system.md) - Role-based access control
- [Backend Architecture](../backend-architecture.md) - NestJS backend structure
