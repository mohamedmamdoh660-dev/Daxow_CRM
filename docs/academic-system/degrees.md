# Degrees Documentation

## Overview
Represents academic degrees (e.g., "Bachelor's", "Master's", "PhD") that can be obtained from Programs.

## Key Features
- **Standardized Levels**: Defines the hierarchy of academic qualifications.
- **Status Control**: Can be activated/deactivated. Deactivated degrees are hidden from selection.
- **Bulk Actions**: Supports deletion and status updates for multiple records at once.
- **Auditing**: All actions are logged.

## API Endpoints
- `GET /api/degrees`: List all degrees (supports pagination & search)
- `GET /api/degrees/:id`: Get degree details
- `POST /api/degrees`: Create new degree
- `PATCH /api/degrees/:id`: Update (Name, Status)
- `DELETE /api/degrees/:id`: Delete degree
