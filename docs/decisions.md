## Role-Based Authorization Strategy

Decision:
- Introduce RBAC middleware before policy-based authorization

Reason:
- Separate authentication vs authorization concerns
- Prepare scalable permission architecture
- Prevent authorization logic duplication in controllers/services
- Create reusable route protection patterns

---

## Authorization Responsibility Separation

Decision:
- Authentication middleware verifies identity
- Authorization middleware verifies permissions

Reason:
- Clear security boundaries
- Reusable middleware composition
- Cleaner controller/service layers
- Easier transition toward policy-based authorization

---

## Repository Ownership Rule

Decision:
- Repositories fully own database access

Reason:
- Prevent query leakage into services
- Keep services business-oriented
- Standardize query abstraction
- Improve long-term maintainability

---

## Testing Structure Strategy

Decision:
- Separate helpers and fixtures from test cases

Reason:
- Improve reusable test composition
- Prevent duplicated mock data
- Keep test suites maintainable as project grows

---

## Decision 016 — Authorization Separate From RBAC

Status:
Accepted

Context:
Role checks alone become insufficient as application complexity grows.

Examples:
- User can edit own profile
- Admin can edit any profile
- User cannot delete another user
- Manager can access team resources only

Decision:
Authorization policies will be implemented separately from RBAC.

RBAC determines:
Who are you?

Policy determines:
Can you perform this action?

Consequences:

Positive:
- Better scalability
- Cleaner permissions
- Reusable authorization logic

Negative:
- Additional abstraction layer
- More policy tests required

---

## Permission-Based Authorization

Status:
Accepted

Context:
Current RBAC supports only simple role checks.

Future business requirements may require:
- manager
- support
- editor
- auditor
- finance

Role-only authorization becomes difficult to maintain.

### Decision
Introduce permission abstraction layer.
Permissions become the primary authorization unit.
Roles become collections of permissions.

Example:
    admin
    ├── user.read
    ├── user.update
    ├── user.delete
    └── user.manage

    user
    ├── user.read.self
    └── user.update.self

Policies consume permissions instead of role names.

### Consequences

Benefits:
- Fine-grained authorization
- Easier role expansion
- Better microservice compatibility
- Reduced role coupling

Trade-offs:
- Additional authorization layer
- Slightly more complexity

---

### Future Event-Driven Architecture

Current architecture uses direct service orchestration.

Event-driven communication is intentionally deferred.

Future candidate events:

- user.registered
- user.updated
- user.deleted
- role.changed
- password.changed

Event infrastructure will be introduced only when
multiple independent modules need to react to the
same business event.

--- 

## Refresh Token Strategy

Status:
Accepted

Context:
Access tokens should remain short-lived.

Long-lived JWT access tokens increase security risk:
- Token theft exposure
- Difficult revocation
- Poor session control

### Decision

Use:
- Short-lived access token
- Long-lived refresh token
- Persistent session storage

Authentication flow:

Login
↓
Create Session
↓
Issue Access Token
↓
Issue Refresh Token

### Consequences

Benefits:
- Better security
- Session revocation capability
- Multi-device support
- Login tracking capability

Trade-offs:
- Additional session storage
- More authentication complexity

### Refresh Token Rotation

Status:
Accepted

Decision
Every refresh operation generates:
- New access token
- New refresh token
Old refresh token becomes invalid.

Benefits:
- Reduced replay attack risk
- Better session security

### Refresh Token Storage

Status:
Accepted

Decision:
Refresh tokens must not be stored as plain text.

Session records store only:
- refreshTokenHash

During refresh:
- The submitted refresh token is verified
- The matching active session is loaded
- The submitted token is hashed and compared with refreshTokenHash
- A new refresh token is generated
- The session refreshTokenHash is replaced

Reason:
If the database is leaked, plain refresh tokens would allow session takeover.
Hashing refresh tokens reduces the impact of session storage compromise.

---

## Decision 018 — Permission System Scope

Status:
Accepted

Context:
The current authorization stack supports authentication, RBAC, and resource policies.
However, route-level role checks such as admin-only access still couple authorization
rules directly to role names.

As the system grows, roles may change while capabilities remain stable.
Examples:
- admin can manage users
- support can read users
- auditor can read audit logs
- user can read and update own profile

Decision:
Phase 18 introduces an in-code permission system.

Permissions do not replace ownership-based authorization.

Ownership checks remain the responsibility of policy functions.

The system will include:
- permission constants
- role-to-permission mapping
- reusable permission evaluation helper
- permission middleware for route-level authorization
- permission-aware policy functions

Permissions become the stable authorization unit.
Roles remain server-controlled collections of permissions.

This phase will not introduce:
- permission database tables
- dynamic permission editing
- role management endpoints
- external policy engines

Consequences:

Design permission modules so future extraction to a dedicated authorization
service remains possible without changing route/service contracts.

Positive:
- Reduces hardcoded role checks
- Makes authorization rules easier to expand
- Keeps policies reusable
- Prepares future role management without requiring it now

Trade-offs:
- Adds one authorization abstraction layer
- Requires permission mapping tests
- Existing RBAC middleware must coexist during migration

---

## Permission Evaluation Strategy

Status:
Accepted

Decision:
Permission evaluation must be pure and server-controlled.

Rules:
- Permission constants are centralized.
- Role-to-permission mapping is centralized.
- User-provided permissions are never trusted.
- Controllers do not evaluate permissions.
- Repositories do not evaluate permissions.
- Policies may consume permission helpers but must remain pure.

Example:

admin
↓
ROLE_PERMISSIONS.admin
↓
USER_PERMISSIONS.READ
↓
hasPermission(actor, USER_PERMISSIONS.READ)

Reason:
Centralized permission evaluation prevents scattered string checks and keeps
authorization rules consistent across routes, services, and policies.

---

### Future Scalability Note

The Phase 18 permission system is intentionally implemented as a static in-code authorization layer.

The current design prioritizes:
- simplicity
- maintainability
- predictable authorization behavior
- low operational complexity

The architecture should remain compatible with future evolution such as:
- database-backed permissions
- role management APIs
- audit logging
- external policy engines
- distributed authorization systems

However, these capabilities are explicitly out of scope for the current phase.

Current implementation remains:
- server-controlled
- synchronous
- application remains MongoDB-backed
- permission mapping remains static and in-code
- single-service oriented
- static permission mapping based

---

## Decision 019 — Audit Logging Scope

Status:
Accepted

Context:
The project now supports authentication, sessions, role/permission authorization,
and protected user workflows. Security-sensitive actions should be recorded so
future operators can understand who did what, when, and whether the action
succeeded.

Examples:
- successful login
- failed login
- refresh token rotation
- logout/session revocation
- profile update
- admin user reads
- forbidden authorization attempts where practical

Decision:
Phase 19 introduces an in-application audit logging foundation.

The system will include:
- audit log model
- audit log repository
- audit log service
- centralized audit action/result constants where useful
- service-level audit orchestration for security-sensitive workflows

Audit logs must capture server-controlled context only.

Recommended fields:
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

This phase will not introduce:
- audit log UI
- audit search API
- export/reporting workflows
- event-driven audit logging
- external log shipping
- analytics dashboards
- alerting

Consequences:

Positive:
- Improves security traceability
- Prepares future admin activity review
- Keeps audit persistence separated from controllers
- Creates a foundation for future compliance workflows

Trade-offs:
- Adds write activity to selected service workflows
- Requires careful sensitive-data filtering
- Requires tests for audit model, repository, service, and integration points

---

## Audit Logging Strategy

Status:
Accepted

Decision:
Audit logging is orchestrated by services and persisted through an audit
repository.

Rules:
- Controllers do not create audit logs directly.
- Routes do not create audit logs directly.
- Repositories own audit log database access.
- Services may call auditLogService after security-sensitive actions.
- Audit entries must not include passwords, raw tokens, refresh token hashes, or secrets.
- Audit logging must preserve existing API response contracts.
- Phase 19 uses direct service orchestration, not event-driven infrastructure.

Reason:
Service-level orchestration keeps HTTP concerns out of audit persistence while
allowing business workflows to decide which actions are security-sensitive.

---

## Decision 020 — File Upload Foundation Scope

Status:
Accepted

Context:
The backend now has authentication, authorization, session management,
permissions, user workflows, and audit logging. The next step is to prepare a
safe foundation for user-owned file uploads without coupling the application to
a specific external storage provider too early.

Examples:
- user uploads a profile-related file
- authenticated user owns uploaded file metadata
- backend validates file size and type
- future modules can reuse the upload/storage boundary

Decision:
Phase 20 introduces a file upload foundation.

The system will include:
- upload middleware for multipart parsing and transport-level constraints
- file metadata model
- file repository
- file service
- storage service abstraction
- user-owned upload workflow preparation

File ownership must be assigned from authenticated server-side user context.
Client-provided owner IDs, storage paths, MIME types, and file extensions must
not be trusted as the source of truth.

Recommended metadata fields:
- ownerId
- originalName
- storedName
- mimeType
- size
- extension
- storageKey
- storageProvider
- status
- createdAt
- updatedAt

This phase will not introduce:
- public file CDN integration
- cloud object storage
- image processing
- virus scanning
- resumable uploads
- chunked uploads
- file sharing
- file permission management
- file search/export APIs

Consequences:

Positive:
- Establishes a reusable upload boundary
- Keeps file metadata persistence separated from controllers
- Prepares future storage providers without committing to one now
- Supports user-owned file workflows safely

Trade-offs:
- Adds multipart upload handling complexity
- Requires careful validation and test coverage
- Storage abstraction may look simple until a real provider is introduced

---

## File Storage Strategy

Status:
Accepted

Decision:
Phase 20 should use a storage abstraction even if the first implementation is
local or metadata-only.

Rules:
- Controllers must not write files directly.
- Controllers must not create file metadata directly.
- Upload middleware handles multipart parsing and basic upload constraints.
- File services orchestrate storage and metadata workflows.
- File repositories own file metadata database access.
- Storage service owns provider-specific storage details.
- File paths and storage keys must be generated server-side.
- Existing response contracts must remain standardized.

Reason:
A thin storage boundary keeps the file module reusable when the project later
adds cloud storage, scanning, processing, or file-serving policies.

---

## Decision 021 - Email Verification Provider Abstraction

Status:
Accepted

Context:
Email verification requires delivery mechanisms that may change over time.

Decision:
Business logic must not depend directly on SMTP or vendor-specific implementations.

Email delivery must occur through EmailService and provider abstractions.

Consequences:

Positive:
- Easy provider replacement
- Better testing
- Reusable for future notification features

Negative:
- Additional abstraction layer

---

## Decision 022 - Cache Layer Foundation

- Cache Technology: Node.js in-memory cache for the foundation phase
- Future Provider: Redis remains the preferred distributed cache option
- Key format: `baseKey:paramName=jsonValue`, built by `cacheService.buildCacheKey`
- TTL defaults: user profile/user by id/file by id = 3600s; user list/file list = 1800s
- Invalidation: on user update and file upload, with create/update/delete hooks added as those workflows exist
- Fallback: DB query if cache miss

---

## Decision 023 - Event Foundation

- Event Technology: in-process Node.js event bus for the foundation phase
- Event Scope: application events published from service workflows only
- Handler Scope: explicitly registered in-process handlers only
- Event Naming: stable technical/internal dot-notation names such as `user.profile.updated.internal` or `file.upload.persisted.internal`
- Payload Shape: compact object containing event name, occurredAt, actor, resource, metadata, and optional correlationId
- Error Strategy: event bus behavior must define whether handler failures are captured or propagated; tests must cover that behavior
- Observability Strategy: event bus records lightweight publish/handled/failed metrics and structured logs with correlationId where available
- Registration Strategy: event handler registration must prevent duplicate startup/test re-run registrations where a stable key is provided
- Out of Scope: external brokers, event sourcing, distributed events, domain events, notifications, and public event APIs
- Future Path: Domain Events Foundation and Notification Module may consume this foundation in later phases

---

## Decision 024 - Admin Module Scope and Boundary

Status:
Accepted

Decision:
Phase 24 introduces admin-only API foundations with strict architecture boundaries:

- Admin endpoints are exposed under `/api/v1/admin/*`.
- Admin controllers stay HTTP-only.
- Admin services orchestrate business behavior and reuse existing repositories/services where possible.
- Authorization for admin endpoints remains server-controlled through middleware and policy boundaries.
- Existing user-facing endpoint contracts must remain unchanged.

Deferred to Phase 24.5:
- Admin audit/activity read views
- Advanced filtering/sorting/pagination for audit streams
- Analytics-style reporting workflows

Rationale:
Splitting Phase 24 and 24.5 keeps initial admin API delivery focused and prevents audit analytics concerns from bloating core admin module delivery.

Consequences:

Positive:
- Faster and safer rollout of admin API capabilities
- Better separation between operational admin APIs and audit analytics
- Lower regression risk for existing user-facing modules

Negative:
- Some admin observability use cases remain deferred until 24.5

---

## Decision 024.5 - Admin Audit & Activity View Scope

Status:
Accepted

Decision:
Phase 24.5 introduces read-only admin audit/activity APIs with strict constraints:

- Endpoints remain admin-only and API-only.
- Audit writes remain unchanged and continue through existing write workflows.
- Audit/activity APIs support filtering, sorting, and pagination for operational review.
- Existing response contracts and middleware boundaries remain unchanged.

Out of Scope in this phase:
- Dashboard UI
- External log shipping integrations
- Alerting and analytics pipelines

Rationale:
Operational teams need API-level audit visibility before UI/analytics investments. Keeping this phase read-only minimizes risk to security-critical audit write flows.

Consequences:

Positive:
- Faster delivery of admin audit visibility
- Preserves audit write stability
- Improves traceability for admin operations

Negative:
- No visual dashboard experience yet
- Advanced analytics remain deferred

Implementation note:
- `GET /api/v1/admin/audit/logs` is the initial read-only admin audit endpoint.
- Supported query behavior includes pagination, deterministic sorting, explicit filters, and createdAt date ranges.
- Audit writes remain unchanged and continue through existing service workflows.

---

## Decision 025 - Domain Events Foundation

Status:
Accepted

Decision:
Phase 25 introduces stable domain event contracts on top of the existing
in-process event foundation.

Domain events represent business facts that already happened. They are not
commands, API requests, audit records, cache invalidation messages, or
notification delivery jobs.

Phase 25 includes:
- Centralized domain event names.
- Versioned event names from the first contract.
- Domain-owned payload builders.
- A domain event publisher boundary that delegates to the existing event bus.
- Focused tests for event contracts, payload shape, publisher behavior, and selected workflow publication.

Naming:
- Domain event names use lowercase dot notation plus a version suffix.
- Format: `<domain>.<fact>.<version>`.
- Initial examples: `user.registered.v1`, `user.email_verified.v1`, `file.uploaded.v1`.

Payload contract:
- Payloads include event name, version, occurredAt, owner, actor, resource, metadata, and correlationId when available.
- Payloads must not include passwords, raw tokens, refresh token hashes, verification token hashes, authorization headers, or secrets.
- Event contracts must be additive-compatible inside a version.
- Breaking payload changes require a new version.

Architecture boundary:
- Services may publish domain events after successful state changes.
- Controllers, routes, repositories, and models must remain domain-event-unaware.
- Domain event publishers must reuse the Phase 23 event bus instead of introducing a new dispatch mechanism.

Out of Scope:
- External brokers
- Event sourcing
- Persistent outbox/inbox patterns
- Cross-process delivery guarantees
- Notification delivery
- Public event APIs
- Replacing audit logging or cache invalidation

Rationale:
The project already has a technical event bus and one low-risk integration.
Phase 25 upgrades that foundation into explicit business contracts without
changing transport, persistence, or delivery guarantees.

Consequences:

Positive:
- Clear event ownership and versioning
- Safer future notification and microservice preparation
- Better testability for business event contracts

Negative:
- Additional contract layer to maintain
- Domain events remain in-process until a later broker/outbox phase
