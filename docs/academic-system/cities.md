# Cities Documentation

## Overview
Specific locations linked to a Country.

## Key Features
- **Relation**: Must belong to a valid Country.
- **Navigation**: Clickable rows in tables for quick access to details.
- **Contextual Creation**: Can be created directly from the Country View (auto-selects country).
- **Auditing**: Tracks creation, updates, and deletions.

## API Endpoints
- `GET /api/cities`: List (supports filtering by `countryId`)
- `POST /api/cities`: Create
- `PATCH /api/cities/:id`: Update
- `DELETE /api/cities/:id`: Soft delete
