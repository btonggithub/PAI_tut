# Current Task

## Phase

Phase 17 — Refresh Token & Session Management

## Objective

Introduce refresh-token-based authentication and persistent session management while preserving existing JWT access token authentication.

## Requirements

### Session Module

Create:

src/models/sessionModel.js

src/repositories/session/

src/services/session/

### Session Persistence

Session must store:

- userId
- refreshToken
- expiresAt
- revokedAt
- createdAt
- updatedAt

### Refresh Endpoint

Implement:

POST /api/v1/auth/refresh

Responsibilities:

- Validate refresh token
- Validate active session
- Rotate refresh token
- Issue new access token

### Logout Endpoint

Implement:

POST /api/v1/auth/logout

Responsibilities:

- Revoke session
- Invalidate refresh token

### Security Rules

Access token:
- short-lived

Refresh token:
- long-lived
- rotatable
- revocable

### Testing

Add:

- session service tests
- refresh endpoint tests
- logout endpoint tests

## Success Criteria

1. Session layer implemented
2. Refresh token endpoint implemented
3. Logout endpoint implemented
4. Token rotation implemented
5. Session revocation implemented
6. Existing authentication preserved
7. Tests added
8. Existing tests continue passing