# Current Task

Phase 12 — Production Hardening

## Objective

Improve production readiness and standardize API behavior across the backend.

---

## Requirements

### 1. Standardize API Response Contract

All API responses must follow consistent structure.

Success response:
{
  "success": true,
  "message": "Success",
  "data": {}
}

Error response:
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "status": 400
  }
}

Requirements:
- Update errorHandler.js
- Preserve existing response utility usage
- Do not break controller flow
- All errors must include success:false

---

### 2. Security Middleware Foundation

Add production-ready middleware foundation.

Requirements:
- Add helmet
- Add cors
- Add request size limiting
- Prepare security middleware registration structure

---

### 3. Authentication Hardening

Improve authentication robustness.

Requirements:
- Centralize token extraction logic
- Improve JWT error handling
- Prevent malformed authorization header issues
- Keep auth middleware thin

---

### 4. Error Hardening

Requirements:
- Prevent internal error leakage
- Differentiate operational vs unknown errors
- Keep AppError as operational error standard

---

### 5. Maintain Existing Architecture

Rules:
- Controllers remain HTTP-only
- Services contain business logic only
- Repositories own database access
- Validation stays in middleware layer
- No business logic in middleware
- No HTTP logic in repositories

---

## Success Criteria

1. Consistent success/error response shape
2. Security middleware integrated
3. Error responses hardened
4. Auth middleware more robust
5. Existing architecture preserved
6. No route/controller responsibility leakage