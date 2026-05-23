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