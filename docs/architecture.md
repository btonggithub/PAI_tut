# Architecture

## Architecture Style

Layered Modular Architecture

Request Flow:

Request
↓
Route
↓
Validation Middleware
↓
Controller
↓
Service
↓
Repository
↓
Database
↓
Response Utility
↓
JSON Response

Error Flow:

Request
↓
Route / Controller / Service / Repository
↓
AppError
↓
Error Middleware
↓
JSON Error Response

---

## Layers

### Infrastructure Layer
Responsible for application/runtime configuration.

Contains:
- config/
- database connection
- environment validation

---

### Transport Layer
Responsible for HTTP transport and route registration only.

Contains:
- routes/

Rules:
- No business logic
- No validation logic
- No database access

---

### Validation Layer
Responsible for request validation before controller execution.

Contains:
- middleware/validation/

Rules:
- Validate req.body / req.query / req.params
- Joi schemas only
- Validation errors flow through AppError

---

### Application Layer

#### Controllers
Responsible for HTTP-only concerns.

Contains:
- controllers/

Responsibilities:
- Read request data
- Call services
- Return standardized responses

Rules:
- No business logic
- No database access
- No validation logic
- Must use asyncHandler

---

#### Services
Responsible for business/application logic.

Contains:
- services/

Responsibilities:
- Business rules
- Orchestration
- Application flow
- Error handling with AppError

Rules:
- No Express req/res usage
- No response formatting
- No direct database access

---

#### Repositories
Responsible for data access abstraction.

Contains:
- repositories/

Responsibilities:
- Database queries
- Data persistence
- Data retrieval
- Query abstraction

Rules:
- No HTTP logic
- No response formatting
- No validation logic
- No business rules

---

### Data Layer

Contains:
- models/

Responsibilities:
- Mongoose schema definitions
- Index definitions
- Database structure

---

### Cross-cutting Utilities

Contains:
- utils/

Examples:
- asyncHandler
- AppError
- response utility
- jwt utility
- password utility

---

### Error System

Contains:
- middleware/errorHandler.js

Responsibilities:
- Centralized error responses
- Operational error handling
- Standardized JSON error format

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
│   └── system/
│
├── services/
│   ├── auth/
│   ├── health/
│   └── system/
│
├── repositories/
│   ├── auth/
│   ├── health/
│   └── system/
│
├── models/
│   └── userModel.js
│
├── middleware/
│   ├── auth/
│   ├── validation/
│   └── errorHandler.js
│
├── routes/
│   ├── authRoutes.js
│   ├── healthRoutes.js
│   ├── systemRoutes.js
│   └── index.js
│
├── utils/
│   ├── AppError.js
│   ├── asyncHandler.js
│   ├── jwt.js
│   ├── password.js
│   └── response.js

---

## Current Phase

Phase 11 — Scalable Data Architecture

Goals:
- Base repository abstraction
- Reusable pagination/query utilities
- Consistent database access patterns
- Query scalability preparation
- MongoDB optimization foundation