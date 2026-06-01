# Current Task

## Phase

Phase 20 — File Upload Foundation

## Objective

Introduce a safe file upload foundation for authenticated, user-owned uploads
while preserving existing authentication, authorization, audit logging, and
standardized response behavior.

This phase should prepare upload handling, file metadata persistence, validation,
and storage abstraction without over-building a full file management product.

Existing API behavior and response contracts must remain unchanged unless
explicitly required by this phase.

---

## Requirements

### File Upload Module

Create:

src/models/fileModel.js
src/repositories/file/
src/services/file/
src/middleware/upload/

Recommended files:

- src/models/fileModel.js
- src/repositories/file/fileRepository.js
- src/services/file/fileService.js
- src/services/file/storageService.js
- src/middleware/upload/uploadFile.js

Optional files if they improve clarity without over-engineering:

- src/services/file/fileStatus.js
- src/services/file/fileTypes.js
- src/controllers/file/fileController.js
- src/routes/fileRoutes.js
- src/middleware/upload/uploadErrors.js

Rules:

- Follow existing model/repository/service patterns.
- Repositories own all file metadata database access.
- Storage service owns storage-specific behavior.
- Controllers and routes must not write file metadata directly.
- Do not introduce cloud storage unless explicitly required.
- Do not introduce public file sharing, search, or CDN workflows in this phase.

### File Metadata Model

Define a file metadata model for uploaded files.

Recommended fields:

- ownerId
- originalName
- storedName
- mimeType
- size
- extension
- storageKey
- storageProvider
- status
- metadata
- createdAt
- updatedAt

Rules:

- ownerId must come from the authenticated actor, not request body.
- originalName may be stored for display/reference only.
- storedName or storageKey must be server-generated.
- mimeType and size must be recorded from upload processing.
- metadata must default to an empty object.
- status should default to active or pending.
- Do not store raw file buffers in MongoDB during this phase.
- Do not expose local filesystem paths as public API values.

### Upload Middleware

Implement middleware for multipart upload handling.

Responsibilities:

- Accept file upload input.
- Enforce maximum file size.
- Enforce allowed MIME types.
- Normalize upload errors into AppError/standard response flow where practical.
- Attach upload result for controller/service orchestration.

Rules:

- Upload parsing belongs in middleware, not controllers.
- Middleware must remain reusable.
- Middleware must not create file metadata.
- Middleware must not assign ownership.
- Middleware must not call repositories.

### File Repository

Implement a repository for file metadata persistence.

Recommended results:

- createFileMetadata(payload)
- findFileById(fileId)
- findFilesByOwner(ownerId, query)
- updateFileStatus(fileId, payload)

Responsibilities:

- Create file metadata records.
- Query file metadata by id/owner.
- Own Mongoose model usage.
- Keep persistence details out of services.

Rules:

- No HTTP logic.
- No response formatting.
- No controller responsibilities.
- No business workflow orchestration.

### Storage Service

Implement a storage service abstraction.

Recommended API:

- storeFile(file)
- removeFile(storageKey)

Responsibilities:

- Generate safe stored names or storage keys.
- Hide local/provider-specific storage behavior.
- Return storage metadata needed by fileService.

Rules:

- Do not trust original file names as storage keys.
- Do not expose local filesystem paths in API responses.
- Keep implementation simple for Phase 20.
- Do not add external storage provider integration unless required.

### File Service

Implement a reusable file service.

Recommended API:

- createUserFile({ actor, file, metadata })
- listUserFiles({ actor, query })
- getUserFile({ actor, fileId })

Responsibilities:

- Assign ownerId from authenticated actor.
- Normalize metadata.
- Call storage service.
- Call file repository.
- Return safe file DTOs.
- Coordinate audit logging where security-relevant and practical.

Rules:

- Do not depend on raw Express request objects.
- Do not trust ownerId from request body.
- Do not store secrets or internal filesystem paths.
- Preserve existing API response contracts.

### Integration Targets

Add upload workflow endpoints only where needed to prove the foundation.

Recommended initial targets:

- Authenticated user uploads one file.
- Authenticated user lists own uploaded files.
- Authenticated user reads own file metadata.

Rules:

- Keep integration minimal and focused.
- Do not rewrite existing auth/session/user flows.
- Do not add file sharing or public file serving.
- Do not add image processing.
- Do not add virus scanning in this phase.
- Existing auth/permission/error response shapes must remain unchanged.

---

## Testing

Add or update tests for:

### File Model

- Required fields are enforced.
- Metadata defaults to an empty object.
- Status defaults correctly.
- Timestamps are available.
- Raw file buffers are not part of the schema.

### Upload Middleware

- Missing required file is rejected.
- Disallowed MIME type is rejected.
- Oversized file is rejected.
- Upload errors use standardized error handling.

### File Repository

- createFileMetadata creates metadata records.
- findFileById retrieves file metadata.
- findFilesByOwner scopes results by owner.
- Repository tests isolate persistence behavior.

### Storage Service

- Generates safe storage keys/stored names.
- Does not use originalName directly as storage key.
- Returns normalized storage metadata.

### File Service

- Assigns ownerId from actor.
- Ignores client-provided ownerId.
- Calls storage service before metadata persistence where appropriate.
- Returns safe file DTOs.
- Does not expose internal filesystem paths.

### Workflow Integration

- Upload endpoint requires authentication.
- Upload endpoint rejects invalid files.
- Upload endpoint creates file metadata for authenticated user.
- List/read endpoints return only actor-owned files where implemented.
- Existing response contracts remain unchanged.

### Regression

- Existing authentication/session tests continue passing.
- Existing permission tests continue passing.
- Existing audit tests continue passing.
- Full test suite passes.

---

## Success Criteria

1. File upload middleware implemented
2. File metadata model implemented
3. File repository implemented
4. File service implemented
5. Storage abstraction implemented
6. Upload validation implemented
7. User-owned file metadata workflow implemented
8. Client-provided owner/path data is not trusted
9. Existing auth/permission/audit behavior preserved
10. Tests added or updated
11. Full test suite passes

---

## Non Goals

Do NOT implement:

- cloud storage provider integration
- CDN integration
- public file serving
- signed URLs
- file sharing
- file search/export APIs
- image resizing or optimization
- virus scanning
- resumable uploads
- chunked uploads
- file permission management UI
- analytics dashboards
- external event publishing

Rules:

- Prefer the simplest implementation that satisfies current requirements.
- Avoid speculative abstractions for advanced file management.
- Keep storage abstraction thin and replaceable.
- Maintain readability and maintainability over extensibility.

---

## File Upload Model

File upload records what file was accepted and who owns it.

Authorization still determines whether an actor may access file metadata.

Authentication still determines the owner of user-owned uploads.

File upload must not change existing auth, permission, audit, or response
contracts.

Flow:

Upload request
↓
Authentication
↓
Upload middleware
↓
File service ownership assignment
↓
Storage service
↓
File repository persistence
↓
Safe file response