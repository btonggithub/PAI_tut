# Current Task

## Task
Implement async route utilities and AppError system

## Requirements
- Create async route wrapper utility
- Create centralized AppError class
- Support standardized operational errors
- Integrate AppError with existing error middleware

## Related Files
- src/utils/asyncHandler.js
- src/utils/AppError.js
- src/middleware/errorHandler.js

## Constraints
- CommonJS only
- JSON responses only
- No logging library
- No business logic

## Expected Result
- Async routes no longer require try/catch blocks
- Operational errors handled consistently
- Error middleware supports AppError instances
- Standardized error response format maintained

## Non-Goals
- Do not implement auth
- Do not add database models
- Do not add validation middleware