# Current Task

## Phase

Phase 18 — Permission System

## Objective

Introduce a centralized permission system that reduces hardcoded role checks while preserving the existing authentication, session, RBAC, and policy behavior.

Permissions become the stable authorization unit.
Roles remain server-controlled collections of permissions.

Existing authentication, refresh-token, session, and policy behavior
must remain backward compatible unless explicitly required by this phase.

---

## Requirements

### Permission Module

Create:

src/permissions/

Recommended files:

- src/permissions/userPermissions.js
- src/permissions/rolePermissions.js
- src/permissions/hasPermission.js
- src/permissions/index.js

### Permission Constants

Define user-related permission constants.

Recommended permissions:

- user.read
- user.read.self
- user.update
- user.update.self
- user.delete
- user.manage

Rules:

- Permission strings must be centralized.
- Do not hardcode permission strings in controllers, routes, services, or policies.
- Use constants such as USER_PERMISSIONS.READ.

### Role-Permission Mapping

Define role-to-permission mapping.

Recommended initial mapping:

admin:
- user.read
- user.update
- user.delete
- user.manage

user:
- user.read.self
- user.update.self

Rules:

- Role-permission mapping must be server-controlled.
- Do not trust permissions from request bodies.
- Do not store permissions in JWT payloads during this phase.
- Unknown roles should resolve to no permissions.

### Permission Evaluation

Implement a reusable permission helper.

Recommended API:

hasPermission(actor, permission)

Responsibilities:

- Read actor.role
- Resolve permissions from rolePermissions
- Return boolean

Rules:

- Pure function only
- No database access
- No HTTP logic
- No AppError creation inside the helper

### Permission Middleware

Implement permission middleware.

Recommended file:

src/middleware/auth/requirePermission.js

Recommended API:

requirePermission(permission)

Responsibilities:

- Require req.user
- Evaluate hasPermission(req.user, permission)
- Call next() when allowed
- Return 401 if no authenticated user exists
- Return 403 if the actor lacks permission

Rules:

- Must remain reusable
- Must not query the database
- Must not contain resource ownership logic
- Must not contain route-specific business rules

### Policy Integration

Policies may use permission helpers when beneficial.

Policies must remain independent business authorization rules.

Permissions must not become a replacement for ownership checks.

Current policy behavior must remain equivalent:

- Admin can manage users
- User can view own profile
- User can update own profile
- User cannot access another user without permission

Rules:

- Policies remain pure functions
- Policies return boolean only
- Policies do not throw AppError
- Policies do not access repositories
- Ownership checks stay explicit

### Route Integration

Where appropriate, replace hardcoded role middleware with permission middleware.

Initial route targets:

- GET /api/v1/users
- GET /api/v1/users/:id

These currently represent admin-only user access and should move from role-name checks
to capability checks while preserving the existing 401/403 behavior and response contract.

Example:

Before:

authorize('admin')

After:

requirePermission(USER_PERMISSIONS.READ)

Permission middleware protects capability-level access.

Ownership remains the responsibility of policies.

For resource ownership checks, permission middleware may be combined with policy checks:

requirePermission(USER_PERMISSIONS.READ)

AND

canViewUser(actor, targetUserId)

may both participate in authorization.

Permission checks do not replace ownership checks.

Rules:

- Preserve endpoint behavior
- Preserve response contract
- Protected routes must still use protect before authorization middleware
- Do not remove authorize middleware unless it is no longer used
- Existing authorize(role) middleware may temporarily coexist with
requirePermission(permission) during migration.

Do not force complete RBAC removal in this phase.

---

## Testing

Add or update tests for:

### Permission Constants

- Permission constants exist
- Permission strings follow resource.action format
- No duplicated permission values

### Role-Permission Mapping

- admin has user management permissions
- user has only self permissions
- unknown role has no permissions

### Permission Helper

- hasPermission returns true for allowed permissions
- hasPermission returns false for missing permissions
- hasPermission returns false for missing actor
- hasPermission does not trust actor.permissions

### Permission Middleware

- allows authenticated actor with permission
- blocks authenticated actor without permission with 403
- blocks missing actor with 401
- uses permission constants

### Policy Integration

- admin can manage users through permission mapping
- user can access own resource through ownership policy
- user cannot access another user's resource
- policy functions remain pure boolean functions

### Route Integration

- admin-only user listing remains protected
- non-admin user cannot list users
- existing protected routes still work

## Success Criteria

1. Permission constants implemented
2. Role-permission mapping implemented
3. hasPermission helper implemented
4. Permission middleware implemented
5. User authorization policies are permission-aware where practical
6. Route-level hardcoded role checks are reduced where appropriate
7. Existing authentication/session behavior preserved
8. Tests added or updated
9. Full test suite passes

---

## Non Goals

Do NOT implement:

- dynamic permissions in database
- permission management UI
- permission caching
- permission inheritance
- ABAC
- ACL
- Event-driven authorization
- Redis authorization cache
- audit log model
- audit log repository
- audit log service

Rules:
- Prefer the simplest implementation that satisfies current requirements.
- Avoid speculative abstractions for future distributed systems.
- Do not introduce infrastructure that is not actively required by Phase 18.
- Maintain readability and maintainability over extensibility.

Use static in-code permission definitions only.

---

## Authorization Model

Permissions determine capability.

Policies determine contextual/resource ownership authorization.

A request may require BOTH:
- permission validation
- ownership validation

before access is granted.

Examples:
- user.read allows reading capability
- canViewUser(actor, resource) determines whether the actor may read THIS resource