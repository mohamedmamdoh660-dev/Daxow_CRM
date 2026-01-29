# Semesters Documentation

## Overview
Represents a subdivision of an Academic Year (e.g., "Fall 2024").

## Key Features
- **Naming**: Free text text (e.g., "Fall 2024", "Spring 2025").
- **Default Semester**: One semester can be marked as `isDefault`.
- **Status Control**: `isActive` flag for visibility control.
- **Auditing**: Full timeline tracking for all actions.

## API Endpoints
- `GET /api/semesters`: List all semesters
- `POST /api/semesters`: Create new semester
- `PATCH /api/semesters/:id`: Update semester
- `DELETE /api/semesters/:id`: Delete semester
