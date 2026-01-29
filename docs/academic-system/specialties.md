# Specialties Documentation

## Overview
Represents specific fields of study or majors (e.g., "Computer Science", "Civil Engineering") under a parent Faculty.

## Key Features
- **Faculty Relation**: Every specialty belongs to a Faculty.
- **Title Integration**: Uses standardized names from the `Titles` module to prevent duplicates.
- **Status Control**: Can be activated/deactivated.
- **Frontend Filters**: List view can be filtered by Faculty.
- **Bulk Actions**: Supports deletion and status updates for multiple records at once.
- **Auditing**: All actions are logged.

## API Endpoints
- `GET /api/specialties`: List all specialties (supports pagination & search)
- `GET /api/specialties/:id`: Get details (includes Faculty info)
- `POST /api/specialties`: Create new specialty (requires `facultyId`)
- `PATCH /api/specialties/:id`: Update (Name, Faculty, Status)
- `DELETE /api/specialties/:id`: Delete specialty
