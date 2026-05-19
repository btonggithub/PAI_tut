# Current Task

## Phase 14 — User Management Module

Objective:
Introduce a scalable user management module using the existing layered architecture.

---

## Required Context Files

Always read these files before making changes:

1. docs/project-overview.md
2. docs/architecture.md
3. docs/decisions.md
4. docs/conventions.md
5. docs/coding-rules.md
6. docs/progress.md
7. docs/prompts/current-task.md

---

## Architecture Rules

The project architecture MUST remain:

Route
→ Validation Middleware
→ Authentication Middleware
→ Controller
→ Service
→ Repository
→ BaseRepository
→ Mongoose
→ MongoDB

Rules:
- Controllers remain HTTP-only
- Services contain business logic only
- Repositories own all database access
- Validation remains middleware-only
- No direct Mongoose usage outside repositories
- Standardized response contract must remain unchanged

---

## Implementation Goals

Implement scalable user management foundation.

Expected additions:
- user module routes
- user controller
- user service
- user repository improvements
- user validation schemas
- protected user endpoints
- reusable query patterns
- user list pagination support

---

## Expected User Features

Add endpoints such as:
- GET /api/v1/users/me
- PATCH /api/v1/users/me
- GET /api/v1/users
- GET /api/v1/users/:id

Requirements:
- protected routes
- standardized response contracts
- validation middleware
- repository-based data access
- pagination-ready list endpoint

---

## Repository Rules

Repositories should expose domain-oriented methods.

Good examples:
- findUserByEmail()
- findUsers()
- findUserProfile()
- updateUserProfile()

Avoid:
- business queries inside services
- direct Mongoose usage inside services

---

## Testing Requirements

Add:
- integration tests for user routes
- unit tests for user service
- validation behavior tests
- authentication flow tests

Maintain:
- tests/helpers structure
- tests/fixtures structure

---

## Success Criteria

1. User module implemented
2. Protected user endpoints implemented
3. Controllers remain HTTP-only
4. Services contain business logic only
5. Repositories own database access
6. Pagination-ready user listing implemented
7. Validation remains middleware-only
8. Standardized response contract maintained
9. Tests added for new functionality
10. Existing architecture preserved