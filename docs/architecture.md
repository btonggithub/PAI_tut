# Architecture

## Structure

src/
├── app.js
├── server.js
├── config/
│   ├── env.js
│   └── db.js
│
├── middleware/
│   └── errorHandler.js

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