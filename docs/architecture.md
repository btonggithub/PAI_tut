# Architecture

## Architecture Style

Layered Modular Architecture

Goals:
- Scalability
- Maintainability
- Clear responsibility boundaries
- Predictable request lifecycle
- Incremental architecture evolution

---

## Current Structure

src/
|-- app.js
|-- server.js
|-- config/
|   |-- db.js
|   |-- env.js
|   `-- upload.js
|-- controllers/
|   |-- admin/
|   |-- auth/
|   |-- email/
|   |-- file/
|   |-- health/
|   |-- system/
|   `-- user/
|-- middleware/
|   |-- auth/
|   |-- security/
|   |-- upload/
|   |-- validation/
|   |-- errorHandler.js
|   `-- requestContext.js
|-- models/
|   |-- auditLogModel.js
|   |-- fileModel.js
|   |-- sessionModel.js
|   |-- userModel.js
|   `-- verificationTokenModel.js
|-- permissions/
|   |-- hasPermission.js
|   |-- index.js
|   |-- rolePermissions.js
|   `-- userPermissions.js
|-- policies/
|   `-- userPolicy.js
|-- repositories/
|   |-- audit/
|   |-- auth/
|   |-- base/
|   |-- email/
|   |-- file/
|   |-- health/
|   |-- session/
|   |-- system/
|   `-- user/
|-- routes/
|   |-- adminRoutes.js
|   |-- authRoutes.js
|   |-- emailRoutes.js
|   |-- fileRoutes.js
|   |-- healthRoutes.js
|   |-- index.js
|   |-- systemRoutes.js
|   `-- userRoutes.js
|-- services/
|   |-- admin/
|   |-- audit/
|   |-- auth/
|   |-- cache/
|   |-- email/
|   |-- event/
|   |-- file/
|   |-- health/
|   |-- session/
|   |-- system/
|   `-- user/
`-- utils/
    |-- AppError.js
    |-- asyncHandler.js
    |-- cache.js
    |-- jwt.js
    |-- pagination.js
    |-- password.js
    |-- query.js
    |-- requestContext.js
    |-- response.js
    `-- token.js

tests/
|-- fixtures/
|-- helpers/
|-- integration/
`-- unit/

---

## Current Module Extensions

The current implementation includes file, email verification, audit, permission, cache, event, admin, and admin audit foundations:

src/
|-- controllers/
|   |-- admin/
|   |   |-- adminAuditController.js
|   |   `-- adminController.js
|   |-- email/
|   `-- file/
|-- middleware/
|   `-- upload/
|       `-- uploadFile.js
|-- models/
|   |-- auditLogModel.js
|   |-- fileModel.js
|   `-- verificationTokenModel.js
|-- repositories/
|   |-- audit/
|   |-- email/
|   `-- file/
|-- routes/
|   |-- adminRoutes.js
|   |-- emailRoutes.js
|   `-- fileRoutes.js
`-- services/
    |-- admin/
    |   |-- adminAuditService.js
    |   `-- adminService.js
    |-- cache/
    |   `-- cacheService.js
    |-- email/
    |-- event/
    |   |-- bootstrapInternalEvents.js
    |   |-- eventBus.js
    |   |-- eventNames.js
    |   |-- eventPayload.js
    |   |-- eventRegistry.js
    |   |-- index.js
    |   `-- internalEventHandlers.js
    `-- file/
        |-- fileService.js
        `-- storage/

---

## Layers

### Transport Layer
Responsible for HTTP transport and route registration only.

Contains:
- routes/

Rules:
- No business logic
- No validation logic
- No database access
- No authorization rules

---

### Middleware Layer
Responsible for reusable request pipeline behavior.

Contains:
- middleware/

Responsibilities:
- Validation
- Authentication
- Authorization
- Security middleware
- Request preprocessing

Rules:
- No business logic
- No database query orchestration
- Keep middleware reusable and composable

---

### Controller Layer
Responsible for HTTP request/response handling only.

Contains:
- controllers/

Responsibilities:
- Read request data
- Call services
- Return standardized responses
- Forward errors

Rules:
- No business logic
- No database access
- No authorization rules
- No validation logic

---

### Service Layer
Responsible for business workflows and application rules.

Contains:
- services/

Responsibilities:
- Business workflows
- Application orchestration
- Cross-module coordination
- Authorization decisions orchestration

Rules:
- No HTTP handling
- No response formatting
- No direct database access
- No raw Express objects

---

### Repository Layer
Responsible for data access abstraction.

Contains:
- repositories/

Responsibilities:
- Database queries
- Data persistence
- Data retrieval
- Query abstraction
- Pagination-ready querying

Rules:
- No HTTP logic
- No response formatting
- No validation logic
- No business rules

---

### Utility Layer
Responsible for reusable shared helpers.

Contains:
- utils/

Responsibilities:
- JWT utilities
- Password utilities
- Query utilities
- Pagination utilities
- Response utilities

Rules:
- No business-specific logic
- Keep utilities reusable
- Avoid module coupling

---

### Authorization Layer

Responsible for permission evaluation and ownership checks.

Contains:
policies/
middleware/auth/
permissions/

Responsibilities:
- Resource authorization
- Ownership validation
- Permission evaluation
- Action authorization

Examples:
canViewUser()
canUpdateUser()
canDeleteUser()
canManageUsers()

Rules:
- No HTTP response creation
- No database write operations
- No business workflow logic
- No controller responsibilities

---

### Permission Layer

Responsible for permission evaluation only.

Contains:
permissions/

Rules:
- No database access
- No HTTP logic
- No controller logic
- No repository access
- Pure permission evaluation only
- Permission names must be centralized constants
- Role-to-permission mapping must be centralized

Example:

admin
↓
rolePermissions
↓
user.read
↓
hasPermission(actor, USER_PERMISSIONS.READ)

Responsibilities:
- Define permission constants
- Map roles to permissions
- Evaluate actor permissions
- Support permission-aware policies

Non-responsibilities:
- Resource ownership decisions
- HTTP response creation
- Database queries
- Business workflows

---

## Authorization Flow

Authentication verifies identity.
Authorization verifies permissions.

Example flow:

Request
 ↓
Access Token Verification
 ↓
Authenticated User
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database

---

## Current Authorization Direction

Current authorization foundation:

### Authentication
Implemented:
- JWT-based authentication
- Protected route middleware
- Current user context resolution
- Session-independent access control

### Role-Based Access Control (RBAC)
Implemented:
- User roles (user, admin)
- Reusable authorize middleware
- Route-level role enforcement
- Authentication and authorization separation

### Policy-Based Authorization
Implemented:
- Centralized policy definitions
- Resource-aware authorization
- Ownership-based access decisions
- Reusable policy evaluation layer
- Consistent authorization rules across modules

### Permission System Goals
Implemented:
- Centralized permission constants
- Centralized role-to-permission mapping
- Reusable permission evaluation helper
- Permission middleware for route-level checks
- Permission-aware policies for resource decisions
- Reduced hardcoded role checks in services and policies

Future direction:

Authentication
↓
Permissions
↓
Policies
↓
Resource authorization
↓
Fine-grained access control
↓
Domain-Specific Authorization Policies

---

## Session Layer

Responsible for session lifecycle management.

Contains:
models/sessionModel.js
repositories/session/
services/session/

Rules:
- No HTTP logic
- No controller logic
- No response formatting
- Session persistence only

Responsibilities:
- Refresh token storage
- Session lookup
- Session revocation
- Session expiration tracking

Refresh Token Flow:

Login
↓
Create Session
↓
Issue Access Token
↓
Issue Refresh Token
↓
Client
↓
Refresh Endpoint
↓
Verify Refresh Token
↓
Validate Active Session
↓
Compare Refresh Token Hash
↓
Atomically Rotate Refresh Token
↓
Issue New Access Token

### Current Authentication Direction

Current authentication goals:
- Short-lived access token authentication
- Secure refresh token flow
- Session invalidation support
- Refresh token replay protection
- Storage-independent session identifiers

Future direction:

Access Token
↓
Refresh Token
↓
Session Store
↓
Device Sessions
↓
Advanced Security Controls

---

## Phase 18 Permission Flow

Route-level permission check:

Request
↓
Authentication Middleware
↓
Permission Middleware
↓
Validation Middleware
↓
Controller
↓
Service

Resource-level policy check:

Service
↓
Load Resource When Needed
↓
Policy Function
↓
Permission Evaluation
↓
Ownership Evaluation
↓
Business Logic

Rules:
- Route middleware may check broad permissions such as user.read.
- Services may orchestrate policy decisions with actor and resource data.
- Policies must remain pure and return boolean only.
- Permissions must be evaluated from server-controlled role mappings.

Policies must not call middleware.

Middleware must not call controllers.

Permission helpers must not depend on policies.

Keep authorization flow acyclic and layered.

---

### Authorization Dependency Rules

Authorization components must not create circular dependencies.

Allowed direction:

Middleware may import permission helpers.
Services may import policies.
Policies may import permission helpers.
Permission helpers must not import policies, services, repositories, or middleware.

Disallowed examples:

- Policy importing middleware
- Permission helper importing repositories
- Services importing middleware
- Policies importing services for permission evaluation

Rules:
- Middleware orchestrates request authorization flow.
- Permission helpers remain pure capability evaluators.
- Policies remain pure business authorization evaluators.
- Services may orchestrate authorization decisions but must not depend on middleware.
- Authorization utilities must remain dependency-light and reusable.

---

## Audit Logging Layer

Responsible for recording security-sensitive actions and important account activity.

Contains:
models/auditLogModel.js
repositories/audit/
services/audit/

Responsibilities:
- Persist audit log entries
- Normalize audit event payloads
- Capture actor, action, resource, result, and request metadata
- Support future audit review workflows

Rules:
- Controllers must not write audit logs directly.
- Repositories own audit log database writes.
- Services orchestrate audit logging as part of business workflows.
- Audit logging must not expose sensitive secrets, passwords, or tokens.
- Audit logging must not depend on event infrastructure during Phase 19.

Recommended audit entry shape:

actor
↓
action
↓
resource
↓
metadata
↓
result
↓
timestamp

Examples:
- auth.login
- auth.logout
- auth.refresh
- user.profile.update
- user.read.admin

---

## Phase 19 Audit Logging Flow

Service-level audit logging:

Request
↓
Authentication / Authorization
↓
Controller
↓
Domain Service
↓
Business Action
↓
Audit Log Service
↓
Audit Log Repository
↓
Database

Rules:
- Audit logging is orchestrated from services, not controllers or routes.
- Audit repository owns all audit log persistence.
- Audit logs should capture enough context for security review without storing secrets.
- Audit failures should be handled deliberately and consistently by the audit service.
- Phase 19 must use direct service orchestration, not event-driven infrastructure.

---

## File Upload Layer

Responsible for accepting validated uploads, storing file metadata, and preparing
storage abstraction for future storage backends.

Contains:
middleware/upload/
models/fileModel.js
repositories/file/
services/file/

Responsibilities:
- Parse multipart upload requests
- Validate file size, type, and required file presence
- Persist file metadata
- Associate uploaded files with the authenticated owner
- Keep storage-specific details behind a service boundary

Rules:
- Controllers must not access multipart parser internals directly.
- Controllers must not write file metadata directly.
- Repositories own file metadata database access.
- Services orchestrate file ownership, metadata normalization, and storage calls.
- Upload middleware validates transport-level upload constraints.
- File upload must not trust client-provided ownerId, path, extension, or MIME type blindly.

Recommended file metadata shape:

owner
↓
originalName
↓
storedName
↓
mimeType
↓
size
↓
storageKey
↓
status
↓
createdAt

---

## Phase 20 File Upload Flow

Request
↓
Authentication Middleware
↓
Permission / Ownership Middleware When Needed
↓
Upload Middleware
↓
Validation Middleware
↓
Controller
↓
File Service
↓
Storage Service
↓
File Repository
↓
Database

Rules:
- Upload parsing belongs in middleware, not controllers.
- File metadata persistence belongs in repositories.
- File business workflows belong in services.
- Uploaded files must be associated with the authenticated user server-side.
- Phase 20 should prepare storage abstraction without adding cloud storage unless required.
- Existing authentication, authorization, audit, and response contracts must remain stable.

---

### Authorization Source of Truth

Authorization decisions must always originate from server-controlled state.

Trusted authorization sources:
- authenticated user identity
- server-side role mapping
- server-side permission mapping
- database resources

Untrusted authorization sources:
- request body permissions
- client-provided role lists
- frontend authorization flags
- JWT permission arrays

Rules:
- Clients may request actions but never define capabilities.
- JWTs identify actors but do not become the permission source of truth.
- Permissions are always resolved server-side.

---

## Email Verification Architecture

Controllers
    ↓
Verification Service
    ↓
Email Service
    ↓
Email Provider
    ↓
Console Email Provider

Repositories
    ↓
Verification Repository

Models
    ↓
Verification Token Model

Future Provider Pattern

EmailService
    ↓
ConsoleEmailProvider

Future:

EmailService
    ↓
SmtpProvider

EmailService
    ↓
SendGridProvider

EmailService
    ↓
SesProvider

---

## Cache Layer Architecture

Responsible for performance optimization through caching.

Contains:
- utils/cache.js (In-memory cache store)
- services/cache/cacheService.js (Cache orchestration)

Responsibilities:
- TTL-based value caching
- Automatic cache expiration
- Pattern-based cache invalidation
- Transparent caching integration
- Cache hit/miss logging

### Cache Flow

Request
    ↓
Service Layer
    ↓
Cache Check
    ↓
Cache Hit: Return cached value
    ↓
Cache Miss: Fetch from database
    ↓
Store in cache with TTL
    ↓
Return value

### Cache Integration Points

Current Integration:
- User service GET endpoints (getMe, getUserById, listUsers)
- File service GET endpoints (listUserFiles, getUserFile)
- Automatic invalidation on user updates and file uploads

Cache Keys:
- user:profile:userId="{userId}" (3600s TTL)
- user:id:userId="{userId}" (3600s TTL)
- users:list:limit={limit}:page={page}:... (1800s TTL)
- files:list:ownerId="{ownerId}":limit={limit}:page={page}:... (1800s TTL)
- file:id:fileId="{fileId}" (3600s TTL)

Notes:
- Cache keys are built with `cacheService.buildCacheKey(baseKey, params)`.
- Parameter names are sorted for stable cache keys.
- Audit events for cached reads are recorded outside cache fetchers so every access is logged, including cache hits.
- Authorization checks remain outside cache fetches when cached data can be shared across actors.

### In-Memory Cache Implementation

Features:
- Singleton CacheStore instance
- TTL-based automatic expiration using setTimeout
- Pattern matching for bulk invalidation (exact string or regex)
- No external dependencies

Methods:
- get(key): Retrieve cached value
- set(key, value, ttl): Store value with TTL
- delete(key): Remove value and clear timer
- has(key): Check if key exists
- clear(): Clear all cache
- getStats(): Retrieve cache statistics

### Future Extensibility

Cache abstraction allows migration to:
- Redis (distributed caching)
- node-cache (npm package)
- Memcached

To implement alternative cache backend:
1. Create new cache provider implementing same interface
2. Update cacheService to use new provider
3. No changes required to service layer

### Cache Invalidation Strategy

Automatic invalidation on:
- User profile updates
- User role/permission changes
- Bulk user operations
- File uploads
- Future file update/delete operations

Pattern-based invalidation:
- Exact string matching: `invalidateByPattern(cacheService.buildCacheKey('user:id', { userId }))`
- Regex pattern matching: `invalidateByPattern(/^users:list:/)`
- Owner-scoped file list invalidation through `invalidateFileCache({ ownerId, fileId })`

### Architecture Rules for Cache

Service Layer:
- Services call cache service methods
- Services remain business-logic focused
- Cache is transparent to callers

Cache Service:
- No direct repository access
- No HTTP logic
- No response formatting
- Pure cache orchestration

Repositories:
- Unchanged by cache layer
- No cache awareness
- No cache logic

Controllers:
- Unchanged by cache layer
- Same API contracts
- No cache awareness

---

## Event Foundation Architecture

Phase 23 introduces an in-process event foundation for decoupling selected
service reactions without introducing distributed messaging.

Contains:
- services/event/ (event bus, event names, payload builder, and handler registration)

Responsibilities:
- Publish application events from service workflows
- Register in-process handlers during application/service initialization
- Keep event names and payloads stable
- Track lightweight publish/handled/failed metrics
- Emit structured publish/handled/failed logs with correlationId where available
- Isolate handler failure behavior from HTTP controllers and repositories

### Event Flow

Service workflow
    ↓
Publish application event
    ↓
Event bus
    ↓
Registered handlers
    ↓
Handler side effects or follow-up service calls

### Event Foundation Rules

Services:
- May publish events after successful business state changes
- Must not depend on Express request or response objects
- Must preserve existing response contracts when publishing events

Event Bus:
- Owns subscribe, unsubscribe/reset, and publish behavior
- Owns publish/handled/failed metrics
- Owns structured event execution logs
- Has no database access
- Has no HTTP response formatting
- Does not implement business rules

Handlers:
- Must be registered explicitly
- Should use stable registration keys when startup code may run more than once
- Must keep side effects narrow and testable
- Must document whether failures are propagated or captured

Controllers, Routes, Repositories, Models:
- Must not publish or subscribe to application events directly
- Must not know about event handler registration

### Phase 23 Scope Boundary

Included:
- In-process event bus foundation
- Stable event contracts and conventions
- Unit tests for event publishing and handler behavior
- Handler reset helper for isolated tests

Excluded:
- Kafka, RabbitMQ, Redis Streams, SNS/SQS, or external queues
- Event sourcing
- Cross-process or distributed events
- Domain Events Foundation from Phase 25
- Notification Module from Phase 26
- Replacing existing audit logging, cache invalidation, or email workflows

---

## Architecture Evolution Summary

Phase 1-18: Core foundation
- Authentication, authorization, permissions, policy-based access control

Phase 19: Audit logging
- Security event tracking

Phase 20-20.5: File upload and email verification
- User-initiated operations with verification flow

Phase 21: Email verification refinement
- Public verification endpoints, deterministic token hashing

Phase 22: Cache layer foundation
- Performance optimization through transparent caching

Phase 23: Event foundation
- In-process application event bus preparation

Phase 23.5: Event integration hardening
- Event foundation wired to selected low-risk workflow(s)
- Feature-flag toggle for safe rollback
- Integration tests for success and handler-failure continuation

Phase 24: Admin module
- Admin route/controller/service structure under admin namespace
- Admin-only read workflows for user/file/system surfaces
- Existing repositories and shared service boundaries reused
- No admin UI or audit analytics introduced in this phase

Phase 24.5: Admin audit and activity views
- Admin audit/activity read endpoints with filtering/sorting/pagination
- Read-only extension over existing audit infrastructure
- Admin-only access and standardized response contracts
- No audit write pipeline replacement

## Phase 24 Architecture Preparation

Route namespace and boundary:
- `routes/adminRoutes.js` owns admin HTTP endpoints only.
- Route chain remains `protect -> authorize/requirePermission -> validation -> controller`.

Controller boundary:
- Admin controllers stay HTTP-only and map request/response contracts.
- Admin controllers must not contain business rules, DB queries, or policy logic.

Service boundary:
- Admin services orchestrate admin workflows and may compose existing user/file/system services.
- Admin services must reuse policy/permission checks and response DTO mapping patterns.

Repository boundary:
- Existing repositories remain the single data-access boundary.
- Phase 24 does not add analytics-style aggregation repositories reserved for Phase 24.5.

## Phase 24.5 Architecture Preparation

Route namespace and boundary:
- Admin audit routes live under `/api/v1/admin/audit/*`.
- Route chain remains `protect -> requirePermission(USER_PERMISSIONS.MANAGE) -> validation -> controller`.
- Implemented read endpoint: `GET /api/v1/admin/audit/logs`.

Controller boundary:
- Audit activity controllers remain HTTP-only and response-contract-safe.
- Controllers map query params and delegate filtering/pagination to service layer.
- `adminAuditController` delegates audit listing to the admin audit service only.

Service boundary:
- Admin audit services orchestrate read-only workflows and must not introduce write side effects.
- Services reuse existing audit service/repository boundaries instead of duplicating query logic.
- `adminAuditService` verifies admin capability and delegates read workflows to `auditLogService`.

Repository boundary:
- Audit repositories continue owning all audit query access.
- New read helpers must stay domain-oriented and pagination-friendly.
- `auditLogRepository.findAuditLogs` owns filtering, date range, sorting, and pagination query construction.

Scope boundary:
- Phase 24.5 is API-only and read-only for audit/activity views.
- Analytics dashboards, alerting, and external log shipping remain out of scope.
