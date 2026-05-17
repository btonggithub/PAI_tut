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
├── controller/
│   ├── health/
│   │   └── healthController.js
│   └── system.js
│       └── systemController.js
│
├── middleware/
│   └── errorHandler.js
│
├── routes/
│   ├── healthRoutes.js
│   ├── index.js
│   └── systemRoutes.js
│
├── utils/
│   ├── AppError.js
│   └── asyncHandler.js

## API Structure

/api/v1

## Config Flow

.env
↓
env.js
↓
validated config
↓
server.js / db.js

## Middleware Flow

request
↓
routes
↓
notFoundHandler
↓
errorHandler
↓
JSON response

## Validation
Environment variables validated using Joi.