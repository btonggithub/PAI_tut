# Conventions

## Controller Convention

- One module per directory
- One controller file per module
- Controllers export plain functions
- Controllers must use asyncHandler
- Controllers must remain lightweight
- Controllers handle HTTP concerns only
- Controllers must use AppError for operational errors
- Controllers must use response utility for success responses

---

## Route Convention

- One route file per module/domain
- Routes remain declarative only
- Routes contain no business logic
- Routes delegate handling to controllers only

Example:

router.get('/', healthController.getHealth);

---

## Response Convention

Success responses must follow:

{
  "success": true,
  "message": "Success",
  "data": {}
}

Error responses are handled only through:
- AppError
- error middleware

---

## Error Convention

Operational errors:
- Must use AppError

Programming errors:
- Must fall through centralized error middleware

Controllers must not manually format error responses.

---

## Naming Convention

Controllers:
- healthController.js
- systemController.js

Routes:
- healthRoutes.js
- systemRoutes.js

Utilities:
- asyncHandler.js
- response.js
- AppError.js

---

## Architecture Convention

Current architecture flow:

Route
→ Controller
→ Response Utility
→ JSON Response

Error flow:

Route
→ Controller
→ AppError
→ Error Middleware

Future target:

Route
→ Controller
→ Service Layer
→ Repository/Data Access
→ Database

---

## Deferred Convention

The following are intentionally deferred:
- Service layer
- Repository layer
- Validation middleware
- Authentication
- Dependency injection
- DTO/Presenter abstractions