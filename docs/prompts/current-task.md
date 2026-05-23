# Current Task

Phase 16 — Authorization Policy System

## Objective

Implement a reusable authorization policy layer that supports:

- Ownership checks
- Resource permissions
- Action permissions
- Separation from RBAC

---

## Requirements

Create:

src/
 ├── policies/
 │    └── userPolicy.js

Implement:

- canViewUser()
- canUpdateUser()
- canDeleteUser()
- canManageUsers()

Rules:

- Pure functions only
- No HTTP logic
- No database access
- No response formatting

Integrate policy checks into User Module.

Examples:

Admin:
- View any user
- Update any user

User:
- View own profile
- Update own profile
- Cannot access another user

---

## Success Criteria

1. Policy layer exists
2. Ownership checks implemented
3. RBAC remains intact
4. Controllers remain thin
5. Policies reusable
6. Tests added
7. Existing tests continue passing