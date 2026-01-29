# CRM Backend API

**NestJS-based RESTful API for Admission CRM System**

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- PostgreSQL (Supabase)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (197 countries + initial data)
npx prisma db seed
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Server will start on: **http://localhost:4000**

---

## 📚 API Documentation

Interactive Swagger documentation available at:
**http://localhost:4000/api/docs**

All endpoints are prefixed with `/api`

---

## 🏗️ Project Structure

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
│
├── database/                    # Database configuration
│   ├── database.module.ts
│   └── prisma.service.ts
│
├── modules/                     # Feature modules
│   ├── students/
│   │   ├── students.controller.ts
│   │   ├── students.service.ts
│   │   ├── students.module.ts
│   │   └── dto/
│   │       ├── create-student.dto.ts
│   │       └── update-student.dto.ts
│   │
│   ├── leads/                   # Lead management
│   ├── universities/            # University catalog
│   ├── countries/               # Country data
│   ├── applications/            # Application pipeline
│   └── auth/                    # Authentication
│
└── common/                      # Shared utilities
    ├── filters/                 # Exception filters
    ├── guards/                  # Auth guards
    ├── interceptors/            # Response interceptors
    └── decorators/              # Custom decorators

prisma/
├── schema.prisma                # Database schema
└── seed.ts                      # Database seeder (197 countries)
```

---

## 🔌 API Endpoints

### Students
- `GET    /api/students` - List all students
- `GET    /api/students/:id` - Get student by ID
- `POST   /api/students` - Create new student
- `PATCH  /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Leads
- `GET    /api/leads` - List all leads
- `GET    /api/leads/:id` - Get lead by ID
- `POST   /api/leads` - Create new lead
- `PATCH  /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `POST   /api/leads/:id/convert` - Convert lead to student

### Universities
- `GET    /api/universities` - List all universities
- `GET    /api/universities/:id` - Get university by ID
- `POST   /api/universities` - Create university
- `PATCH  /api/universities/:id` - Update university
- `DELETE /api/universities/:id` - Delete university (soft)

### Countries
- `GET    /api/countries` - List all countries (197 total)
- `GET    /api/countries/:id` - Get country by ID
- `POST   /api/countries` - Create new country
- `PATCH  /api/countries/:id` - Update country
- `DELETE /api/countries/:id` - Delete country (soft)

### Applications
- `GET    /api/applications` - List all applications
- `GET    /api/applications?studentId=xxx` - Filter by student
- `GET    /api/applications?programId=xxx` - Filter by program
- `GET    /api/applications/:id` - Get application details
- `POST   /api/applications` - Create application
- `PATCH  /api/applications/:id` - Update application status
- `DELETE /api/applications/:id` - Delete application

---

## 🔐 Authentication

API uses JWT (JSON Web Token) for authentication.

**Login Flow:**
1. POST `/api/auth/login` with credentials
2. Receive JWT token
3. Include token in Authorization header: `Bearer <token>`

**Protected Routes:**
All routes except `/api/auth/*` and `GET /api/countries` require authentication.

---

## 💾 Database

**ORM:** Prisma  
**DB:** PostgreSQL (Supabase)

### Countries Data
Database includes **197 countries** with ISO codes:
- Middle East: 14 countries
- North Africa: 7 countries
- Sub-Saharan Africa: 47 countries
- Europe: 45 countries
- Asia: 35 countries
- North & South America: 35 countries
- Oceania: 14 countries

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ WARNING: Deletes all data)
npx prisma migrate reset
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📦 Environment Variables

Create `.env` file in root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Server
PORT=4000
FRONTEND_URL=http://localhost:3000

# JWT Authentication
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRATION=7d

# Node Environment
NODE_ENV=development
```

---

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t crm-backend .

# Run container
docker run -p 4000:4000 --env-file .env crm-backend
```

### Production Platforms
- **Railway** (Recommended)
- **Render**
- **Heroku**
- **DigitalOcean App Platform**

---

## 📝 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow NestJS best practices
- DTOs for all API inputs
- Service layer for business logic
- Repository pattern with Prisma

### Validation
All DTOs use `class-validator` decorators:

```typescript
export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

### Error Handling
Use NestJS built-in exceptions:

```typescript
throw new NotFoundException('Student not found');
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Invalid credentials');
```

---

## 🔗 Frontend Integration

Frontend should connect to: `http://localhost:4000/api`

**Example (Axios):**

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Get all students
const students = await api.get('/students');

// Create student
const newStudent = await api.post('/students', {
  fullName: 'Ahmed Ali',
  email: 'ahmed@example.com',
});
```

---

## 📊 Performance

- Response time target: < 200ms
- Database query optimization with Prisma
- Caching with Redis (future)
- Rate limiting enabled

---

## 🛡️ Security

- ✅ CORS enabled for Frontend only
- ✅ Helmet.js security headers
- ✅ Request validation
- ✅ JWT authentication
- ✅ Environment variables for secrets
- ✅ SQL injection protection (Prisma)

---

## 📞 Support

For issues or questions:
1. Check Swagger docs: http://localhost:4000/api/docs
2. Review code comments
3. Contact development team

---

## 📄 License

Private - Admission CRM Project

---

**Last Updated:** January 17, 2026  
**Version:** 1.0.0  
**Maintainer:** CRM Development Team
