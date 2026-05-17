# Current Task

## Task
Introduce Service Layer foundation and begin separating business logic from controllers

---

## Requirements
- Create service layer structure (`src/services/`)
- Introduce module-based service organization
- Move non-HTTP logic from controllers into services
- Keep controllers focused on HTTP concerns only
- Ensure controllers delegate processing to services
- Maintain existing asyncHandler usage
- Maintain AppError operational error flow
- Maintain standardized success response flow

👉 อธิบาย:
เฟสนี้เริ่มแยก business logic ออกจาก controller  
controller จะเหลือหน้าที่เกี่ยวกับ HTTP/request/response เท่านั้น  
service layer จะเริ่มเป็นที่อยู่ของ application/business logic

---

## Related Files
- src/controllers/**/*
- src/services/**/* (new)
- src/routes/*
- src/utils/AppError.js
- src/utils/asyncHandler.js
- src/utils/response.js
- src/middleware/errorHandler.js

---

## Architecture Target

Route
→ Controller
→ Service Layer
→ Response Utility
→ JSON Response

Error Flow:
Route
→ Controller
→ Service Layer
→ AppError
→ Error Middleware
→ JSON Error Response

---

## Constraints
- CommonJS only
- JSON responses only
- No logging library
- No validation middleware
- No repository/data-access layer yet
- No database model changes
- No authentication
- No business logic expansion beyond current scope

---

## Expected Result
- Controllers become thinner
- Service layer structure established
- Controllers delegate processing to services
- Service modules organized by domain/module
- AppError usage remains standardized
- Response format remains standardized

---

## Non-Goals
- Do not implement repository layer
- Do not introduce ORM abstraction
- Do not implement validation middleware
- Do not add authentication
- Do not redesign routing structure
- Do not add dependency injection

---

## Success Criteria
- `src/services/` exists
- At least 2 service modules exist
- Controllers contain HTTP concerns only
- Service layer contains reusable processing logic
- Routes remain declarative only
- AppError flow remains centralized
- Response utility remains standardized

---

## Current Status
✔ Thin route architecture completed
✔ Controller Layer v2 completed
✔ Response standardization completed
✔ Controller stabilization completed
➡ Entering Service Layer Foundation phase

---

## NEXT STEP (Future Phase)

### Repository Layer Planning
- Introduce data-access abstraction
- Separate persistence logic from services
- Prepare scalable database architecture

### Validation Layer
- Request validation middleware
- Schema validation strategy
- Centralized validation flow