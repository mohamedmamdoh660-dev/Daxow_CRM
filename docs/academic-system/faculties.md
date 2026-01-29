# Faculties Documentation

## Overview
Represents university faculties or departments (e.g., "Engineering", "Medicine", "Arts"). Faculties serve as parent containers for Specialties.

## Key Features
- **Status Control**: Can be activated/deactivated. Deactivated faculties are hidden from selection lists.
- **Bulk Actions**: Supports deletion and status updates for multiple records at once.
- **Relations**: Linked to multiple Specialties.
- **Auditing**: All actions are logged.

## API Endpoints
- `GET /api/faculties`: List all faculties (supports pagination & search)
- `GET /api/faculties/:id`: Get details including statistics
- `POST /api/faculties`: Create new faculty
- `PATCH /api/faculties/:id`: Update (Name, Status)
- `DELETE /api/faculties/:id`: Delete faculty
