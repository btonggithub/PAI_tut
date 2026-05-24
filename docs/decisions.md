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