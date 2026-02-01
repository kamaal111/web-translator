# API Contracts: String Version History & Editing

**Feature**: String Version History & Editing  
**Date**: February 1, 2026  
**Phase**: 1 - Design & Contracts

This document defines the HTTP API contracts for version history viewing, draft editing, and version comparison.

## Base Path

All endpoints are under `/app-api/v1/projects`

## Authentication

All endpoints require authentication via Better Auth session.

## Endpoints

### 1. List Version History for a String

**Endpoint**: `GET /app-api/v1/projects/:projectId/strings/:stringKey/versions`

**Purpose**: Retrieve all published versions and the current draft for a specific string key across all locales or a specific locale.

**Path Parameters**:

- `projectId` (string, required): Project ID
- `stringKey` (string, required): String key (e.g., "HOME.TITLE")

**Query Parameters**:

- `locale` (string, optional): Filter to specific locale (e.g., "en", "es"). If omitted, returns all locales.
- `page` (integer, optional): Page number for pagination (default: 1)
- `pageSize` (integer, optional): Items per page (default: 20, max: 100)

**Response** (200 OK):

```json
{
  "stringKey": "HOME.TITLE",
  "locales": [
    {
      "locale": "en",
      "draft": {
        "value": "Welcome to the App",
        "updatedAt": "2026-02-01T10:30:00Z",
        "updatedBy": {
          "id": "user-123",
          "name": "Alice Developer"
        }
      },
      "versions": [
        {
          "version": 3,
          "value": "Welcome!",
          "createdAt": "2026-01-30T14:20:00Z",
          "createdBy": {
            "id": "user-456",
            "name": "Bob Translator"
          }
        },
        {
          "version": 2,
          "value": "Hello",
          "createdAt": "2026-01-28T09:15:00Z",
          "createdBy": {
            "id": "user-123",
            "name": "Alice Developer"
          }
        }
      ],
      "pagination": {
        "page": 1,
        "pageSize": 20,
        "totalVersions": 2,
        "hasMore": false
      }
    }
  ]
}
```

**Response** (404 Not Found):

```json
{
  "error": "String not found",
  "message": "No string with key 'HOME.TITLE' found in project"
}
```

**Response** (403 Forbidden):

```json
{
  "error": "Access denied",
  "message": "You do not have access to this project"
}
```

**Notes**:

- Versions are sorted DESC (newest first)
- Draft is always included at the top regardless of pagination
- If no draft exists for a locale, `draft` field is `null`
- If no versions exist, `versions` is empty array

---

### 2. Update Draft Translation

**Endpoint**: `PATCH /app-api/v1/projects/:projectId/strings/:stringKey/translations`

**Purpose**: Update the draft translation value for a string in one or more locales.

**Path Parameters**:

- `projectId` (string, required): Project ID
- `stringKey` (string, required): String key (e.g., "HOME.TITLE")

**Request Body**:

```json
{
  "translations": {
    "en": "New Welcome Message",
    "es": "Nuevo Mensaje de Bienvenida"
  },
  "ifUnmodifiedSince": "2026-02-01T10:00:00Z" // Optional: for conflict detection
}
```

**Request Headers** (optional):

- `If-Unmodified-Since`: ISO 8601 timestamp for conflict detection

**Response** (200 OK):

```json
{
  "updated": [
    {
      "locale": "en",
      "value": "New Welcome Message",
      "updatedAt": "2026-02-01T11:00:00Z",
      "updatedBy": {
        "id": "user-123",
        "name": "Alice Developer"
      }
    },
    {
      "locale": "es",
      "value": "Nuevo Mensaje de Bienvenida",
      "updatedAt": "2026-02-01T11:00:00Z",
      "updatedBy": {
        "id": "user-123",
        "name": "Alice Developer"
      }
    }
  ]
}
```

**Response** (409 Conflict):

```json
{
  "error": "Concurrent modification detected",
  "message": "Another user modified this translation recently. Review changes and retry.",
  "conflictDetails": {
    "locale": "en",
    "lastModifiedAt": "2026-02-01T10:55:00Z",
    "lastModifiedBy": {
      "id": "user-456",
      "name": "Bob Translator"
    }
  }
}
```

**Response** (400 Bad Request):

```json
{
  "error": "Validation failed",
  "message": "Translation value cannot be empty",
  "field": "translations.en"
}
```

**Response** (404 Not Found):

```json
{
  "error": "String not found",
  "message": "No string with key 'HOME.TITLE' found in project"
}
```

**Response** (403 Forbidden):

```json
{
  "error": "Access denied",
  "message": "You do not have permission to edit this project"
}
```

**Notes**:

- Conflict detection compares `ifUnmodifiedSince` with `updatedAt` timestamp
- Conflict threshold: 5 minutes (if modified within 5 minutes, return 409)
- Client can retry with updated `ifUnmodifiedSince` or add `force=true` query param to override
- All locales in request body must be in project's `enabledLocales`
- Empty string values are rejected (400)

---

### 3. Compare String Versions (P3)

**Endpoint**: `GET /app-api/v1/projects/:projectId/strings/:stringKey/compare`

**Purpose**: Compare two versions of a string for a specific locale.

**Path Parameters**:

- `projectId` (string, required): Project ID
- `stringKey` (string, required): String key (e.g., "HOME.TITLE")

**Query Parameters**:

- `locale` (string, required): Locale to compare (e.g., "en")
- `version1` (string, required): First version to compare. Use "draft" for current draft or version number (e.g., "3")
- `version2` (string, required): Second version to compare. Use "draft" for current draft or version number (e.g., "2")

**Response** (200 OK):

```json
{
  "stringKey": "HOME.TITLE",
  "locale": "en",
  "comparison": {
    "version1": {
      "label": "Draft",
      "value": "Welcome to the App",
      "timestamp": "2026-02-01T10:30:00Z",
      "author": {
        "id": "user-123",
        "name": "Alice Developer"
      }
    },
    "version2": {
      "label": "Version 3",
      "value": "Welcome!",
      "timestamp": "2026-01-30T14:20:00Z",
      "author": {
        "id": "user-456",
        "name": "Bob Translator"
      }
    },
    "diff": [
      { "type": "unchanged", "value": "Welcome" },
      { "type": "addition", "value": " to the App" },
      { "type": "deletion", "value": "!" }
    ]
  }
}
```

**Response** (404 Not Found):

```json
{
  "error": "Version not found",
  "message": "Version '5' not found for string 'HOME.TITLE' in locale 'en'"
}
```

**Response** (400 Bad Request):

```json
{
  "error": "Invalid parameters",
  "message": "version1 and version2 cannot be the same"
}
```

**Notes**:

- Diff is computed using word-level diff algorithm
- `type` values: "unchanged", "addition", "deletion"
- P3 priority - implementation can be deferred to later sprint

---

## HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters or validation failure
- `403 Forbidden`: User lacks permission for this resource
- `404 Not Found`: Resource not found
- `409 Conflict`: Concurrent modification detected

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "field": "Specific field if validation error (optional)",
  "details": {} // Additional context if needed (optional)
}
```

## Rate Limiting

Standard rate limits apply:

- 100 requests per minute per user
- 429 Too Many Requests response when exceeded

## Caching

- **Draft queries**: `Cache-Control: private, no-cache` (always fresh)
- **Version history**: `Cache-Control: private, max-age=60` (cache for 1 minute)
- **Snapshots**: `Cache-Control: public, max-age=31536000, immutable` (cache forever)

## OpenAPI Schema

These endpoints will be added to the existing OpenAPI specification at `/docs/spec.yaml`. The schema definitions will use:

- `hono-openapi` decorators in route handlers
- Zod schemas for request/response validation (defined in `server/src/projects/schemas.ts`)
- OpenAPI 3.0 format

Implementation will follow existing patterns in the codebase for API documentation.
