# Coding Rules

## General
- Use CommonJS only
- Use async/await
- Keep files small and focused
- Prefer middleware separation
- Prefer modular architecture over large monolithic files
- Avoid unnecessary abstraction
- Maintain consistent naming conventions
- Keep architecture evolution incremental

---

## API
- JSON responses only
- Standardized success response format
- Standardized error response format
- Use centralized error handling
- Do not leak internal error details
- Keep API responses predictable and consistent

Example success response:

{
  "success": true,
  "data": {}
}

---

## Error Handling
- Use AppError for operational errors
- Use centralized error middleware
- Avoid inline try/catch in controllers
- All async controllers must use asyncHandler
- Forward async errors through middleware chain

Pattern:

asyncHandler(async (req, res, next) => {
  ...
});

---

## Architecture
- No business logic in routes
- Keep routes declarative only
- Keep controllers thin
- Controllers handle HTTP concerns only
- Config must go through env.js
- Organize controllers by module/domain
- Maintain separation of concerns
- Prepare architecture for future service layer

Target flow:

Route
→ Controller
→ Service Layer (future)
→ AppError
→ Error Middleware

---

## Route Rules
Routes must:
- Handle routing only
- Contain no business logic
- Contain no request-processing logic
- Delegate handling to controllers only

Example:

router.get('/', healthController.getHealth);

---

## Controller Rules
Controllers must:
- Use asyncHandler
- Use AppError for operational errors
- Return standardized JSON responses
- Avoid direct database abstraction logic
- Remain lightweight and focused

---

## Database Rules
- Use MongoDB with Mongoose
- Database connection must go through config/db.js
- Do not introduce repository layer yet
- Do not place database connection logic inside controllers
- Keep database architecture lightweight until Service Layer phase

---

## Current Architecture Phase
Controller Layer v2 Stabilization

Current priorities:
- Controller consistency
- Thin routes
- Standardized error handling
- Service-layer readiness

---

## Deferred Architecture
The following are intentionally deferred until later phases:
- Service layer
- Repository/data-access layer
- Validation middleware
- Authentication/authorization
- Dependency injection