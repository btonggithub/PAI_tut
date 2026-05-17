# Project Overview

## Project Goal

Build a scalable Node.js REST API backend using Express.js with clean architecture principles, standardized error handling, and modular application structure.

The project focuses on:
- Clean backend architecture
- Scalable module organization
- Standardized API patterns
- Separation of concerns
- Maintainable Express.js structure

---

## Current Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Joi
- Nodemon

---

## Current Architecture Status

The project currently implements:

- Environment configuration validation
- MongoDB connection management
- Centralized error handling
- Async route utilities
- Standardized AppError system
- Modular route registration
- Controller-based application structure
- Multi-module controller organization

---

## Architectural Principles

- Thin route layer
- Lightweight controllers
- Centralized error handling
- Standardized JSON responses
- Modular domain structure
- Incremental architecture evolution

---

## Current Application Flow

Request
↓
Route
↓
Controller
↓
AppError (if operational error)
↓
Error Middleware
↓
JSON Response

---

## Current Development Phase

Controller Layer v2
- Multi-module controller architecture
- Standardized controller patterns
- Thin route enforcement
- Scaling-ready structure

---

## Planned Next Phase

Service Layer Introduction

Future goals:
- Separate business logic from controllers
- Introduce service abstraction
- Improve long-term scalability
- Maintain lightweight HTTP layer

---

## Database Layer

Current database stack:
- MongoDB
- Mongoose

Current responsibility:
- Database connection management only
- No repository layer yet
- No model abstraction yet

Current architecture intentionally keeps:
- Controllers lightweight
- Database concerns minimal
- Business logic separation deferred until Service Layer phase

Future direction:
Controller
→ Service
→ Repository/Data Access
→ MongoDB