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

## Structure

src/
├── app.js
├── server.js
│
├── config/
│   ├── db.js
│   └── env.js
│
├── controllers/
│   ├── auth/
│   ├── health/
│   ├── system/
│   └── user/
│
├── services/
│   ├── audit/
│   ├── auth/
│   ├── health/
│   ├── session/
│   ├── system/
│   └── user/
│
├── repositories/
│   ├── audit/
│   ├── auth/
│   ├── base/
│   ├── health/
│   ├── session/
│   ├── system/
│   └── user/
│
├── middleware/
│   ├── auth/
│   ├── security/
│   ├── validation/
│   └── errorHandler.js
│
├── models/
│   ├── auditLogModel.js
│   ├── sessionModel.js
│   └── userModel.js
│
├── routes/
│   ├── authRoutes.js
│   ├── healthRoutes.js
│   ├── systemRoutes.js
│   ├── userRoutes.js
│   └── index.js
│
├── policies/
│   └── userPolicy.js
│
├── permissions/
│   ├── hasPermission.js
│   ├── index.js
│   ├── rolePermissions.js
│   └── userPermissions.js
│
├── utils/
│   ├── AppError.js
│   ├── asyncHandler.js
│   ├── jwt.js
│   ├── pagination.js
│   ├── password.js
│   ├── query.js
│   ├── requestContext.js
│   └── response.js
│
└── tests/
    ├── fixtures/
    ├── helpers/
    ├── integration/
    └── unit/

---

## Target Structure After Phase 20

Phase 20 introduces a file upload foundation:

src/
├── models/
│   └── fileModel.js
│
├── middleware/
│   └── upload/
│       └── uploadFile.js
│
├── repositories/
│   └── file/
│       └── fileRepository.js
│
└── services/
    └── file/
        ├── fileService.js
        └── storageService.js

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