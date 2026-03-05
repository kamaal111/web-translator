# API Contracts: Bulk String Editor

**Feature**: 002-bulk-string-editor
**Date**: 2026-02-15

## Overview

The bulk string editor reuses three existing API endpoints. No new endpoints are required.

## Endpoints Used

### 1. List Strings

**Endpoint**: `GET /app-api/v1/s/:projectId`
**Purpose**: Load all strings and translations for the bulk editor table
**Auth**: Required (session cookie)
**Existing**: Yes — no changes needed

#### Parameters

| Name        | In   | Type            | Required | Description |
| ----------- | ---- | --------------- | -------- | ----------- |
| `projectId` | path | `string` (UUID) | Yes      | Project ID  |

#### Response (200 OK)

```typescript
type ListStringsResponse = Array<{
  id: string;
  key: string;
  context: string | null;
  project_id: string;
  translations: Record<string, string>;
}>;
```

#### Example Response

```json
[
  {
    "id": "01234567-89ab-cdef-0123-456789abcdef",
    "key": "welcome_message",
    "context": "Homepage greeting",
    "project_id": "proj_abc123",
    "translations": {
      "en": "Welcome",
      "fr": "Bienvenue",
      "de": ""
    }
  },
  {
    "id": "01234567-89ab-cdef-0123-456789abcdf0",
    "key": "logout_button",
    "context": null,
    "project_id": "proj_abc123",
    "translations": {
      "en": "Log out",
      "fr": "",
      "de": ""
    }
  }
]
```

#### Error Responses

| Status | Condition                                 |
| ------ | ----------------------------------------- |
| 401    | Not authenticated                         |
| 404    | Project not found or user lacks ownership |

---

### 2. Upsert Translations (Bulk Save)

**Endpoint**: `PUT /app-api/v1/s/:projectId/translations`
**Purpose**: Save all modified translations in a single batch operation
**Auth**: Required (session cookie)
**Existing**: Yes — no changes needed

#### Parameters

| Name        | In   | Type            | Required | Description |
| ----------- | ---- | --------------- | -------- | ----------- |
| `projectId` | path | `string` (UUID) | Yes      | Project ID  |

#### Request Body

```typescript
interface UpsertTranslationsRequest {
  translations: Array<{
    key: string;
    context?: string | null;
    translations: Record<string, string>;
  }>;
}
```

#### Example Request

```json
{
  "translations": [
    {
      "key": "welcome_message",
      "translations": {
        "fr": "Bienvenue!",
        "de": "Willkommen"
      }
    },
    {
      "key": "logout_button",
      "translations": {
        "fr": "Déconnexion"
      }
    }
  ]
}
```

#### Response (200 OK)

```typescript
interface UpsertTranslationsResponse {
  updated_count: number;
}
```

#### Example Response

```json
{
  "updated_count": 2
}
```

#### Error Responses

| Status | Condition                                     |
| ------ | --------------------------------------------- |
| 400    | Invalid request body (Zod validation failure) |
| 401    | Not authenticated                             |
| 404    | Project not found or user lacks ownership     |

#### Behavior

- Creates new string records if key doesn't exist in project
- Updates existing translations via `ON CONFLICT DO UPDATE` on `(string_id, locale)`
- Last-write-wins: no conflict detection (overwrites regardless of `updated_at`)
- Atomic: all updates succeed or all fail (database transaction)

---

### 3. Publish Snapshot

**Endpoint**: `POST /app-api/v1/p/:projectId/publish`
**Purpose**: Create new published versions from current draft state
**Auth**: Required (session cookie)
**Existing**: Yes — no changes needed

#### Parameters

| Name        | In   | Type            | Required | Description |
| ----------- | ---- | --------------- | -------- | ----------- |
| `projectId` | path | `string` (UUID) | Yes      | Project ID  |

#### Request Body

```typescript
interface PublishSnapshotRequest {
  locales?: string[];
  force?: boolean;
}
```

#### Example Request

```json
{
  "locales": ["en", "fr", "de"],
  "force": false
}
```

#### Response (200 OK)

```typescript
interface PublishSnapshotResponse {
  published: Array<{
    locale: string;
    version: number;
    snapshotId: string;
    stringCount: number;
    createdAt: string;
  }>;
  createdBy: {
    id: string;
    name: string;
  };
}
```

#### Error Responses

| Status | Condition                                       |
| ------ | ----------------------------------------------- |
| 401    | Not authenticated                               |
| 404    | Project not found or user lacks ownership       |
| 409    | No changes to publish (when `force` is `false`) |

---

### 4. Delete String

**Endpoint**: `DELETE /app-api/v1/s/:projectId/strings/:stringKey`
**Purpose**: Delete a string and all its translations from the project
**Auth**: Required (session cookie)
**Existing**: No — NEW endpoint required

#### Parameters

| Name        | In   | Type            | Required | Description                                        |
| ----------- | ---- | --------------- | -------- | -------------------------------------------------- |
| `projectId` | path | `string` (UUID) | Yes      | Project ID                                         |
| `stringKey` | path | `string`        | Yes      | The string key to delete (e.g., "welcome_message") |

#### Response (200 OK)

```typescript
interface DeleteStringResponse {
  deleted: {
    key: string;
    deletedAt: string;
  };
}
```

#### Example Response

```json
{
  "deleted": {
    "key": "welcome_message",
    "deletedAt": "2026-02-15T14:53:00Z"
  }
}
```

#### Error Responses

| Status | Condition                           |
| ------ | ----------------------------------- |
| 401    | Not authenticated                   |
| 404    | Project or string not found         |
| 403    | User lacks ownership of the project |

#### Behavior

- Deletes the string record from the `strings` table
- Database FK CASCADE automatically deletes all associated translations from the `translations` table
- Does NOT affect published snapshots (they remain immutable)
- Idempotent: returns 404 if string doesn't exist

---

## Frontend API Integration

### Data Flow

```
┌──────────────┐    GET /s/:projectId     ┌───────────────┐
│  BulkEditor  │ ◄────────────────────── │  listStrings   │
│  Page Load   │                          │  (TanStack Q)  │
└──────────────┘                          └───────────────┘
       │
       │ User edits cells OR creates new string
       ▼
┌──────────────┐                          ┌───────────────┐
│  DirtyEdits  │                          │ upsertTransl.  │
│  Map<k,v>    │ ──PUT /s/:projectId/──► │  (useMutation) │
│              │   translations           │                │
└──────────────┘                          └───────────────┘
       │
       │ User deletes string
       ▼
┌──────────────┐                          ┌───────────────┐
│  Delete      │ ─DELETE /s/:projectId/─► │ deleteString   │
│  Action      │   strings/:stringKey     │  (useMutation) │
└──────────────┘                          └───────────────┘
       │
       │ User clicks publish
       ▼
┌──────────────┐                          ┌───────────────┐
│  Publish     │ ─POST /p/:projectId/──► │ publishSnap.   │
│  Dialog      │   publish                │  (useMutation) │
└──────────────┘                          └───────────────┘
```

### TanStack Query Keys

| Key                       | Endpoint                                  | Invalidated By                   |
| ------------------------- | ----------------------------------------- | -------------------------------- |
| `['strings', projectId]`  | `GET /s/:projectId`                       | Upsert translations (on success) |
| `['project', projectId]`  | `GET /p/:projectId`                       | —                                |
| `['stringVersions', ...]` | `GET /p/:projectId/strings/:key/versions` | Publish snapshot (on success)    |

### Existing Client Methods

```typescript
stringsClient.listStrings(projectId: string): Promise<StringResponse[]>
stringsClient.upsertTranslations(request): Promise<UpsertTranslationsResponse>
projectsClient.publishSnapshot(request): Promise<PublishSnapshotResponse>
```
