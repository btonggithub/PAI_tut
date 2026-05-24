# Conventions

## Naming Conventions

### Middleware
- Authentication middleware:
  - protect.js
- Authorization middleware:
  - authorize.js

---

### Role Naming

Use lowercase role names.

Examples:
- admin
- user
- moderator

Rules:
- Avoid uppercase role names
- Avoid mixed naming styles
- Keep role values predictable

---

### Authorization Naming

Use action-oriented naming.

Examples:
- authorize
- requireRole
- requireOwnership

Avoid:
- checkStuff
- handlePermission

---

## Route Protection Convention

Protected routes must apply middleware in this order:

Route
↓
Authentication
↓
Authorization
↓
Validation
↓
Controller

Example:
router.get(
  '/',
  protect,
  authorize('admin'),
  validateRequest(...),
  controller
);

---

## Repository Convention

Repositories should expose domain-oriented methods.

Preferred:
- findActiveUsers
- findUserProfile
- findPendingOrders

Avoid overly-generic business access patterns:
- save
- update
- delete
- findAll

Rules:
- Generic helpers belong in BaseRepository only
- Domain repositories should express business/domain intent

---

## Testing Convention

### Helpers
Reusable testing logic only.

Examples:
- auth header generators
- mock request builders
- reusable setup utilities

---

### Fixtures
Reusable static test data only.

Examples:
- user fixtures
- auth payload fixtures
- role fixtures

Rules:
- Avoid hardcoding repeated payloads inside tests
- Keep fixtures deterministic

---

## Policy Naming Convention

Policy functions must use:
  can<Action><Resource>()

Examples:
  canViewUser()
  canUpdateUser()
  canDeleteUser()
  canManageUsers()

Avoid:
  checkUser()
  validateUser()
  verifyAccess()

Reason:
Policy intent must be explicit.

### Policy File Convention

One resource per file.

Example:
policies/
 ├── userPolicy.js
 ├── orderPolicy.js
 └── paymentPolicy.js

 ---

## Permission Naming Convention

Format:
resource.action

Examples:
 user.read
 user.update
 user.delete
 user.manage

 role.read
 role.update

 audit.read

### Permission Constants Convention

Permissions must be centralized.

Example:
permissions/
 └── userPermissions.js

Avoid:
 'admin'
 'user.read'
 'user.delete'

inside services/controllers.

### Authorization Convention

Authorization order:

Authentication
↓
Permission
↓
Policy
↓
Business Logic