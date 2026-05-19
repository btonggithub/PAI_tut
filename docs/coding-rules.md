# Coding Rules

## Controllers

Controllers must:
- Handle HTTP transport only
- Read req data
- Call services
- Return standardized responses

Controllers must NOT:
- Access database directly
- Use Mongoose directly
- Contain validation logic
- Contain business rules

---

## Services

Services must:
- Handle business workflows
- Use repositories only
- Throw AppError for operational failures

Services must NOT:
- Use req/res
- Access database directly
- Use Mongoose directly
- Format HTTP responses

---

## Repositories

Repositories must:
- Own all database access
- Encapsulate query logic
- Reuse BaseRepository patterns where appropriate

Repositories should:
- Expose domain-oriented methods

Examples:
- findUserByEmail()
- findUsersByRole()
- findActiveUsers()

Repositories must NOT:
- Contain HTTP logic
- Contain response formatting
- Contain validation logic

---

## Validation

Validation must:
- Exist in middleware layer only
- Use Joi schemas
- Execute before controllers

Validation must NOT:
- Exist inside controllers
- Exist inside services
- Exist inside repositories

---

## Error Handling

All operational errors must:
- Use AppError
- Flow into centralized error middleware

Internal/system errors must:
- Avoid leaking implementation details
- Return standardized error contracts

---

## Testing Rules

Unit tests must:
- Remain isolated
- Mock dependencies
- Avoid HTTP server startup

Integration tests must:
- Validate API contracts
- Validate middleware flow
- Validate response standardization

Fixtures must:
- Remain reusable
- Avoid duplication

Helpers must:
- Centralize reusable setup logic