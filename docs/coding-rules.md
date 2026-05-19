# Coding Rules

## General
- Use CommonJS only
- Use async/await
- Keep files small and focused
- Prefer modular separation
- Prefer single responsibility per file

---

## API
- JSON responses only
- Standardized response format
- Use centralized error handling

---

## Architecture
- No business logic in routes
- Controllers must stay HTTP-only
- Services must not access models directly
- Repositories own database access
- Config must go through env.js

---

## Validation
- Joi validation only
- Validation handled in middleware layer
- No inline validation inside controllers

---

## Repository Layer
- Repositories abstract database access
- Use reusable query patterns
- Prefer lean() for read queries
- Avoid duplicated query logic

---

## Error Handling
- Use AppError for operational errors
- Forward errors to centralized middleware
- Avoid inline try/catch in controllers

---

## Security
- Never expose password fields
- Hash passwords with bcrypt
- JWT secret must come from env.js

---

## Response Rules
- All API responses must include success:boolean
- Use centralized response utility for success responses
- Use centralized errorHandler for error responses
- Never format API responses directly inside routes

---

# Testing Rules

Rules:
- Production code must remain testable
- Avoid tightly coupled modules
- Avoid hidden side effects
- Avoid global mutable state

Controllers:
- Must remain thin
- Must not contain business logic

Services:
- Must remain framework-independent
- Must support mocking

Repositories:
- Must isolate database access

Tests:
- Must avoid real external services
- Must avoid shared state between test cases