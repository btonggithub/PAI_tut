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
│   ├── system/
│   └── user/
│
├── repositories/
│   ├── auth/
│   ├── base/
│   ├── health/
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
middleware/auth/policies/
services/policies/

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

## Authorization Flow

Authentication verifies identity.
Authorization verifies permissions.

Example flow:

Route
 ↓
Authentication
 ↓
RBAC
 ↓
Policy Authorization
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

### Policy-Based Authorization Goals
Phase 16 objectives:
- Centralized policy definitions
- Resource-aware authorization
- Ownership-based access decisions
- Reusable policy evaluation layer
- Consistent authorization rules across modules

Future direction:

Authentication
↓
RBAC
↓
Policy-Based Authorization
↓
Resource Ownership Rules
↓
Fine-Grained Permissions
↓
Domain-Specific Authorization Policies
