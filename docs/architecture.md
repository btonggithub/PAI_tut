# Architecture

## Structure

src/
├── app.js
├── server.js
│
├── config/
│   ├── env.js
│   └── db.js
│
├── middleware/
│   └── errorHandler.js
│
├── routes/
│   ├── index.js
│   └── healthRoutes.js

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