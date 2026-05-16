# Current Task

## Task
Implement modular API route structure

## Requirements
- Create centralized route registration
- Separate route modules
- Version API under /api/v1
- Move health endpoint into route module

## Related Files
- src/app.js
- src/routes/index.js
- src/routes/healthRoutes.js

## Constraints
- CommonJS only
- Keep route layer thin
- No business logic in routes

## Expected Result
- Modular route structure
- API versioning enabled
- Health route separated from app.js

## Non-Goals
- Do not implement auth
- Do not add controllers yet
- Do not add Swagger