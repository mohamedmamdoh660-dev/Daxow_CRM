# Academic Years Documentation

## Overview
Represents a full academic cycle (e.g., "2024-2025").

## Key Features
- **Validation**: Name must follow the format `YYYY-YYYY` (e.g., 2024-2025).
- **Default Year**: One year can be marked as `isDefault`. Setting a new default automatically unsets the previous one.
- **Status Control**: Can be activated/deactivated. Deactivated years are hidden from standard selection lists.
- **Auditing**: All creations, updates, and deletions are logged in the Timeline.

## API Endpoints
- `GET /api/academic-years`: List all years (supports pagination & search)
- `GET /api/academic-years/:id`: Get details
- `POST /api/academic-years`: Create new year
- `PATCH /api/academic-years/:id`: Update (Name, Status, Default)
- `DELETE /api/academic-years/:id`: Delete year
