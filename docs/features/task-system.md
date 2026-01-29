# Task Management System

## Overview
The Task Management System has been refactored to be **Polymorphic**, meaning tasks can be attached to any entity in the system (Students, Leads, Applications, etc.) without creating separate tables for each relation.

## Data Model
The `Task` model uses two key fields to establish relationships:
- `entityType`: String (enum-like) e.g., "Student", "Lead", "Application".
- `entityId`: String (UUID or CUID) matching the ID of the related record.

### Schema
```prisma
model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   // 'todo', 'in_progress', 'completed'
  priority    String   // 'low', 'medium', 'high'
  dueDate     DateTime?
  
  // Polymorphic Relation
  entityType  String
  entityId    String

  // Metadata
  completedAt DateTime?
  outcome     String?  // 'success', 'failed' (for completed tasks)
}
```

## Features

### 1. Universal Task Creation
Tasks can be created from any context. The frontend automatically detects the `entityType` and `entityId` from the current page (e.g., Student Detail Page).

### 2. Task Completion with Outcomes
When marking a task as complete, users can specify:
- **Outcome**: Was the task successful?
- **Notes**: Optional details about the completion.
This allows for better reporting on sales activities.

### 3. API Capabilities
- **Filter by Entity**: `GET /api/tasks?entityType=Lead&entityId=123`
- **Global View**: `GET /api/tasks` (User's dashboard)

## Frontend Integration
The `TaskViewDialog` and `AddTaskDialog` components handle the logic for displaying and creating tasks for the current context.
