# Review checklist

## Before completion verify:

- architecture rules preserved
- controller remains HTTP-only
- service contains business logic
- repository owns DB access
- validation in middleware only
- response contract unchanged
- tests updated
- npm test passes

---

## Authorization Review

- Are ownership checks implemented in policies?
- Are controllers authorization-free?
- Is RBAC separated from policies?
- Are policy functions pure?
- Are permissions reusable?
- Are authorization scenarios tested?

---

## Session Architecture Review

### Session Layer

- Session model exists
- Session repository exists
- Session service exists
- Session persistence separated from controllers

### Refresh Token Flow

- Refresh token validated
- Session validated
- Token rotation implemented
- Old refresh token invalidated

### Logout Flow

- Session revocation implemented
- Refresh token unusable after logout

### Security

- Access token short-lived
- Refresh token is never stored as plain text
- Refresh token hash is stored in session records
- Refresh token hash comparison is used during refresh
- Session ownership verified
- Sensitive data not exposed in JWT payload


### Testing

- Session tests added
- Refresh tests added
- Logout tests added
- Existing tests continue passing

---

## Permission Architecture Review

Permission Design:
- Permissions follow resource.action convention
- Permission constants centralized
- Permission values are not duplicated
- No hardcoded permission strings in services
- No hardcoded permission strings in controllers
- No hardcoded permission strings in routes
- No permissions are trusted from client input

Authorization:
- Authorization separated from authentication
- Permission evaluation reusable
- Policies remain pure
- Policies do not access repositories
- Policies do not access HTTP layer
- Permission middleware does not contain ownership logic
- Permission middleware does not query the database

Maintainability:
- New roles can be added without changing services
- New permissions can be added centrally
- Permission mapping is centralized
- Authorization logic is reusable across modules

---

## Phase 18 Review

### Permission Module

- src/permissions exists
- User permission constants exist
- Role-permission mapping exists
- hasPermission helper exists
- Permission exports are centralized

### Permission Middleware

- requirePermission exists
- Requires authenticated user
- Returns 401 when actor is missing
- Returns 403 when actor lacks permission
- Uses permission constants
- Has unit tests

### Role-Permission Mapping

- admin permissions include user management capabilities
- user permissions are limited to self capabilities
- unknown roles resolve to no permissions
- Mapping is server-controlled
- Mapping is covered by tests

### Policy Integration

- User policies remain pure
- User policies return boolean only
- Permission checks use hasPermission or permission-aware helpers
- Ownership checks remain explicit
- Existing authorization behavior is preserved

### Route Integration

- Protected routes still apply protect first
- Permission middleware is used where appropriate
- Existing response contract remains unchanged
- Existing 401/403 behavior remains consistent

### Testing

- Permission constants tests added
- Role-permission mapping tests added
- hasPermission tests added
- Permission middleware tests added
- Policy tests updated
- Route/integration tests updated where behavior is affected
- Full test suite passes
