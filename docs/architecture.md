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
│   └── asyncHandler.js

---

## API Structure

/api/v1

---

## Configuration Flow

.env
↓
env.js
↓
validated config
↓
server.js / db.js

---

## Request Lifecycle

request
↓
route
↓
controller
↓
service layer (future)
↓
AppError (if operational error)
↓
errorHandler middleware
↓
JSON response

---

## Route Layer Rules

Routes must:
- Handle routing only
- Contain no business logic
- Contain no try/catch blocks
- Delegate request handling to controllers

Example:

router.get('/', healthController.getHealth);

---

## Controller Layer Rules

Controllers must:
- Handle HTTP request/response flow only
- Use asyncHandler for all async functions
- Use AppError for operational errors
- Return standardized JSON responses
- Remain lightweight and framework-focused

Example response:

{
  "success": true,
  "data": {}
}

---

## Error Handling Strategy

Operational errors:
- Use AppError
- Flow through centralized error middleware
- Return standardized JSON responses

Programming errors:
- Fall back to generic 500 response
- Prevent internal details leaking to clients

Flow:

Controller
↓
AppError
↓
errorHandler middleware
↓
JSON response

---

## Async Error Strategy

All async controllers are wrapped using asyncHandler.

Purpose:
- Eliminate repetitive try/catch blocks
- Automatically forward async errors to middleware

Pattern:

asyncHandler(async (req, res, next) => {
  ...
});

---

## Validation

Environment variables validated using Joi.

---

## Current Architecture Phase

Controller Layer v2
- Multi-module controller structure
- Thin route architecture
- Standardized error handling
- Scaling-ready controller organization

---

## Planned Next Phase

Service Layer Introduction
- Separate business logic from controllers
- Introduce service abstraction layer
- Keep controllers focused on HTTP concerns only

## Database Architecture

Current database stack:
- MongoDB
- Mongoose

Current phase:
- Connection layer implemented
- Database abstraction not introduced yet

Current flow:

Controller
↓
(database access will be introduced later)
↓
MongoDB

Future target flow:

Route
↓
Controller
↓
Service
↓
Repository/Data Access Layer
↓
MongoDB

Reason:
- Avoid premature abstraction
- Keep early architecture lightweight
- Introduce repository/service layers incrementally