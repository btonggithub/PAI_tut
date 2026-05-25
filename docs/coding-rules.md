# Coding Rules

## Authorization Rules

### Controllers
Controllers must NOT contain role checks.

Forbidden:
- if (user.role === 'admin')

Authorization belongs in middleware/service policy layers.

---

### Middleware
Authorization middleware must remain reusable.

Good:
- authorize('admin')
- authorize('admin', 'moderator')
- requirePermission(USER_PERMISSIONS.READ)

Avoid:
- hardcoded route-specific authorization logic

---

### Services
Services may orchestrate authorization decisions,
but should not directly depend on Express request objects.

Forbidden:
- req.user inside services

---

## Repository Rules

Repositories own:
- Mongoose queries
- Filtering
- Pagination
- Sorting
- Projection

Services must NOT:
- import mongoose models directly
- construct raw database queries

---

## Testing Rules

### Integration Tests
Must verify:
- response contract
- middleware behavior
- auth protection
- validation flow

---

### Unit Tests
Must isolate:
- business logic
- utility behavior
- repository mocking

---

## Security Rules

Never trust:
- req.body.role
- client-provided permissions
- frontend authorization claims

Authorization must be server-controlled.

---

## Authorization Rules

Authorization must not be implemented inside controllers.

Bad:
    if (req.user.role !== 'admin') {
    throw new AppError('Forbidden');
    }

Good:
    authorize('admin')
    canManageUsers()

### Policy functions must be pure.

Good:
    const canUpdateUser = (actor, targetUserId) => {
    return actor.role === 'admin' || actor.id === targetUserId;
    };

Avoid:
    const canUpdateUser = async (...) => {
    // database queries
    };

---

## Authentication Rules

Access tokens must:
- Remain short-lived
- Never be persisted in database
- Never contain sensitive information

## Refresh Token Rules

Refresh tokens:
- Must be rotatable
- Must support revocation
- Must be linked to session records
- Must never be stored as plain text
- Must be stored as a hash in session records
- Must be compared using a secure hash comparison flow

Avoid:
    generatePermanentToken()

or:
    expiresIn: '365d'
   
## Session Rules

Session management belongs to:
- sessionService
- sessionRepository

Must not exist inside:
- controllers
- middleware
- routes

Controllers only orchestrate requests.

---

## Permission Rules

Permissions must not be hardcoded inside:
- controllers
- repositories
- route handlers
- services
- policies
Use permission constants.

Good:
hasPermission(actor, USER_PERMISSIONS.READ)
requirePermission(USER_PERMISSIONS.READ)

Bad:
actor.permissions.includes('user.read')

scattered throughout codebase.

### Permission Constants Rules

Permission constants must be centralized.

Good:
    USER_PERMISSIONS.READ
    USER_PERMISSIONS.UPDATE_SELF

Bad:
    'user.read'
    'user.update.self'

Rules:
- Do not duplicate permission strings across modules.
- Do not build permission names dynamically from request input.
- Do not expose internal permission mappings as public API in Phase 18.

### Role-Permission Mapping Rules

Role-to-permission mapping must be server-controlled.

Good:
    ROLE_PERMISSIONS.admin.includes(USER_PERMISSIONS.READ)

Bad:
    req.user.permissions.includes('user.read')

Rules:
- Never trust client-provided permissions.
- Do not read permissions from req.body.
- Do not store permissions in access tokens during Phase 18.
- Keep role mapping deterministic and testable.

### Permission Middleware Rules

Permission middleware must:
- require an authenticated actor
- evaluate permission constants only
- return 403 for authenticated users without permission
- remain reusable across routes

Permission middleware must not:
- access repositories
- create HTTP responses directly outside the middleware pattern
- contain resource ownership logic
- contain route-specific business rules

### Policy Rules

Policies must:
- remain pure functions
- return boolean only
- contain no database access
- contain no HTTP logic
- use permission helpers for capability checks
- keep ownership checks explicit

Good:
    canViewUser(actor, targetUserId)
    canUpdateUser(actor, targetUserId)

Bad:
    res.status(403)

inside policy layer.
