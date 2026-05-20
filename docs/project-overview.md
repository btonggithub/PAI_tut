# Project Overview

## Project Goal

Build a scalable Node.js REST API backend using Express.js with clean architecture principles, standardized error handling, modular domain organization, reusable data-access patterns, and production-ready authentication/authorization flows.

The project focuses on:
- Clean backend architecture
- Scalable module organization
- Standardized API patterns
- Separation of concerns
- Maintainable Express.js structure
- Incremental architecture evolution
- Long-term scalability

---

## Current Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Joi
- JWT
- bcrypt
- Jest
- Supertest
- Helmet
- CORS
- Nodemon

---

## Current Architecture Status

The project currently implements:

### Infrastructure
- Environment configuration validation
- MongoDB connection management
- Security middleware foundation
- Centralized error handling

### Application Architecture
- Modular route registration
- Controller-based architecture
- Service layer architecture
- Repository layer abstraction
- Scalable repository foundation
- Reusable pagination/query utilities

### Authentication & Security
- JWT authentication
- Password hashing
- Protected route middleware
- Standardized auth flow
- Production-ready error response contract

### User Management
- User module foundation
- User profile management
- Pagination-ready user listing

### Testing
- Jest testing foundation
- Integration testing structure
- Unit testing structure
- Reusable testing helpers/fixtures

---

## Architectural Principles

- Thin route layer
- HTTP-only controllers
- Service-based business logic
- Repository-owned database access
- Middleware-only validation
- Centralized error handling
- Standardized JSON responses
- Modular domain structure
- Incremental architecture evolution

---

## Current Request Lifecycle

Request
↓
Route
↓
Security Middleware
↓
Authentication Middleware
↓
Validation Middleware
↓
Controller
↓
Service
↓
Repository
↓
Database
↓
Response Utility
↓
JSON Response

---

## Current Development Phase

Phase 15 — Role-Based Access Control (RBAC)

Current goals:
- Introduce role-based authorization
- Separate authentication vs authorization responsibilities
- Add reusable authorization middleware
- Prepare permission/policy architecture foundation
- Enforce role-aware protected routes

---

## Planned Next Phase

Authorization Policy System

Future goals:
- Resource ownership authorization
- Policy-based access control
- Permission abstraction
- Fine-grained authorization flow
- Resource-level access management

---

## Database Layer

Current database stack:
- MongoDB
- Mongoose

Current architecture includes:
- Repository abstraction
- Shared BaseRepository patterns
- Pagination utilities
- Query utilities
- Reusable filtering/sorting patterns

Current database responsibilities:
- Data persistence
- Query abstraction
- Pagination-ready querying
- Reusable repository patterns

Future direction:
Controller
→ Service
→ Authorization Policy
→ Repository
→ Database