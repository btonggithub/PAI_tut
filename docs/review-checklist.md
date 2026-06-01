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