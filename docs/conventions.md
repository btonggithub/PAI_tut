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
- requirePermission
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
  requirePermission(USER_PERMISSIONS.READ),
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

## Token Naming Convention

Access token:
accessToken

Refresh token:
refreshToken

Session identifier:
sessionId

### Session Naming Convention

Session model:
Session

Repository:
sessionRepository

Service:
sessionService

### Authentication Flow Convention

Authentication order:

Login
↓
Create Session
↓
Issue Tokens
↓
Return Response

Refresh order:

Refresh Request
↓
Verify Refresh Token Signature
↓
Extract Session Identifier
↓
Validate Active Session
↓
Compare Refresh Token Hash
↓
Rotate Tokens
↓
Update Session

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

Rules:
- Use lowercase resource names.
- Use lowercase action names.
- Keep permission names capability-based, not role-based.
- Do not encode role names into permission names.

### Permission Constants Convention

Permissions must be centralized.

Example:
permissions/
 ├── userPermissions.js
 └── rolePermissions.js

Avoid:
 'admin'
 'user.read'
 'user.delete'

inside services/controllers.

### Role-Permission Mapping Convention

Roles map to permission constants.

Example:
ROLE_PERMISSIONS = {
  admin: [
    USER_PERMISSIONS.READ,
    USER_PERMISSIONS.UPDATE,
    USER_PERMISSIONS.DELETE,
    USER_PERMISSIONS.MANAGE,
  ],
  user: [
    USER_PERMISSIONS.READ_SELF,
    USER_PERMISSIONS.UPDATE_SELF,
  ],
};

Rules:
- Role names remain lowercase.
- Role-permission mapping is server-owned.
- Do not accept permissions from request bodies.
- Do not store permission arrays in JWT payloads during Phase 18.

### Permission Middleware Convention

Permission middleware should use action-oriented naming.

Preferred:
requirePermission(USER_PERMISSIONS.READ)

Avoid:
checkPermission('user.read')

Rules:
- Permission middleware requires authentication first.
- Permission middleware must not query the database.
- Permission middleware must not contain route-specific business logic.
- Permission middleware returns 403 when the authenticated actor lacks permission.

### Authorization Convention

Authorization order:

Authentication
↓
Permission
↓
Policy
↓
Business Logic

Resource ownership convention:

Authentication
↓
Load Resource
↓
Policy
↓
Permission + Ownership
↓
Business Logic
