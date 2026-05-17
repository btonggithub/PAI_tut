# Current Task

## Task
Upgrade Controller Layer to v2 (multi-module + standardized pattern + scaling readiness)

---

## Requirements
- Restructure controllers into module-based folders
- Enforce consistent controller structure across all modules
- Ensure all controllers use asyncHandler
- Ensure all operational errors use AppError
- Keep route layer thin and declarative only
- Standardize JSON response format across controllers
- Prepare architecture for future service layer integration

👉 อธิบาย:
เฟสนี้คือการยกระดับจาก controller migration ธรรมดา ไปสู่ scalable controller architecture ที่รองรับหลาย module และพร้อมต่อยอด service layer ในอนาคต

---

## Related Files
- src/controllers/**/*
- src/routes/*
- src/utils/asyncHandler.js
- src/utils/AppError.js
- src/middleware/errorHandler.js

---

## Architecture Target

Route → Controller → AppError → Error Middleware

---

## Constraints
- CommonJS only
- JSON responses only
- No logging library
- No database model changes
- No validation middleware
- No service layer implementation yet
- No business logic expansion

👉 อธิบาย:
ยังคง focus ที่ architecture standardization เท่านั้น ยังไม่แยก business logic ไป service layer ในเฟสนี้

---

## Expected Result
- Controllers organized by module/domain
- Consistent controller structure across project
- All async controllers wrapped with asyncHandler
- All operational errors handled via AppError
- Routes contain routing logic only
- Standardized success/error response structure maintained
- System prepared for scalable module expansion

---

## Success Criteria
- At least 2 controller modules exist
- All controllers follow same structure pattern
- Route layer contains zero request-processing logic
- No direct try/catch blocks inside controllers
- All operational errors use AppError
- API responses remain consistent

---

## Non-Goals
- Do not implement authentication
- Do not implement service layer yet
- Do not add validation middleware
- Do not modify database models
- Do not redesign business logic

---

## Completed (Do not repeat)
- Async route utility (asyncHandler) implemented
- AppError class implemented
- Centralized error middleware implemented
- Initial controller layer migration completed
- Route-to-controller separation introduced
- Standard JSON error response implemented

---

## Current Status
✔ Error system foundation completed  
✔ Controller layer v1 completed  
✔ Route/controller separation established  
➡ Entering Controller Layer v2 (standardization + scaling phase)

---

## NEXT STEP (Future Phase)

### Service Layer Introduction
- Separate business logic from controllers
- Introduce service abstraction layer
- Keep controllers focused on HTTP request/response only
- Prepare scalable application architecture