# Titles Documentation (Formerly Specialty Titles)

## Overview
Represents the standardized names for Specialties (e.g., "Computer Science", "Medicine"). This ensures consistency across different Faculties and helps avoid duplicate naming variations.

## Key Features
- **Centralized Naming**: All Specialties must select a name from this list.
- **Status Control**: Can be activated/deactivated.
- **Bulk Actions**: Supports deletion and status updates.
- **Auditing**: All actions are logged.

## API Endpoints
- `GET /api/titles`: List all titles (supports pagination & search)
- `GET /api/titles/:id`: Get title details
- `POST /api/titles`: Create new title
- `PATCH /api/titles/:id`: Update (Name, Status)
- `DELETE /api/titles/:id`: Delete title
