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
- Refresh token stored securely
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
- No hardcoded permission strings in services
- No hardcoded permission strings in controllers

Authorization:
- Authorization separated from authentication
- Permission evaluation reusable
- Policies remain pure
- Policies do not access repositories
- Policies do not access HTTP layer

Maintainability:
- New roles can be added without changing services
- New permissions can be added centrally
- Permission mapping is centralized
- Authorization logic is reusable across modules
