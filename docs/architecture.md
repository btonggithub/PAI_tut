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
│   ├── auth/
│   ├── health/
│   ├── session/
│   ├── system/
│   └── user/
│
├── repositories/
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
│   └── response.js
│
└── tests/
    ├── fixtures/
    ├── helpers/
    ├── integration/
    └── unit/

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
Phase 18 objectives:
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
