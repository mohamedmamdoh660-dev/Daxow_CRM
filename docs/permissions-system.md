# Permissions & Access Control System (Future Implementation)

## Overview
This document outlines the planned permissions and access control system for the CRM. This will be implemented in a future phase to control who can perform specific actions on leads, students, and other entities.

## User Roles

### 1. Admin
- **Full Access**: Can do everything
- Can assign/reassign leads to any user
- Can create, edit, delete all records
- Can manage users and permissions
- Can access all settings and integrations

### 2. Team Lead
- **Team Management**: Manage their team members
- Can assign leads within their team
- Can edit all leads assigned to their team
- Can view reports for their team
- Cannot manage users or system settings

### 3. Sales Manager
- **Lead Management**: Full access to leads
- Can receive and assign leads
- Can convert leads to students/agents
- Can add notes and send emails
- Cannot manage users

### 4. Counselor
- **Student Support**: Focus on student applications
- Can view assigned leads
- Can add notes to assigned leads
- Can send emails
- Cannot reassign leads
- Cannot delete records

### 5. Viewer
- **Read-Only Access**
- Can view leads and students
- Cannot edit or delete
- Cannot send emails or make calls

---

## Lead Assignment Permissions

### Who Can Receive Leads?
Configurable per role:
- ✅ Admins (default: can receive)
- ✅ Team Leads (default: can receive)
- ✅ Sales Managers (default: can receive)
- ⚠️ Counselors (default: cannot receive)
- ❌ Viewers (never receive)

### Lead Assignment Settings
**Location**: Settings > Lead Management > Assignment Rules

```typescript
interface AssignmentRules {
  autoAssign: boolean; // Automatically assign new leads
  assignmentMethod: 'round-robin' | 'manual' | 'weighted';
  eligibleRoles: string[]; // Which roles can receive leads
  dailyLimit?: number; // Max leads per user per day
  workloadBalancing: boolean; // Balance based on current workload
}
```

### Assignment Actions
| Action | Admin | Team Lead | Sales Manager | Counselor | Viewer |
|--------|-------|-----------|---------------|-----------|--------|
| Assign Lead to Self | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign Lead to Others | ✅ | ✅ (team only) | ❌ | ❌ | ❌ |
| Reassign Own Leads | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reassign Others' Leads | ✅ | ✅ (team only) | ❌ | ❌ | ❌ |

---

## Notes & Communication Permissions

### Who Can Add Notes?
- **Assigned User**: Can always add notes to their assigned leads
- **Team Lead**: Can add notes to any lead in their team
- **Admin**: Can add notes to any lead

### Note Visibility
```typescript
interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  visibility: 'public' | 'team' | 'private';
  // private: only creator and admins
  // team: creator's team and admins
  // public: everyone with lead access
}
```

### Communication Actions
| Action | Assigned User | Team Lead | Others | Viewer |
|--------|--------------|-----------|---------|--------|
| Add Note | ✅ | ✅ | ❌ | ❌ |
| Edit Own Note | ✅ | ✅ | ✅ | ❌ |
| Delete Own Note | ✅ | ✅ | ✅ | ❌ |
| Delete Others' Notes | ❌ | ✅ | ❌ | ❌ |
| Send Email | ✅ | ✅ | ❌ | ❌ |
| Make Call | ✅ | ✅ | ❌ | ❌ |
| View Email History | ✅ | ✅ | ✅ (team) | ✅ |

---

## Document Permissions

| Action | Assigned User | Team Lead | Others | Viewer |
|--------|--------------|-----------|---------|--------|
| Upload Document | ✅ | ✅ | ❌ | ❌ |
| View Document | ✅ | ✅ | ✅ (team) | ✅ |
| Download Document | ✅ | ✅ | ✅ (team) | ❌ |
| Delete Document | ✅ | ✅ | ❌ | ❌ |

---

## Activity Tracking

All permission-controlled actions will be logged:
```typescript
interface ActivityLog {
  id: string;
  entityType: 'lead' | 'student' | 'agent';
  entityId: string;
  action: string; // 'assigned', 'note_added', 'email_sent', etc.
  performedBy: string;
  performedAt: Date;
  details: Record<string, any>;
}
```

---

## Implementation Priority

### Phase 1: Core Permissions
- [/] Basic role system (Admin, Manager, User)
- [ ] Assigned user tracking (implemented)
- [ ] Notes with user attribution
- [ ] Basic visibility controls

### Phase 2: Assignment System
- [ ] Lead assignment dropdown (implemented)
- [ ] Assignment rules configuration
- [ ] Auto-assignment engine
- [ ] Workload balancing

### Phase 3: Advanced Permissions
- [ ] Granular permission editor
- [ ] Custom roles
- [ ] Team-based permissions
- [ ] Department hierarchies

### Phase 4: Audit & Compliance
- [ ] Complete activity logging
- [ ] Permission audit trail
- [ ] Compliance reports
- [ ] Data access logs

---

## Database Schema Changes Required

```sql
-- Users table with roles
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50), -- 'admin', 'team_lead', 'sales_manager', etc.
  team_id UUID REFERENCES teams(id),
  can_receive_leads BOOLEAN DEFAULT true,
  daily_lead_limit INTEGER,
  is_active BOOLEAN DEFAULT true
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  team_lead_id UUID REFERENCES users(id),
  created_at TIMESTAMP
);

-- Notes table
CREATE TABLE lead_notes (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  content TEXT,
  created_by UUID REFERENCES users(id),
  visibility VARCHAR(20) DEFAULT 'public',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Activity log
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id UUID,
  action VARCHAR(100),
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMP,
  details JSONB
);
```

---

## Security Considerations

1. **Row-Level Security (RLS)**: Implement PostgreSQL RLS for data isolation
2. **API Middleware**: Check permissions before every write operation
3. **Frontend Guards**: Hide UI elements user doesn't have permission for
4. **Audit Logging**: Log all permission checks and access attempts
5. **Session Management**: Refresh permissions on role/team changes

---

## Current State (As Implemented)

✅ **Completed:**
- Assigned To dropdown in lead detail
- Mock users data structure
- Basic assignment change functionality
- Console logging for assignment changes

⏳ **Pending Backend:**
- Actual permission checks
- Role-based access control
- Assignment rules engine
- Activity logging
