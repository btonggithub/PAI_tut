# Current Task

Phase 15 — Role-Based Access Control (RBAC)

## Objective

Implement reusable role-based authorization architecture while preserving the existing layered architecture and standardized response contract.

---

## Requirements

### User Model
Add role support to user model.

Requirements:
- role field
- default role
- enum restriction

Allowed roles initially:
- user
- admin

---

### Authorization Middleware

Create reusable authorization middleware.

Example usage:
- authorize('admin')
- authorize('admin', 'moderator')

Responsibilities:
- Verify authenticated user role
- Block unauthorized access
- Return standardized AppError responses

Rules:
- Middleware-only authorization
- No role checks inside controllers
- No role checks inside routes

---

### Protected Admin Routes

Add initial admin-protected routes.

Suggested examples:
- GET /api/v1/users
- GET /api/v1/users/:id

Requirements:
- Must require authentication
- Must require admin role

---

### Service Layer

Rules:
- Services remain business-oriented
- No Express request/response objects
- No HTTP response formatting
- No raw role checks duplicated across services

---

### Repository Layer

Rules:
- Repositories continue owning all database access
- Services must not access mongoose models directly
- Preserve scalable repository structure

---

### Validation

Validation must remain middleware-only.

Requirements:
- Validate role updates if role mutation is introduced
- Keep Joi schemas modular

---

### Testing

Add/update tests for:
- Unauthorized access
- Forbidden access
- Admin-only routes
- Authorization middleware behavior
- Standardized error responses

Requirements:
- Integration tests required
- Reuse helpers/fixtures when possible

---

## Success Criteria

1. RBAC middleware implemented
2. User roles supported
3. Admin-only routes protected
4. No role checks inside controllers
5. Standardized error contract preserved
6. Existing architecture preserved
7. Tests pass successfully