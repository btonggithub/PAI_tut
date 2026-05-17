# Current Task

## Task
Introduce Validation Layer foundation for request validation standardization

---

## Requirements
- Create validation middleware structure (`src/middleware/validation/`)
- Introduce reusable request validation flow
- Support validation for:
  - req.body
  - req.query
  - req.params
- Ensure validation errors use AppError flow
- Keep controllers free from validation logic
- Maintain standardized JSON response format

👉 อธิบาย:
เฟสนี้เริ่มแยก request validation ออกจาก controller  
validation จะถูกจัดการผ่าน middleware ก่อนเข้าสู่ controller

---

## Related Files
- src/middleware/validation/**/* (new)
- src/controllers/**/*
- src/routes/**/*
- src/utils/AppError.js
- src/middleware/errorHandler.js

---

## Architecture Target

Request
→ Validation Middleware
→ Controller
→ Service
→ Response Utility
→ JSON Response

Error Flow:
Validation Middleware
→ AppError
→ Error Middleware
→ JSON Error Response

---

## Constraints
- CommonJS only
- JSON responses only
- No logging library
- No authentication
- No database changes
- No repository layer yet
- No business logic expansion

---

## Expected Result
- Validation logic separated from controllers
- Reusable validation middleware introduced
- Validation errors standardized through AppError
- Controllers remain HTTP-focused only

---

## Non-Goals
- Do not implement authentication
- Do not introduce repository layer
- Do not redesign service layer
- Do not introduce ORM abstraction

---

## Success Criteria
- Validation middleware structure exists
- Validation reusable across routes
- Controllers contain zero validation logic
- Validation errors use AppError flow
- Routes remain declarative only

---

## Current Status
✔ Service Layer foundation completed
✔ Controllers stabilized
✔ Response utility standardized
➡ Entering Validation Layer phase

---

## NEXT STEP (Future Phase)

### Repository Layer
- Data access abstraction
- Database separation strategy
- Repository-service interaction