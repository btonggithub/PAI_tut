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
- Audit log model
- Audit repository
- Audit service with metadata sanitization
- Security-sensitive action tracking
- Auth/user/admin activity audit events
- Non-blocking audit persistence behavior

### File Upload Foundation
- File upload middleware
- File metadata model
- File repository
- File service
- Storage abstraction
- User-owned file workflow

### Cache Layer Foundation
- In-memory cache store with TTL expiration
- Cache service wrapper for read-through caching
- Cache hit/miss/invalidation logging
- User GET endpoint caching
- File GET endpoint caching
- Cache invalidation on user updates and file uploads
- Redis-ready cache provider boundary for future distributed caching

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

---

### File Management

- File metadata persistence
- Local storage provider
- Storage abstraction layer
- Upload validation
- Ownership enforcement

---

## Upcoming Phase

### Phase 21 - Email Verification Foundation

Goals:
- Email verification workflow
- Verification token lifecycle
- Email provider abstraction
- Verification endpoints
- Verification audit integration

Future Expansion:
- Password reset
- Magic login links
- Email change verification
- Notification services