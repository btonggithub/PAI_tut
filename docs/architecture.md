# Architecture

## Infrastructure Layer

Responsible for environment and infrastructure configuration.

Contains:
- config/
- db/

Responsibilities:
- Environment configuration
- Database connection
- Infrastructure setup

Rules:
- No business logic
- No HTTP logic

---

## Transport Layer

Responsible for HTTP transport and route registration only.

Contains:
- routes/

Rules:
- No business logic
- No validation logic
- No database access
- No authentication business logic
- Routes must remain declarative only

---

## Validation Layer

Responsible for request validation before controller execution.

Contains:
- middleware/validation/

Responsibilities:
- Body validation
- Query validation
- Params validation
- Validation standardization

Rules:
- No business logic
- No database access
- No response formatting

---

## Authentication Layer

Responsible for authentication transport protection.

Contains:
- middleware/auth/
- utils/jwt.js
- utils/password.js

Responsibilities:
- JWT verification
- Bearer token extraction
- Authentication protection
- Password hashing/comparison

Rules:
- No response formatting
- No controller responsibilities
- No database queries outside service/repository flow

---

## Controller Layer

Responsible for HTTP request/response orchestration only.

Contains:
- controllers/

Responsibilities:
- Read request input
- Call services
- Return standardized responses

Rules:
- No database access
- No validation logic
- No business rules
- No direct Mongoose usage

---

## Service Layer

Responsible for business logic orchestration.

Contains:
- services/

Responsibilities:
- Business rules
- Application workflows
- Domain orchestration
- Security/business validation

Rules:
- No HTTP logic
- No response formatting
- No direct database access
- Must use repositories

---

## Repository Layer

Responsible for data access abstraction.

Contains:
- repositories/

Responsibilities:
- Database queries
- Data persistence
- Data retrieval
- Query abstraction
- Pagination abstraction
- Filtering abstraction

Rules:
- No HTTP logic
- No response formatting
- No validation logic
- No business rules

---

## Base Repository Layer

Responsible for reusable database access patterns.

Contains:
- repositories/base/

Responsibilities:
- Generic pagination
- Generic filtering
- Generic sorting
- Shared query behavior

Rules:
- No business/domain logic
- No HTTP logic
- No response formatting

---

## Model Layer

Responsible for schema/model definition.

Contains:
- models/

Responsibilities:
- Mongoose schemas
- Model definitions
- Database structure constraints

Rules:
- No HTTP logic
- No business workflows
- No response formatting

---

## Cross-cutting Utilities

Contains:
- utils/

Responsibilities:
- Shared reusable utilities
- Response formatting
- Async handling
- Query utilities
- Pagination utilities

---

## Error System

Responsible for centralized operational error handling.

Contains:
- middleware/errorHandler.js
- utils/AppError.js

Responsibilities:
- Centralized error flow
- Operational error handling
- Safe production error responses

Rules:
- Prevent internal leakage
- Standardize error contracts

---

## Security Layer

Responsible for application hardening and transport security.

Contains:
- middleware/security/

Responsibilities:
- Helmet registration
- CORS registration
- Request size limiting
- Security middleware centralization

---

## Testing Layer

Responsible for application verification and regression protection.

Contains:
- tests/

Structure:
- unit/
- integration/
- helpers/
- fixtures/

Responsibilities:
- Unit testing
- Integration testing
- Shared test setup
- Shared test fixtures

Rules:
- Tests must remain isolated
- Fixtures should be reusable
- Helpers should centralize setup logic

---

## Request Lifecycle

Request
↓
Route
↓
Validation Middleware
↓
Authentication Middleware
↓
Controller
↓
Service
↓
Repository
↓
BaseRepository
↓
Mongoose
↓
MongoDB
↓
Response Utility
↓
JSON Response

---

## Current Phase

Phase 14 — User Management Module

Goals:
- Expand user domain architecture
- Introduce scalable user query patterns
- Introduce reusable user repository methods
- Prepare role/permission scalability
- Improve modular domain separation