# Architecture

## Structure

src/
├── app.js
├── server.js
├── config/
│   ├── env.js
│   └── db.js

## Config Flow

.env
↓
env.js
↓
validated config
↓
server.js / db.js

## Validation
Environment variables validated using Joi.