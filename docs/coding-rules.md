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
Use permission constants.

Good:
hasPermission(actor, USER_PERMISSIONS.READ)

Bad:
actor.permissions.includes('user.read')

scattered throughout codebase.

### Policy Rules

Policies must:
- remain pure functions
- return boolean only
- contain no database access
- contain no HTTP logic

Good:
    canViewUser(actor, targetUserId)

Bad:
    res.status(403)

inside policy layer.