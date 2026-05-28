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

## Current Architecture Status and Active Phase Preparation

The project currently implements:

### Infrastructure
- Environment configuration validation
- MongoDB connection management

### Application Foundation
- Express application bootstrap
- Modular route registration
- API versioning support

### Error Handling
- Centralized error handling
- AppError operational error pattern
- Standardized error response contract

### Security Foundation
- Helmet integration
- CORS integration
- Request size limiting
- JWT authentication middleware

### Data Access Layer
- Repository pattern
- BaseRepository abstraction
- Pagination utilities
- Query filtering utilities

### Testing Foundation
- Jest test infrastructure
- Supertest integration testing
- Unit testing conventions

### User Management
- User module foundation
- User profile management
- Pagination-ready user listing
- User profile update workflow
- Safe user DTO mapping

### Authorization Foundation
- Role-Based Access Control (RBAC)
- Admin role support
- Authorization middleware
- Route-level authorization enforcement
- Resource ownership enforcement

### Authorization Policy System
- Policy-based authorization foundation
- Resource ownership policy evaluation
- Route-level authorization enforcement
- Policy abstraction preparation
- Resource access policy preparation

### Authentication
- JWT access token authentication
- Protected route middleware
- Authenticated user context
- Refresh token lifecycle
- Persistent session storage
- Refresh token rotation
- Session revocation
- Storage-independent session identifiers
- Token type enforcement

### Session Management
- Session model
- Session repository
- Session service
- Refresh token hash persistence
- Session revocation workflow
- Expired session TTL cleanup

### Permission Foundation
- Permission constants
- Role-to-permission mapping
- Permission evaluation helper
- Permission middleware
- Permission-aware policy checks
- Fine-grained authorization preparation

### Audit Logging Foundation
- Planned for Phase 19
- Audit log model preparation
- Audit repository preparation
- Audit service preparation
- Security-sensitive action tracking preparation

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
Authorization / Permission Middleware
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

Phase 19 — Audit Logging

Current goals:
- Audit log foundation
- Audit log model
- Audit log repository
- Audit log service
- Security-sensitive action tracking
- User/auth/admin activity audit preparation

---

## Planned Next Phase

Phase 20 — File Upload Foundation

Future goals:
- File upload middleware foundation
- File metadata model preparation
- Upload validation
- Storage abstraction preparation
- User-owned file workflow preparation

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
