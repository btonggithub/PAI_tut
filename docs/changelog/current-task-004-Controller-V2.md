# Current Task

## Task
Implement Controller Layer standardization using asyncHandler and AppError system

---

## Requirements
- Create controller directory structure (`src/controllers/`)
- Move existing route logic into controller layer
- Ensure all controllers use asyncHandler wrapper
- Replace all raw error handling with AppError usage
- Keep route layer thin (only routing responsibility)
- Maintain standardized JSON response format

👉 อธิบาย:
เฟสนี้คือการย้าย logic จาก route ไป controller เพื่อแยก responsibility ให้ชัด และทำให้ระบบพร้อม scale ต่อเป็น service layer

---

## Related Files
- src/controllers/* (new)
- src/routes/*
- src/utils/asyncHandler.js
- src/utils/AppError.js
- src/middleware/errorHandler.js

---

## Constraints
- CommonJS only
- JSON responses only
- No logging library
- No database model changes
- No validation middleware
- No business logic expansion

👉 อธิบาย:
ยังคง focus แค่ architecture refactor ไม่แตะ business logic หรือ database

---

## Expected Result
- Routes become thin routing layer only
- Controllers handle all request logic
- asyncHandler is used in all controller functions
- AppError is used for all operational errors
- Clean separation: route → controller → error middleware

---

## Non-Goals
- Do not implement authentication
- Do not create database models
- Do not add validation middleware
- Do not implement service layer yet

---

## Completed (Do not repeat)
- Async route utility (asyncHandler) implemented
- AppError class implemented
- Centralized error middleware implemented
- Standard JSON error response implemented
- Modular routing structure already exists

---

## Current Status
✔ Error system foundation is complete  
✔ Async infrastructure is ready  
➡ Now entering Application Layer (Controller refactor phase)

---

## NEXT STEP (Future Phase)

### Service Layer Planning (Later)
- Separate business logic from controllers
- Introduce service abstraction layer
- Prepare scalable architecture for larger features