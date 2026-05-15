# Current Task

## Task
Implement centralized Express error handling

## Requirements
- Handle unknown routes
- Standard JSON error response
- Global error middleware
- Async-safe error handling

## Related Files
- src/app.js
- src/middleware/errorHandler.js

## Constraints
- CommonJS only
- JSON responses only
- no HTML responses

## Expected Result
- Unknown routes return 404 JSON
- Server errors return standardized JSON