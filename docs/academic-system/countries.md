# Countries Documentation

## Overview
Global database of countries and their properties.

## Key Features
- **Data Points**: Name, ISO Code (2-3 chars), Phone Code, Region.
- **Bulk Actions**: Select multiple countries for bulk delete, activate, or deactivate.
- **Pagination**: Configurable page size (10/25/50/100/200 records) with page navigation.
- **Scrollable Table**: Max height 600px with sticky header for easy navigation.
- **View Interface**: Tabbed interface separating "Overview" and related "Cities".
- **Integration**: Acts as a parent entity for Cities.

## UI Features
- Checkbox selection for individual rows and select-all
- Bulk action toolbar appears when rows are selected
- Page size selector for controlling records per page
- Page navigation with current page indicator

## API Endpoints
- `GET /api/countries`: List (paginated, search by name/code)
- `POST /api/countries`: Create
- `PATCH /api/countries/:id`: Update
- `DELETE /api/countries/:id`: Soft delete
