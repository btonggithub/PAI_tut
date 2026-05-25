## Role-Based Authorization Strategy

Decision:
- Introduce RBAC middleware before policy-based authorization

Reason:
- Separate authentication vs authorization concerns
- Prepare scalable permission architecture
- Prevent authorization logic duplication in controllers/services
- Create reusable route protection patterns

---

## Authorization Responsibility Separation

Decision:
- Authentication middleware verifies identity
- Authorization middleware verifies permissions

Reason:
- Clear security boundaries
- Reusable middleware composition
- Cleaner controller/service layers
- Easier transition toward policy-based authorization

---

## Repository Ownership Rule

Decision:
- Repositories fully own database access

Reason:
- Prevent query leakage into services
- Keep services business-oriented
- Standardize query abstraction
- Improve long-term maintainability

---

## Testing Structure Strategy

Decision:
- Separate helpers and fixtures from test cases

Reason:
- Improve reusable test composition
- Prevent duplicated mock data
- Keep test suites maintainable as project grows

---

## Decision 016 — Authorization Separate From RBAC

Status:
Accepted

Context:
Role checks alone become insufficient as application complexity grows.

Examples:
- User can edit own profile
- Admin can edit any profile
- User cannot delete another user
- Manager can access team resources only

Decision:
Authorization policies will be implemented separately from RBAC.

RBAC determines:
Who are you?

Policy determines:
Can you perform this action?

Consequences:

Positive:
- Better scalability
- Cleaner permissions
- Reusable authorization logic

Negative:
- Additional abstraction layer
- More policy tests required

---

## Permission-Based Authorization

Status:
Accepted

Context:
Current RBAC supports only simple role checks.

Future business requirements may require:
- manager
- support
- editor
- auditor
- finance

Role-only authorization becomes difficult to maintain.

### Decision
Introduce permission abstraction layer.
Permissions become the primary authorization unit.
Roles become collections of permissions.

Example:
    admin
    ├── user.read
    ├── user.update
    ├── user.delete
    └── user.manage

    user
    ├── user.read.self
    └── user.update.self

Policies consume permissions instead of role names.

### Consequences

Benefits:
- Fine-grained authorization
- Easier role expansion
- Better microservice compatibility
- Reduced role coupling

Trade-offs:
- Additional authorization layer
- Slightly more complexity

---

### Future Event-Driven Architecture

Current architecture uses direct service orchestration.

Event-driven communication is intentionally deferred.

Future candidate events:

- user.registered
- user.updated
- user.deleted
- role.changed
- password.changed

Event infrastructure will be introduced only when
multiple independent modules need to react to the
same business event.

--- 

## Refresh Token Strategy

Status:
Accepted

Context:
Access tokens should remain short-lived.

Long-lived JWT access tokens increase security risk:
- Token theft exposure
- Difficult revocation
- Poor session control

### Decision

Use:
- Short-lived access token
- Long-lived refresh token
- Persistent session storage

Authentication flow:

Login
↓
Create Session
↓
Issue Access Token
↓
Issue Refresh Token

### Consequences

Benefits:
- Better security
- Session revocation capability
- Multi-device support
- Login tracking capability

Trade-offs:
- Additional session storage
- More authentication complexity

### Refresh Token Rotation

Status:
Accepted

Decision
Every refresh operation generates:
- New access token
- New refresh token
Old refresh token becomes invalid.

Benefits:
- Reduced replay attack risk
- Better session security

### Refresh Token Storage

Status:
Accepted

Decision:
Refresh tokens must not be stored as plain text.

Session records store only:
- refreshTokenHash

During refresh:
- The submitted refresh token is verified
- The matching active session is loaded
- The submitted token is hashed and compared with refreshTokenHash
- A new refresh token is generated
- The session refreshTokenHash is replaced

Reason:
If the database is leaked, plain refresh tokens would allow session takeover.
Hashing refresh tokens reduces the impact of session storage compromise.

---

## Decision 018 — Permission System Scope

Status:
Accepted

Context:
The current authorization stack supports authentication, RBAC, and resource policies.
However, route-level role checks such as admin-only access still couple authorization
rules directly to role names.

As the system grows, roles may change while capabilities remain stable.
Examples:
- admin can manage users
- support can read users
- auditor can read audit logs
- user can read and update own profile

Decision:
Phase 18 introduces an in-code permission system.

Permissions do not replace ownership-based authorization.

Ownership checks remain the responsibility of policy functions.

The system will include:
- permission constants
- role-to-permission mapping
- reusable permission evaluation helper
- permission middleware for route-level authorization
- permission-aware policy functions

Permissions become the stable authorization unit.
Roles remain server-controlled collections of permissions.

This phase will not introduce:
- permission database tables
- dynamic permission editing
- role management endpoints
- external policy engines

Consequences:

Positive:
- Reduces hardcoded role checks
- Makes authorization rules easier to expand
- Keeps policies reusable
- Prepares future role management without requiring it now

Trade-offs:
- Adds one authorization abstraction layer
- Requires permission mapping tests
- Existing RBAC middleware must coexist during migration

---

## Permission Evaluation Strategy

Status:
Accepted

Decision:
Permission evaluation must be pure and server-controlled.

Rules:
- Permission constants are centralized.
- Role-to-permission mapping is centralized.
- User-provided permissions are never trusted.
- Controllers do not evaluate permissions.
- Repositories do not evaluate permissions.
- Policies may consume permission helpers but must remain pure.

Example:

admin
↓
ROLE_PERMISSIONS.admin
↓
USER_PERMISSIONS.READ
↓
hasPermission(actor, USER_PERMISSIONS.READ)

Reason:
Centralized permission evaluation prevents scattered string checks and keeps
authorization rules consistent across routes, services, and policies.
