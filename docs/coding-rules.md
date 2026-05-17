# Coding Rules

## General
- Use CommonJS only
- Use async/await
- Keep files small and focused
- Prefer modular architecture
- Avoid unnecessary abstractions
- Keep architecture evolution incremental

---

## API
- JSON responses only
- Standardized success response format required
- Standardized error response format required
- Keep responses predictable and consistent

---

## Success Response Rules
- All success responses must use response utility
- Do not manually duplicate success response structures
- Use shared response formatting pattern

Example:

{
  "success": true,
  "message": "Success",
  "data": {}
}

---

## Error Handling
- Use AppError for operational errors
- Use centralized error middleware
- Avoid inline try/catch in controllers
- All async controllers must use asyncHandler
- Do not leak internal errors to clients

---

## Architecture
- No business logic in routes
- Routes must remain declarative
- Controllers handle HTTP concerns only
- Controllers must remain lightweight
- Config must go through env.js
- Organize controllers by module/domain
- Prepare architecture for future service layer

---

## Controller Rules
Controllers must:
- Use asyncHandler
- Use AppError for operational errors
- Use response utility for success responses
- Avoid duplicated response logic
- Avoid direct database connection logic
- Remain focused on request/response handling

---

## Route Rules
Routes must:
- Handle routing only
- Contain no request-processing logic
- Delegate processing to controllers only

---

## Database Rules
- Use MongoDB with Mongoose
- Database connection must go through config/db.js
- Repository layer intentionally deferred
- Do not place database connection logic inside controllers

---

## Deferred Architecture
The following are intentionally deferred:
- Service layer
- Repository/data-access layer
- Validation middleware
- Authentication/authorization
- Dependency injection

---

## Service Rules

Services must:
- Remain framework-agnostic when possible
- Avoid direct HTTP response handling
- Avoid direct Express dependency
- Contain reusable processing logic
- Throw AppError for operational failures when needed

Controllers must:
- Delegate processing to services
- Remain focused on HTTP concerns only

---

## Validation Rules

Validation must:
- Be middleware-based
- Execute before controllers
- Avoid inline validation inside controllers
- Use AppError for validation failures
- Remain reusable across modules

---

## Repository Rules
- Repositories handle database access only
- Services must not query database directly
- Repositories must not contain HTTP logic
- Repositories must not use req/res