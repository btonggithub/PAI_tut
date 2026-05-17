# Architecture

## Structure

src/
├── app.js
├── server.js
│
├── config/
│   ├── db.js
│   └── env.js
│
├── controllers/
│   ├── health/
│   │   └── healthController.js
│   │
│   └── system/
│       └── systemController.js
│
├── middleware/
│   └── errorHandler.js
│
├── routes/
│   ├── healthRoutes.js
│   ├── systemRoutes.js
│   └── index.js
│
├── utils/
│   ├── AppError.js
│   ├── asyncHandler.js
│   └── response.js

---

## API Structure

/api/v1

---

## Config Flow

.env
↓
env.js
↓
validated config
↓
server.js / db.js

---

## Request Flow

Request
↓
Route
↓
Controller
↓
Response Utility
↓
JSON Response

---

## Error Flow

Request
↓
Route
↓
Controller
↓
AppError
↓
Error Middleware
↓
JSON Error Response

---

## Controller Architecture

Controllers:
- Handle HTTP concerns only
- Use asyncHandler
- Use AppError for operational errors
- Use shared response utility for success responses
- Remain lightweight and modular

---

## Route Architecture

Routes:
- Handle routing only
- Remain declarative
- Contain no business logic
- Delegate all processing to controllers

---

## Database Architecture

Current database stack:
- MongoDB
- Mongoose

Current phase:
- Database connection layer implemented
- Repository layer intentionally deferred

Future target flow:

Route
↓
Controller
↓
Service Layer
↓
Repository/Data Access Layer
↓
MongoDB

---

## Current Architecture Phase

Response & Controller Polish Phase

Current priorities:
- Response consistency
- Controller consistency
- AppError standardization
- Service-layer readiness

---

## Validation

Environment variables validated using Joi.