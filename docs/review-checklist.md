# Review checklist

## Before completion verify:

- architecture rules preserved
- controller remains HTTP-only
- service contains business logic
- repository owns DB access
- validation in middleware only
- response contract unchanged
- tests updated
- npm test passes

---

## Authorization Review

- Are ownership checks implemented in policies?
- Are controllers authorization-free?
- Is RBAC separated from policies?
- Are policy functions pure?
- Are permissions reusable?
- Are authorization scenarios tested?

---

## Session Architecture Review

### Session Layer

- Session model exists
- Session repository exists
- Session service exists
- Session persistence separated from controllers

### Refresh Token Flow

- Refresh token validated
- Session validated
- Token rotation implemented
- Old refresh token invalidated

### Logout Flow

- Session revocation implemented
- Refresh token unusable after logout

### Security

- Access token short-lived
- Refresh token is never stored as plain text
- Refresh token hash is stored in session records
- Refresh token hash comparison is used during refresh
- Session ownership verified
- Sensitive data not exposed in JWT payload


### Testing

- Session tests added
- Refresh tests added
- Logout tests added
- Existing tests continue passing

---

## Permission Architecture Review

Permission Design:
- Permissions follow resource.action convention
- Permission constants centralized
- Permission values are not duplicated
- No hardcoded permission strings in services
- No hardcoded permission strings in controllers
- No hardcoded permission strings in routes
- No permissions are trusted from client input

Authorization:
- Authorization separated from authentication
- Permission evaluation reusable
- Policies remain pure
- Policies do not access repositories
- Policies do not access HTTP layer
- Permission middleware does not contain ownership logic
- Permission middleware does not query the database

Maintainability:
- New roles can be added without changing services
- New permissions can be added centrally
- Permission mapping is centralized
- Authorization logic is reusable across modules

---

## Phase 18 Review

### Permission Module

- src/permissions exists
- User permission constants exist
- Role-permission mapping exists
- hasPermission helper exists
- Permission exports are centralized

### Permission Middleware

- requirePermission exists
- Requires authenticated user
- Returns 401 when actor is missing
- Returns 403 when actor lacks permission
- Uses permission constants
- Has unit tests

### Role-Permission Mapping

- admin permissions include user management capabilities
- user permissions are limited to self capabilities
- unknown roles resolve to no permissions
- Mapping is server-controlled
- Mapping is covered by tests

### Policy Integration

- User policies remain pure
- User policies return boolean only
- Permission checks use hasPermission or permission-aware helpers
- Ownership checks remain explicit
- Existing authorization behavior is preserved

### Route Integration

- Protected routes still apply protect first
- Permission middleware is used where appropriate
- Existing response contract remains unchanged
- Existing 401/403 behavior remains consistent

### Testing

- Permission constants tests added
- Role-permission mapping tests added
- hasPermission tests added
- Permission middleware tests added
- Policy tests updated
- Route/integration tests updated where behavior is affected
- Full test suite passes

### Ownership Review

- Ownership checks still exist
- Permission checks do not replace ownership checks
- Self-resource access remains protected
- Admin override behavior preserved

---

## Audit Logging Review

Audit Design:
- Audit log model exists
- Audit log repository exists
- Audit log service exists
- Audit action names are stable
- Audit result values are predictable
- Audit metadata is compact and security-relevant

Architecture:
- Controllers do not write audit logs directly
- Routes do not write audit logs directly
- Services orchestrate audit logging where appropriate
- Audit repository owns database access
- No direct Mongoose usage outside audit repository/model layer
- Existing response contract remains unchanged

Security:
- Passwords are not audited
- Raw access tokens are not audited
- Raw refresh tokens are not audited
- refreshTokenHash values are not audited
- Authorization headers are not audited
- Secrets/private keys are not audited
- Failed unauthenticated actions can be logged without actorId

Testing:
- Audit model tests added
- Audit repository tests added
- Audit service tests added
- Sensitive metadata sanitization tests added
- Workflow integration tests updated where behavior is affected
- Existing auth/session/permission tests continue passing

---

## Phase 19 Review

### Audit Module

- src/models/auditLogModel.js exists
- src/repositories/audit exists
- src/services/audit exists
- Audit exports/imports follow existing module patterns

### Audit Model

- Required fields are enforced
- Metadata defaults safely
- Timestamps are available
- Sensitive fields are excluded from schema and payloads

### Audit Repository

- Repository creates audit log entries
- Repository owns audit model usage
- Repository does not contain HTTP logic
- Repository has focused tests

### Audit Service

- Service normalizes audit payloads
- Service sanitizes metadata
- Service does not depend on raw Express request objects
- Service does not persist secrets or tokens
- Service has focused tests

### Workflow Integration

- Login success/failure audit coverage exists where practical
- Refresh/logout audit coverage exists where practical
- Profile update audit coverage exists where practical
- Admin user access audit coverage exists where practical
- Existing response contracts are preserved

### Scope Control

- No audit UI added
- No audit search/export API added
- No event infrastructure added
- No message queue added
- No external log shipping added
- Full test suite passes

---

## File Upload Review

File Upload Design:
- File metadata model exists
- File repository exists
- File service exists
- Storage service abstraction exists
- Upload middleware exists
- Upload validation is explicit and reusable

Architecture:
- Controllers do not parse multipart data directly
- Controllers do not write file metadata directly
- Routes do not call repositories directly
- Services orchestrate file ownership, storage, and metadata persistence
- File repository owns database access
- Storage service owns storage-specific details
- Existing response contract remains unchanged

Security:
- Upload endpoint requires authentication
- ownerId is assigned from authenticated actor
- ownerId from request body is ignored or rejected
- File size limit is enforced
- File type allowlist is enforced
- Original file name is not trusted as storage key
- Client-provided paths are not trusted
- Internal filesystem paths are not exposed in responses
- Raw file buffers are not stored in MongoDB

Testing:
- File model tests added
- File repository tests added
- File service tests added
- Storage service tests added where useful
- Upload middleware tests added
- Invalid upload integration tests added where practical
- Existing auth/session/permission/audit tests continue passing

---

## Phase 20 Review

### File Module

- src/models/fileModel.js exists
- src/repositories/file exists
- src/services/file exists
- src/middleware/upload exists
- File exports/imports follow existing module patterns

### File Model

- Required fields are enforced
- ownerId is required
- metadata defaults safely
- status defaults correctly
- timestamps are available
- raw file buffer fields are excluded from schema

### Upload Middleware

- Missing file is handled consistently
- Oversized file is rejected
- Disallowed file type is rejected
- Upload errors flow through centralized error handling
- Middleware does not contain business ownership logic
- Middleware does not call repositories

### File Repository

- Repository creates file metadata
- Repository can retrieve file metadata by id
- Repository can query files by owner
- Repository owns file model usage
- Repository does not contain HTTP logic
- Repository has focused tests

### Storage Service

- Storage keys or stored names are server-generated
- Original file names are not used directly as trusted paths
- Provider/local storage details are hidden behind the service
- Internal paths are not returned as public API fields

### File Service

- Service assigns ownerId from actor
- Service ignores client-provided ownerId
- Service calls storage service and repository in the correct order
- Service returns safe file DTOs
- Service does not depend on raw Express request objects
- Service has focused tests

### Workflow Integration

- Upload route requires authentication
- Upload route applies upload middleware before controller workflow
- File list/read routes are owner-scoped where implemented
- Existing response contracts are preserved
- Existing audit behavior is preserved

### Scope Control

- No cloud storage provider added unless explicitly required
- No CDN integration added
- No public file serving added
- No file sharing added
- No image processing added
- No virus scanning added
- No resumable/chunked upload added
- Full test suite passes

## Email Verification Review Checklist

### Architecture
- Email provider abstraction exists
- Controllers do not send emails
- Verification service does not use providers directly

### Security

- Raw tokens never stored
- Token hashes stored
- Tokens expire
- Tokens are single-use
- Tokens generated securely

### Testing

- Send verification success
- Verify success
- Verify invalid token
- Verify expired token
- Verify reused token
- Resend verification

### Cache layer

- Cache layer implemented
- TTLs applied for item/profile caches and list caches
- User GET endpoints use cache where applicable
- File GET endpoints use cache where applicable
- User updates invalidate profile, user-by-id, and user list caches
- File uploads invalidate owner file list caches
- Future file update/delete workflows invalidate item and list caches
- API endpoints return the same response contract for cache hits and misses
- Audit events for cached reads are recorded on every access when required
- Authorization checks remain outside cache fetches when cached data can be shared across actors
- Cache hit/miss/invalidation logging exists
- Cache misses fall back to repository/database fetches
- Unit tests cover cache store, cache service, and service-level cache use
- Integration tests cover cached GET behavior or an explicit reason is documented

---

## Phase 23 Event Foundation Review

### Architecture

- Event bus exists in the service/application layer
- Controllers do not publish events
- Routes do not publish events
- Repositories do not publish or subscribe to events
- Models do not know about events
- Event handlers are registered explicitly
- Existing response contracts are preserved

### Event Bus Behavior

- Publish works with one handler
- Publish works with multiple handlers
- Publish with no handlers is safe
- Handler failure behavior is defined and tested
- Handler state can be reset between tests
- Event names are stable dot-notation strings
- Event names remain technical/internal during Phase 23
- Payload shape is compact and predictable
- Publish/handled/failed metrics exist
- Structured publish/handled/failed logs include correlation id where available
- Duplicate handler registration is prevented with stable registration keys

### Security and Scope

- Event payloads do not include passwords, raw tokens, token hashes, or secrets
- No external message broker added
- No event sourcing added
- No distributed event delivery added
- No notification module behavior added
- No public event API added

### Testing

- Event bus unit tests added
- Event publisher/subscriber tests added
- Handler failure tests added
- Integration tests added only for workflows wired to the event bus
- Existing auth/session/permission/audit/file/email/cache tests continue passing

---

## Phase 23.5 Event Integration Hardening Review

### Integration Scope

- Event wiring is limited to one or two low-risk service workflows
- Controllers remain event-unaware
- Event wiring can be disabled via feature flag/config toggle

### Compatibility

- Existing endpoint response contracts remain unchanged
- Existing audit/cache/email/file behaviors remain compatible
- Handler failure isolation is verified in integration tests

### Testing

- Success-path integration test exists for event-connected workflow
- Handler-failure continuation integration test exists
- Event-disabled (`INTERNAL_EVENTS_ENABLED=false`) integration path exists

---

## Phase 24 Admin Module Review

### Architecture

- Admin routes exist under `/api/v1/admin/*`
- Admin controllers remain HTTP-only
- Admin services orchestrate business workflows
- Repositories remain the only DB access boundary

### Security and Authorization

- Unauthenticated access to admin endpoints returns 401
- Non-admin access to admin endpoints returns 403
- Admin authorization is enforced by middleware/policy, not inline controller checks
- Permission constants remain centralized and server-controlled

### Contract Safety

- Existing user-facing endpoints keep their response contracts
- Admin endpoint responses use shared response/error utilities

### Testing

- Integration tests cover admin success path(s)
- Integration tests cover admin 401 and 403 paths
- Existing module test suites remain green after admin module changes

---

## Phase 24.5 Admin Audit & Activity Views Review

### Architecture

- Admin audit routes exist under `/api/v1/admin/audit/*`
- `GET /api/v1/admin/audit/logs` is registered
- Audit controllers remain HTTP-only
- Audit services orchestrate read-only workflows
- Audit repositories remain the only audit query boundary

### Security and Authorization

- Unauthenticated access to admin audit endpoints returns 401
- Non-admin access to admin audit endpoints returns 403
- Admin authorization is enforced by middleware/policy boundaries

### Query Behavior

- Filter query params are validated in middleware
- Sort query params are validated and deterministic
- Pagination metadata is returned and consistent
- CreatedAt date range filters are built in the audit repository

### Contract and Scope Safety

- Existing user-facing contracts remain unchanged
- Existing audit write workflows remain unchanged
- No dashboard UI, alerting, or external log shipping logic is added

### Testing

- Integration tests cover admin audit success paths
- Integration tests cover 401 and 403 access control paths
- Integration tests cover filtering/sorting/pagination behavior

---

## Phase 25 Domain Events Foundation Review

### Architecture

- Domain event constants are centralized
- Domain event payload builders are centralized and domain-owned
- Domain event publisher delegates to the existing event bus
- Controllers do not publish domain events
- Routes do not publish domain events
- Repositories do not publish domain events
- Models do not know about domain events
- Existing technical/internal events remain compatible where still used

### Naming and Ownership

- Event names follow `<domain>.<fact>.<version>`
- Event names describe completed business facts
- Event names are not commands
- Event names are not built from request input
- Each event has one owning domain
- Event versions are explicit from the first release

### Payload Contract

- Payloads include name, version, occurredAt, owner, resource, and metadata
- Payloads include actor and correlationId when available and useful
- Payloads use stable IDs and primitives instead of full database documents
- Payloads do not include passwords
- Payloads do not include raw access tokens or refresh tokens
- Payloads do not include token hashes
- Payloads do not include authorization headers
- Payloads do not include secrets or private storage paths

### Compatibility

- Additive payload changes preserve the same version
- Breaking payload changes require a new version
- Tests cover payload builder output for each published event
- Existing REST response contracts remain unchanged
- Existing audit logging remains unchanged
- Existing cache invalidation behavior remains unchanged

### Publishing Behavior

- Domain events are published only after successful business state changes
- Publishing uses the domain event publisher boundary
- Handler failure behavior follows the existing event bus rules
- Event-disabled or handler failure paths do not break existing endpoint contracts

### Scope Control

- No external message broker is added
- No event sourcing is added
- No outbox/inbox persistence is added
- No notification delivery behavior is added
- No public event API is added

### Testing

- Unit tests cover domain event constants
- Unit tests cover payload builders
- Unit tests cover domain event publisher behavior
- Integration tests cover each workflow that publishes a domain event
- Existing auth/session/permission/audit/file/email/cache/admin tests remain compatible
