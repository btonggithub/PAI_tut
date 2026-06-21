# Conventions

## Naming Conventions

### Middleware
- Authentication middleware:
  - protect.js
- Authorization middleware:
  - authorize.js

---

### Role Naming

Use lowercase role names.

Examples:
- admin
- user
- moderator

Rules:
- Avoid uppercase role names
- Avoid mixed naming styles
- Keep role values predictable

---

### Authorization Naming

Use action-oriented naming.

Examples:
- authorize
- requirePermission
- requireRole
- requireOwnership

Avoid:
- checkStuff
- handlePermission

---

## Route Protection Convention

Protected routes must apply middleware in this order:

Route
↓
Authentication
↓
Authorization
↓
Validation
↓
Controller

Example:
router.get(
  '/',
  protect,
  requirePermission(USER_PERMISSIONS.READ),
  validateRequest(...),
  controller
);

---

## Repository Convention

Repositories should expose domain-oriented methods.

Preferred:
- findActiveUsers
- findUserProfile
- findPendingOrders

Avoid overly-generic business access patterns:
- save
- update
- delete
- findAll

Rules:
- Generic helpers belong in BaseRepository only
- Domain repositories should express business/domain intent

---

## Testing Convention

### Helpers
Reusable testing logic only.

Examples:
- auth header generators
- mock request builders
- reusable setup utilities

---

### Fixtures
Reusable static test data only.

Examples:
- user fixtures
- auth payload fixtures
- role fixtures

Rules:
- Avoid hardcoding repeated payloads inside tests
- Keep fixtures deterministic

---

## Policy Naming Convention

Policy functions must use:
  can<Action><Resource>()

Examples:
  canViewUser()
  canUpdateUser()
  canDeleteUser()
  canManageUsers()

Avoid:
  checkUser()
  validateUser()
  verifyAccess()

Reason:
Policy intent must be explicit.

### Policy File Convention

One resource per file.

Example:
policies/
 ├── userPolicy.js
 ├── orderPolicy.js
 └── paymentPolicy.js

---

## Token Naming Convention

Access token:
accessToken

Refresh token:
refreshToken

Session identifier:
sessionId

### Session Naming Convention

Session model:
Session

Repository:
sessionRepository

Service:
sessionService

### Authentication Flow Convention

Authentication order:

Login
↓
Create Session
↓
Issue Tokens
↓
Return Response

Refresh order:

Refresh Request
↓
Verify Refresh Token Signature
↓
Extract Session Identifier
↓
Validate Active Session
↓
Compare Refresh Token Hash
↓
Rotate Tokens
↓
Update Session

---

## Permission Naming Convention

Format:
resource.action

Examples:
 user.read
 user.update
 user.delete
 user.manage

 role.read
 role.update

 audit.read

Rules:
- Use lowercase resource names.
- Use lowercase action names.
- Keep permission names capability-based, not role-based.
- Do not encode role names into permission names.

### Permission Constants Convention

Permissions must be centralized.

Example:
permissions/
 ├── userPermissions.js
 └── rolePermissions.js

Avoid:
 'admin'
 'user.read'
 'user.delete'

inside services/controllers.

### Role-Permission Mapping Convention

Roles map to permission constants.

Example:
ROLE_PERMISSIONS = {
  admin: [
    USER_PERMISSIONS.READ,
    USER_PERMISSIONS.UPDATE,
    USER_PERMISSIONS.DELETE,
    USER_PERMISSIONS.MANAGE,
  ],
  user: [
    USER_PERMISSIONS.READ_SELF,
    USER_PERMISSIONS.UPDATE_SELF,
  ],
};

Rules:
- Role names remain lowercase.
- Role-permission mapping is server-owned.
- Do not accept permissions from request bodies.
- Do not store permission arrays in JWT payloads during Phase 18.

### Permission Middleware Convention

Permission middleware should use action-oriented naming.

Preferred:
requirePermission(USER_PERMISSIONS.READ)

Avoid:
checkPermission('user.read')

Rules:
- Permission middleware requires authentication first.
- Permission middleware must not query the database.
- Permission middleware must not contain route-specific business logic.
- Permission middleware returns 403 when the authenticated actor lacks permission.

### Authorization Convention

Authorization order:

Authentication
↓
Permission
↓
Policy
↓
Business Logic

Resource ownership convention:

Authentication
↓
Load Resource
↓
Policy
↓
Permission + Ownership
↓
Business Logic

---

## Policy Boundary Convention

Policies evaluate authorization decisions only.

Policies must not:
- mutate state
- write to database
- call external services
- throw HTTP responses
- create side effects

Policies may:
- evaluate ownership
- evaluate capability combinations
- evaluate actor-resource relationships

Reason:
Policies must remain deterministic and reusable.

---

## Audit Logging Convention

Audit action names use dot notation.

Format:
domain.action

Examples:
- auth.login
- auth.refresh
- auth.logout
- user.profile.update
- user.read.admin

Rules:
- Use lowercase action names.
- Keep action names event-like and stable.
- Keep action names separate from result values.
- Do not include user-provided text in action names.
- Do not build action names dynamically from request input.

### Audit Result Convention

Preferred result values:
- succeeded
- failed
- forbidden

Rules:
- Results must be predictable constants where practical.
- Avoid free-form result strings.
- Use metadata for additional context.

### Audit Entry Convention

Audit entries should capture:
- actorId
- actorRole
- action
- resourceType
- resourceId
- result
- ipAddress
- userAgent
- metadata
- createdAt

Rules:
- Metadata must not contain passwords, raw tokens, refresh token hashes, or secrets.
- Metadata should be compact and security-relevant.
- Missing actor information is allowed for unauthenticated events such as failed login.

### Audit Layer Convention

Audit logging belongs to:
- auditLogService
- auditLogRepository
- auditLogModel

Controllers and routes must not write audit logs directly.

Services may orchestrate audit logging after security-sensitive actions.

---

## File Upload Convention

Upload middleware should use action-oriented naming.

Preferred:
- uploadSingleFile
- uploadUserFile
- validateUploadedFile

Avoid:
- handleFileStuff
- processUploadThing
- saveReqFile

Rules:
- Upload middleware belongs in middleware/upload/.
- File metadata model should be named File or FileMetadata.
- File repository should be named fileRepository.
- File service should be named fileService.
- Storage abstraction should be named storageService.
- Route handlers should not access storage implementation details.

### File Metadata Naming Convention

Use server-owned names for persisted metadata.

Preferred fields:
- ownerId
- originalName
- storedName
- mimeType
- size
- extension
- storageKey
- storageProvider
- status

Rules:
- Use ownerId for authenticated file ownership.
- Use originalName only for display/reference, not storage lookup.
- Use storageKey for provider/local storage lookup.
- Do not persist client-provided paths as trusted paths.
- Keep file status values lowercase.

### File Status Convention

Preferred status values:
- active
- pending
- deleted

Rules:
- Avoid free-form status strings.
- Keep status values centralized where practical.
- Do not use physical deletion as the only deletion state if metadata is needed later.

### Upload Validation Convention

Upload validation should define:
- allowed MIME types
- maximum file size
- required file presence
- single-file or multi-file mode

Rules:
- Validate upload constraints before service workflow logic.
- Do not trust file extension without MIME/type validation.
- Do not trust MIME type without server-side constraints.
- Do not accept ownerId from request body for user-owned uploads.

---

## Email Module Conventions

Naming:

- emailService.js
- verificationService.js
- consoleEmailProvider.js
- verificationRepository.js
- verificationTokenModel.js

Verification tokens:

- tokenHash
- expiresAt
- usedAt

Do not use:

- token
- rawToken
- plainToken

---

## Cache Module Conventions 

- Cacheable endpoints: GET /api/v1/users/me, GET /api/v1/users, GET /api/v1/users/:id, GET /api/v1/files, GET /api/v1/files/:id
- Non-cacheable: POST/PUT/DELETE endpoints
- Key format: `baseKey:paramName=jsonValue`, built through `cacheService.buildCacheKey`
- TTL defaults: item/profile caches 3600s; list caches 1800s
- Invalidate cache on create/update/delete workflows that change cached data
- Record audit events outside cache fetchers when every access must be logged
- Keep authorization checks outside cache fetches when cached data may be reused across actors

---

## Event Module Conventions

Event names use lowercase dot notation.

Format:
domain.action

Examples:
- user.profile.updated.internal
- file.upload.persisted.internal
- email.verification.queued.internal

Rules:
- Use stable event names; do not build names from request input.
- Keep Phase 23 event names technical/internal, not public domain event contracts.
- Publish events from services after successful business state changes.
- Keep controllers, routes, repositories, and models event-unaware.
- Keep payloads compact and free of passwords, raw tokens, refresh token hashes, and secrets.
- Include occurredAt and metadata where useful.
- Include actor and resource information when available.
- Use correlationId only when available from request context or workflow context.
- Do not introduce distributed brokers, event sourcing, notifications, or domain events in Phase 23.

---

## Admin Module Conventions (Phase 24)

Route naming:
- Admin routes live under `/api/v1/admin`.
- Use explicit resource names such as `/admin/users`, `/admin/files`, `/admin/system`.

Controller naming:
- `adminController.js` for consolidated admin entrypoints, or domain-specific admin controllers when size requires split.
- Keep handler names action-oriented, for example `listUsers`, `getUserById`, `listFiles`, `getSystemStatus`.

Service naming:
- Use `adminService` for orchestration of admin workflows.
- Reuse existing `userService`, `fileService`, and `systemService` boundaries when behavior already exists.

Authorization convention:
- Apply admin checks in middleware/policy layers, never inline in controllers.
- Use centralized permission constants; do not hardcode permission strings in route/controller code.

Scope convention:
- Phase 24 focuses on admin API foundations and core read workflows.
- Detailed admin audit/activity views remain reserved for Phase 24.5.

---

## Admin Audit & Activity Conventions (Phase 24.5)

Route naming:
- Use admin audit namespace paths such as `/api/v1/admin/audit/logs`.
- Keep audit/activity endpoints read-only in this phase.
- Initial route: `GET /api/v1/admin/audit/logs`.

Query conventions:
- Support pagination with `page` and `limit` query params.
- Support deterministic sorting with `sort` query param.
- Support audit filters with explicit fields (for example action, result, actorId, resourceType, date range).
- Use `from` and `to` as ISO date range query params for audit `createdAt` filtering.

Controller conventions:
- Controllers parse validated query params only and remain HTTP-only.
- Controllers return standardized success/error response contracts.
- Admin audit controllers delegate to admin audit services only.

Service conventions:
- Services orchestrate read-only audit/activity retrieval.
- Services must not mutate audit entries or trigger side effects.
- Admin audit services may reuse audit log service read helpers.

Repository conventions:
- Repositories own all audit query construction.
- Repository methods should stay domain-oriented and pagination-ready.
- Audit log read helpers own filter, date range, sort, and pagination query construction.

---

## Domain Event Conventions (Phase 25)

Domain event names describe business facts that already happened.

Format:
`<domain>.<fact>.<version>`

Examples:
- `user.registered.v1`
- `user.email_verified.v1`
- `file.uploaded.v1`

Naming conventions:
- Use lowercase dot notation.
- Use past-tense facts, not commands.
- Include a version suffix from the first release.
- Do not build event names from request input.
- Keep names centralized in a domain event constants module.

Ownership conventions:
- Each event must have one owning domain.
- The owning domain owns the event name, payload builder, and compatibility rules.
- Consumers may depend on published contracts but must not mutate event payloads.

Payload conventions:
- Include `name`, `version`, `occurredAt`, `owner`, `actor`, `resource`, `metadata`, and optional `correlationId`.
- Keep payloads compact and explicit.
- Use stable IDs and primitive values instead of full database documents.
- Do not include passwords, raw tokens, token hashes, authorization headers, secrets, or private storage paths.

Versioning conventions:
- Additive payload fields are allowed inside the same version.
- Renaming, removing, or changing the meaning/type of an existing field requires a new version.
- Keep old versions available until consumers are migrated or the version is explicitly retired.

Publishing conventions:
- Publish domain events from services after successful business state changes.
- Reuse the existing event bus through a domain event publisher boundary.
- Keep controllers, routes, repositories, and models unaware of domain event publishing.
- Preserve existing REST response contracts when domain events are published.

Scope conventions:
- Phase 25 introduces event contracts and selected low-risk publishers only.
- Notifications, external brokers, event sourcing, outbox persistence, and public event APIs remain out of scope.

---

## OpenAPI Conventions (Phase 25.5)

OpenAPI files should describe the existing REST API contract.

Recommended locations:
- `src/docs/openapi.js` or `src/docs/openapiSpec.js` for OpenAPI configuration/spec.
- `src/docs/openapi/` for split path/schema/security modules when the spec grows.
- `src/routes/docsRoutes.js` for documentation endpoints if needed.
- `docs/api/` for static contract artifacts if the project chooses a docs-first file.

Path conventions:
- Document paths with the `/api/v1` prefix.
- Keep path parameters named exactly as route parameters.
- Use existing route nouns such as `/auth`, `/users`, `/files`, `/email`, `/admin`, and `/admin/audit`.
- Use resource-oriented paths only.
- Do not introduce verb-based path names for new documentation examples.
- Preserve existing REST endpoint naming exactly.

Tag conventions:
- `Health`
- `Auth`
- `Users`
- `Files`
- `Email`
- `Admin`
- `Audit`

Schema naming conventions:
- Use PascalCase schema names.
- Use `SuccessResponse`, `ErrorResponse`, and `PaginationMeta` for shared envelopes.
- Use resource-specific schema names such as `User`, `File`, `AuditLog`, and `SessionTokens`.
- Use request schema names ending in `Request`.
- Use response schema names ending in `Response`.
- Shared error schema uses `ErrorResponse`.
- Shared pagination schema uses `PaginationMeta`.

Auth conventions:
- Protected endpoints declare bearer authentication.
- Public endpoints explicitly omit security requirements.
- Admin endpoints include a description that admin permissions are required.

Response conventions:
- All documented success responses must use the existing standardized envelope.
- All documented error responses must use the existing standardized error envelope.
- List endpoints must include `meta` with the current pagination shape.

Upload conventions:
- File upload endpoint must use `multipart/form-data`.
- The uploaded file field name must match the current route/middleware contract.
- Do not document internal storage keys or filesystem paths as response fields.

Runtime documentation endpoint conventions:
- `GET /api/openapi.json` serves the OpenAPI JSON document.
- `GET /api/docs` serves Swagger UI or redirects to the documentation UI.
- Documentation routes must not be nested under `/api/v1` because they describe API versions rather than being versioned business endpoints.
