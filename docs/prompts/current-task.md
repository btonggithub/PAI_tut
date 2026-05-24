# Current Task

## Phase

Phase 18 — Permission System

## Objective

Introduce permission-based authorization on top of the existing RBAC and Policy architecture.

## Requirements

### Permission Foundation

Create:

src/permissions/

Examples:

- userPermissions.js
- rolePermissions.js

Permission format:

resource.action

Examples:

- user.read
- user.update
- user.delete
- user.manage

### Permission Evaluation

Create reusable utilities:

- hasPermission()
- hasAnyPermission()
- hasAllPermissions()

Rules:

- Pure functions only
- No HTTP logic
- No database access

### Role Mapping

Centralize role-permission mapping.

Example:

admin
→ all user permissions

user
→ self permissions only

### Policy Integration

Policies should evaluate permissions instead of direct role names where appropriate.

### Testing

Add:

- permission utility tests
- role mapping tests
- policy integration tests

## Success Criteria

1. Permission layer implemented
2. Role-permission mapping implemented
3. Authorization reusable across modules
4. Policies remain pure
5. Existing RBAC preserved
6. Tests added
7. Existing tests continue passing