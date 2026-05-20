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
│   └── validation/
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

## Authorization Flow

Authentication verifies identity.

Authorization verifies permissions.

Example flow:

Request
↓
Authentication Middleware
↓
Authorization Middleware
↓
Controller
↓
Service
↓
Repository

---

## Current RBAC Direction

Current RBAC foundation goals:
- Role-aware protected routes
- Reusable authorization middleware
- Separation between authentication and authorization
- Policy-ready architecture preparation

Future direction:
RBAC
↓
Policy-based authorization
↓
Resource ownership enforcement
↓
Fine-grained permissions