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