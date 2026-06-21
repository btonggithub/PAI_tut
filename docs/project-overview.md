# Project Overview

## Project Goal

Build a scalable Node.js REST API backend using Express.js with clean architecture principles, standardized error handling, modular domain organization, reusable data-access patterns, and production-ready authentication/authorization flows.

The project focuses on:
- Clean backend architecture
- Scalable module organization
- Standardized API patterns
- Separation of concerns
- Maintainable Express.js structure
- Incremental architecture evolution
- Long-term scalability

---

## Current Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Joi
- JWT
- bcrypt
- Jest
- Supertest
- Helmet
- CORS
- Nodemon

---

## Current Architecture Status and Active Phase Preparation

The project currently implements:

### Infrastructure
- Environment configuration validation
- MongoDB connection management

### Application Foundation
- Express application bootstrap
- Modular route registration
- API versioning support

### Error Handling
- Centralized error handling
- AppError operational error pattern
- Standardized error response contract

### Security Foundation
- Helmet integration
- CORS integration
- Request size limiting
- JWT authentication middleware

### Data Access Layer
- Repository pattern
- BaseRepository abstraction
- Pagination utilities
- Query filtering utilities

### Testing Foundation
- Jest test infrastructure
- Supertest integration testing
- Unit testing conventions

### User Management
- User module foundation
- User profile management
- Pagination-ready user listing
- User profile update workflow
- Safe user DTO mapping

### Authorization Foundation
- Role-Based Access Control (RBAC)
- Admin role support
- Authorization middleware
- Route-level authorization enforcement
- Resource ownership enforcement

### Authorization Policy System
- Policy-based authorization foundation
- Resource ownership policy evaluation
- Route-level authorization enforcement
- Policy abstraction preparation
- Resource access policy preparation

### Authentication
- JWT access token authentication
- Protected route middleware
- Authenticated user context
- Refresh token lifecycle
- Persistent session storage
- Refresh token rotation
- Session revocation
- Storage-independent session identifiers
- Token type enforcement

### Session Management
- Session model
- Session repository
- Session service
- Refresh token hash persistence
- Session revocation workflow
- Expired session TTL cleanup

### Permission Foundation
- Permission constants
- Role-to-permission mapping
- Permission evaluation helper
- Permission middleware
- Permission-aware policy checks
- Fine-grained authorization preparation

### Audit Logging Foundation
- Audit log model
- Audit repository
- Audit service with metadata sanitization
- Security-sensitive action tracking
- Auth/user/admin activity audit events
- Non-blocking audit persistence behavior

### File Upload Foundation
- File upload middleware
- File metadata model
- File repository
- File service
- Storage abstraction
- User-owned file workflow

### Cache Layer Foundation
- In-memory cache store with TTL expiration
- Cache service wrapper for read-through caching
- Cache hit/miss/invalidation logging
- User GET endpoint caching
- File GET endpoint caching
- Cache invalidation on user updates and file uploads
- Redis-ready cache provider boundary for future distributed caching

### Event Foundation
- In-process event bus foundation
- Service-layer event publishing preparation
- Stable application event naming and payload conventions
- Explicit event handler registration helper
- Unit-tested handler failure behavior
- No distributed message broker or event sourcing in Phase 23

### Admin API Foundation
- Admin API namespace under `/api/v1/admin/*`
- Admin-only read workflows for users, files, and system information
- Shared admin authorization via `protect` and `requirePermission(USER_PERMISSIONS.MANAGE)`
- Admin controllers remain HTTP-only
- Admin services reuse existing service and repository boundaries where practical

### Admin Audit and Activity Views
- Read-only admin audit endpoint at `GET /api/v1/admin/audit/logs`
- Filtering by action, result, actor, resource, and createdAt date range
- Pagination and deterministic sorting for audit review workflows
- Audit metadata sanitization preserved in read DTOs
- Existing audit write workflows remain unchanged

### Domain Events Preparation
- Phase 25 is completed
- Existing Phase 23/23.5 in-process event bus remains the dispatch foundation
- Domain events add business-level event contracts, ownership, payload builders, and versioning
- Domain events must preserve existing REST response, audit, cache, file, email, and admin contracts

### API Contract / OpenAPI
- Phase 25.5 is completed
- OpenAPI contract lives in `src/docs/openapi.js`
- Runtime documentation routes live in `src/routes/docsRoutes.js`
- `GET /api/openapi.json` serves the OpenAPI JSON contract
- `GET /api/docs` serves Swagger UI
- Existing `/api/v1` runtime behavior and response contracts remain unchanged

---

## Architectural Principles

- Thin route layer
- HTTP-only controllers
- Service-based business logic
- Repository-owned database access
- Middleware-only validation
- Centralized error handling
- Standardized JSON responses
- Modular domain structure
- Incremental architecture evolution

---

## Current Request Lifecycle

Request
↓
Route
↓
Security Middleware
↓
Authentication Middleware
↓
Authorization / Permission Middleware
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

---

## Database Layer

Current database stack:
- MongoDB
- Mongoose

Current architecture includes:
- Repository abstraction
- Shared BaseRepository patterns
- Pagination utilities
- Query utilities
- Reusable filtering/sorting patterns

Current database responsibilities:
- Data persistence
- Query abstraction
- Pagination-ready querying
- Reusable repository patterns

Future direction:
Controller
→ Service
→ Authorization Policy
→ Repository
→ Database

---

### File Management

- File metadata persistence
- Local storage provider
- Storage abstraction layer
- Upload validation
- Ownership enforcement

---

## Current Phase Status

### Phase 24.5 - Admin Audit & Activity Views

Status: Completed

Delivered:
- Admin-only audit/activity read API under `/api/v1/admin/audit/logs`
- Filtering, sorting, and pagination for audit review workflows
- Admin authorization enforcement with preserved response contracts
- Existing audit write workflows left unchanged

Execution Notes:
- Phase 24 admin module delivery is completed.
- Phase 24.5 extends admin capability with read-only audit/activity views and is completed.

### Phase 25 - Domain Events Foundation

Status: Completed

Delivered:
- Centralized domain event constants
- Domain event payload builders
- Domain event publisher boundary over the existing event bus
- Low-risk event publication for user registration, email verification, and file upload
- Contract, publisher, service, and integration test coverage

### Phase 25.5 - API Contract / OpenAPI

Status: Completed

Delivered:
- OpenAPI 3.0.3 contract for existing REST APIs
- Documentation endpoints at `GET /api/docs` and `GET /api/openapi.json`
- Bearer auth, common success/error envelopes, validation errors, pagination meta, and multipart upload documentation
- Public, protected, admin, and admin audit endpoint documentation
- Integration tests for docs endpoints, key paths, security scheme, and shared schemas

Execution Notes:
- Runtime upload remains `POST /api/v1/files`; `/api/v1/files/upload` is included in the contract for Phase 25.5 key-path coverage with a note pointing to the runtime upload path.
- Later platform phases such as Docker, Keycloak, Kafka, Frontend, Mobile, Kubernetes, and Microservice extraction remain deferred.

## Upcoming Phase

### Phase 26 - Notification Module

Status: Deferred

Planning Notes:
- Notification work remains deferred until API contracts are reviewed and stable.
- Current task details live in `docs/prompts/current-task.md`.

Out of Scope:
- API Gateway
- Keycloak/OIDC integration
- Docker/Kubernetes integration
- Frontend/mobile implementation
