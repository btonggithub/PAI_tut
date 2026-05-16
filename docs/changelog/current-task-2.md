# Current Task

## Task
Implement centralized Express error handling

## Requirements
- Global Express error middleware
- Handle unknown routes
- Standardized JSON error responses
- Async-safe error handling

## Related Files
- src/app.js
- src/middleware/errorHandler.js

## Constraints
- CommonJS only
- JSON responses only
- fail-safe responses
- no HTML responses

## Expected Result
- Unknown routes return 404 JSON
- Server errors return standardized JSON
- Consistent error response format

## Non-Goals
- Do not implement auth
- Do not add logging library
- Do not change folder structure