# Conventions

## Naming

### Files
- camelCase for utility files
- PascalCase only for classes
- Feature-based module folders

Examples:
- authService.js
- authRepository.js
- authController.js
- validateRequest.js

---

## Layer Responsibilities

### Route
Responsible only for:
- route declaration
- middleware composition

Must NOT:
- contain business logic
- access database
- validate manually

---

### Controller
Responsible only for:
- reading HTTP request
- calling services
- returning response

Must NOT:
- contain business logic
- access models directly
- perform validation

---

### Service
Responsible for:
- business rules
- orchestration
- AppError throwing

Must NOT:
- use req/res
- access Express objects directly
- return HTTP responses

---

### Repository
Responsible for:
- data access
- query abstraction
- model interaction

Must NOT:
- contain business rules
- return HTTP responses
- use Express

---

## Response Convention

Success Response:
{
  "success": true,
  "message": "Success",
  "data": {}
}

Error Response:
{
  "success": false,
  "message": "Error message"
}

---

## Repository Conventions

### Repository Scope

Each module owns its repository.

Examples:
- authRepository
- systemRepository

### Repository Rules
- Only repositories can access models
- Services must not query models directly
- Keep query logic centralized

---

## Database Conventions
Models:
- One model per file
- Use timestamps
- Define indexes explicitly
- Normalize reusable fields

Query Rules:
- Prefer lean() for read-only queries
- Avoid duplicated query patterns
- Centralize reusable queries

--- 

## Validation Conventions
- Joi only
- Validation middleware before controller
- Schemas separated by module