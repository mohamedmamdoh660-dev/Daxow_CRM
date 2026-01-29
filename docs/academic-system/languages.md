# Languages Documentation

## Overview
Represents teaching languages or communication languages (e.g., "English", "French", "Arabic"). Used in Programs to specify the language of instruction.

## Key Features
- **ISO Codes**: Supports ISO language codes (e.g., EN, FR) for standards compliance.
- **Status Control**: Can be activated/deactivated. Deactivated languages are hidden from selection lists.
- **Bulk Actions**: Supports deletion and status updates for multiple records at once.
- **Auditing**: All actions are logged.

## API Endpoints
- `GET /api/languages`: List all languages (supports pagination & search)
- `GET /api/languages/:id`: Get show language details
- `POST /api/languages`: Create new language
- `PATCH /api/languages/:id`: Update (Name, Code, Status)
- `DELETE /api/languages/:id`: Delete language
